/**
 * Navstack
 * https://github.com/rstacruz/navstack
 *
 * Manages a stack of multiple views.
 */

(function(factory) {

  if (typeof module === 'object')
    module.exports = factory();
  else
    window.Navstack = factory();

})(function () {

  var Navstack, Pane;

  /**
   * A stack.
   */

  Navstack = function (options) {
    $.extend(this, options);

    this.initializers = {};
    this.active = null;
    this.activeName = null;
    this.panes = {};
    this.stack = {};

    // Create the element, or use the given element, or create it based
    // on the given tag
    this.el = (options && options.el) ? $(options.el) : $('<div>');

    $(this.el).attr('data-stack', true);
    this.init(options);
  };

  /**
   * Creates a new Navstack
   */

  Navstack.extend = function (proto) {
    var klass = function() { Navstack.apply(this, arguments); };
    $.extend(klass.prototype, Navstack.prototype, proto);
    return klass;
  };

  Navstack.prototype = {
    paneEl: "<div>",

    /**
     * Constructor
     */

    init: function () {},

    /**
     * Registers a pane `name` with initializer function `fn`.
     */

    register: function (name, fn) {
      this.initializers[name] = fn;
      this.panes[name] = new Pane(name, fn, this);
    },

    /**
     * Switches to a given pane `name`.
     */

    go: function (name) {
      // Switching to the same thing? No need to do anything
      if (this.active && this.active.name === name)
        return this.active.view;

      // Get the current pane so we can transition later
      var previous = this.active;
      var current;

      // Spawn the pane if it hasn't been spawned before
      if (!this.stack[name])
        this.stack[name] = this._spawnPane(name);

      current = this.stack[name];
      direction = this._getDirection(this.active, name);

      // Register a new 'active' pane
      this.active = current;

      // Perform the transition
      var transition = this._getTransition(this.transition);
      this._performTransition(transition, direction, current, previous);

      return (current && current.view);
    },

    /**
     * Registers a pane.
     */

    push: function (name, fn) {
      if (!this.panes[name])
        this.register(name, fn);

      return this.go(name);
    },

    /**
     * Pane transition
     */

    transition: {
      before: function (direction, current, previous, next) {
        if (current)  $(current.el).hide();
        return next();
      },
      run: function (direction, current, previous, next) {
        if (current)  $(current.el).show();
        if (previous) $(previous.el).hide();
        return next();
      },
      after: function (direction, current, previous, next) {
        return next();
      }
    },

    /**
     * Returns the names of the things in the stack.
     */

    stackKeys: function () {
      return Object.keys(this.stack);
    },

    /**
     * Length
     */

    stackLength: function () {
      return this.stackKeys().length;
    },

    /**
     * Finds the index of each.
     *
     *     stackIndexOf('home')
     */

    stackIndexOf: function (name) {
      return this.stackKeys().indexOf(name);
    },

    /**
     * Removes and destroys
     */

    remove: function () {
      $(this.el).remove();
    },

    /**
     * Alias for `remove` (to make Navstack behave a bit more like Ractive
     * components).
     */

    teardown: function () {
      return this.remove.apply(this, arguments);
    },

    /**
     * (Internal) Uses an initializer (registered with `register()`)
     * to initialize a pane. Returns a view object.
     */

    _useInitializer: function (init, $el) {
      return init.apply(this, $el);
    },

    _getDirection: function (from, to) {
      if (!from) return 'first';

      var idx = {
        previous: this.stackIndexOf(from),
        current: this.stackIndexOf(to)
      };

      if (idx.current < idx.previous)
        return 'backward';
      else
        return 'forward';
    },

    /**
     * (Internal) Spawns the pane of a given `name`.
     */

    _spawnPane: function (name) {
      // Create the element.
      var $pane = $(this.paneEl);
      $pane.attr('data-stack-pane', name);
      $(this.el).append($pane);

      // Get the pane (previously .register()'ed) and initialize it.
      var current = this.panes[name];
      if (!current) throw new Error("Navstack: Unknown pane: "+name);
      current.init($pane[0]);

      return current;
    },

    /**
     * (Internal) get the transition object for the given string `trans`.
     * Throws an error if it's invalid.
     */

    _getTransition: function (transition) {
      if (typeof transition === 'string') {
        transition = (this.transitions && this.transitions[transition]) ||
          Navstack.transitions[transition];
      }

      if (typeof transition !== 'object')
        throw new Error("Navstack: invalid 'transition' value");

      return transition;
    },

    /**
     * (Internal) performs a transition with the given `transition` object.
     */

    _performTransition: function (transition, direction, current, previous) {
      transition.before(direction, current, previous, function () {
        $(document).queue(function (next) {
          transition.run(direction, current, previous, function () {
            transition.after(direction, current, previous, next);
          });
        });
      });
    }

  };

  /**
   * Pane.
   *
   *     pane.name
   *     pane.initializer  // function
   *     pane.el
   *     pane.view
   */

  Pane = Navstack.Pane = function (name, initializer, parent) {
    /** The identification `name` of this pane, as passed to `register()`. */
    this.name = name;

    /** Function to create the view. */
    this.initializer = initializer;

    /** Reference to `Navstack`. */
    this.parent = parent;

    /** DOM element. Created on `init()`. */
    this.el = null;

    /** View instance as created by initializer. Created on `init()`. */
    this.view = null;
  };

  Pane.prototype = {
    /**
     * Initializes the pane's view if needed.
     */

    init: function (el) {
      if (!this.isInitialized()) this.forceInit(el);
    },

    /**
     * Forces initialization even if it hasn't been yet.
     */

    forceInit: function (el) {
      this.el = el;
      this.view = this.initializer.call(this.parent, el);
    },

    isInitialized: function () {
      return !! this.el;
    }
  };

  /**
   * For transitions
   */

  Navstack.buildTransition = function (prefix) {
    return {
      before: function (direction, current, previous, next) {
        if (direction !== 'first' && current)
          $(current.el).find('>*')
            .addClass(prefix+'-hide');

        return next();
      },

      after: function (direction, current, previous, next) {
        return next();
      },

      run: function (direction, current, previous, next) {
        if (direction === 'first') return next();
        var $parent =
          current ? $(current.el).parent() :
          previous ? $(previous.el).parent() : null;

        $parent.addClass(prefix+'-container');

        if (previous)
          $(previous.el).find('>*')
            .removeClass(prefix+'-hide')
            .addClass(prefix+'-exit-'+direction);

        $(current.el).find('>*')
          .removeClass(prefix+'-hide')
          .addClass(prefix+'-enter-'+direction)
          .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
            $parent.removeClass(prefix+'-container');

            if (previous)
              $(previous.el).find('>*')
                .addClass(prefix+'-hide')
                .removeClass(prefix+'-exit-'+direction);

            $(current.el).find('>*')
              .removeClass(prefix+'-enter-'+direction);

            next();
          });
      }
    };
  };

  /**
   * Transitions
   */

  Navstack.transitions = {
    slide: Navstack.buildTransition('slide'),
    modal: Navstack.buildTransition('modal'),
    flip: Navstack.buildTransition('flip')
  };

  return Navstack;

});
