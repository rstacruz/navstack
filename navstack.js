(function(factory) {
  window.Navstack = factory();
})(function () {

  var Navstack, Pane;

  /**
   * Stack.
   */

  Navstack = function (options) {
    $.extend(this, options);
    var panes = this.panes;

    this.initializers = {};
    this.active = null;
    this.activeName = null;
    this.panes = {};
    this.stack = {};

    // Create the element, or use the given element, or create it based
    // on the given tag
    this.el = (options && options.el) ? $(options.el) : $('<div>');

    // Allow defining panes in the prototype
    if (panes) {
      for (var name in panes) {
        if (panes.hasOwnProperty(name))
          this.register(name, panes[name]);
      }
    }

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
        return;

      // Get the current pane so we can transition later
      var previous = this.active;
      var current;
      var direction = 'forward';

      // If `name` pane is in the stack, re-activate it.
      if (this.stack[name]) {
        current = this.stack[name];
        var idx = {
          previous: this.stackIndexOf(this.active.name),
          current: this.stackIndexOf(name)
        };

        if (idx.current < idx.previous)
          direction = 'backward';
      }
      // Else, initialize it.
      else {
        // Create it
        var $pane = $(this.paneEl);
        $pane.attr('data-stack-pane', name);
        $(this.el).append($pane);

        // Initialize it
        current = this.panes[name];
        if (!current) throw "Navstack: Unknown pane: "+name;
        current.init($pane[0]);

        // Register as current
        this.stack[name] = current;
      }

      this.active = current;

      // First panes don't transition like the rest.
      if (!previous) direction = 'first';

      // Transition
      var transition = this.transition;
      transition.before(direction, current, previous, function () {
        $(document).queue(function (next) {
          transition.run(direction, current, previous, function () {
            transition.after(direction, current, previous, next);
          });
        });
      });

      return (current && current.view);
    },

    push: function (name, fn) {
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
     * Uses an initializer (registered with `register()`) to initialize a pane.
     * Returns a view object.
     */

    _useInitializer: function (init, $el) {
      return init.apply(this, $el);
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

  Navstack.transitions = {
    css: function (prefix) {
      return {
        before: function (direction, current, previous, next) {
          console.log('before', direction);
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
          console.log('run', direction);

          if (previous)
            $(previous.el).find('>*')
              .removeClass(prefix+'-hide')
              .addClass(prefix+'-exit-'+direction);

          $(current.el).find('>*')
            .removeClass(prefix+'-hide')
            .addClass(prefix+'-enter-'+direction)
            .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
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
    }
  };

  return Navstack;

});
