/* jshint es3: true */
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
   *
   *     nav = new Navstack();
   */

  Navstack = function (options) {
    /** Registry of pane transitions.
     *  A local version of `Navstack.transitions`. */
    this.transitions = {};

    /** Registry of suitable adaptors.
     *  A local version of `Navstack.adaptors`. */
    this.adaptors = {};

    $.extend(this, options);

    /** Index of panes that have been registered with this Navstack.
     *  Object with pane names as keys and `Pane` instances as values.
     *
     *      nav.push('home', function () { ... });
     *
     *      nav.panes['home']
     *      nav.panes['home'].name
     *      nav.panes['home'].el
     *      nav.panes['home'].view
     */
    this.panes = {};

    /** Alias for the active pane. Same as `nav.pane[nav.activeName]`. This is
     *  a `Pane` instance. */
    this.active = null;

    /** Name of the active pane. */
    this.activeName = null;

    /** Ordered array of pane names of what are the actively. */
    this.stack = [];

    /** (Internal) event emitter. */
    this.emitter = $({});

    // Create the element, or use the given element, or create it based
    // on the given tag
    this.el = (options && options.el) ? $(options.el) : $('<div>');

    $(this.el).attr('data-stack', true);
    this.init(options);
  };

  /**
   * Subclasses Navstack to create your new Navstack class.
   */

  Navstack.extend = function (proto) {
    var klass = function() { Navstack.apply(this, arguments); };
    $.extend(klass.prototype, Navstack.prototype, proto);
    return klass;
  };

  Navstack.prototype = {
    paneEl: "<div>",

    /**
     * Constructor. Override me.
     *
     *     var MyStack = Navstack.extend({
     *       init: function() {
     *         // initialize here
     *       }
     *     });
     */

    init: function () {},

    /**
     * Registers a pane `name` with initializer function `fn`, allowing you to
     * use `.go()` on the registered pane later.
     *
     * This is called on `.push`.
     */

    register: function (name, fn) {
      this.panes[name] = new Pane(name, fn, this);
    },

    /**
     * Events
     */

    on: function (event, handler) {
      this.emitter.on(event, $.proxy(handler, this));
      return this;
    },

    off: function (event, handler) {
      this.emitter.off(event, $.proxy(handler, this));
      return this;
    },

    one: function (event, handler) {
      this.emitter.one(event, $.proxy(handler, this));
      return this;
    },

    /**
     * Switches to a given pane `name`.
     */

    go: function (name) {
      // Switching to the same thing? No need to do anything
      if (this.active && this.active.name === name)
        return this.active.view;

      if (!this.panes[name])
        throw new Error("Navstack: unknown pane '"+name+"'");

      // Get the current pane so we can transition later
      var previous = this.active;

      // Spawn the pane if it hasn't been spawned before
      if (!this.panes[name].el) {
        this._spawnPane(name);
      }

      var current = this.panes[name];

      // Insert into stack
      this._insertIntoStack(current);

      // Register a new 'active' pane
      this.active = current;

      // Perform the transition
      var direction = this._getDirection(previous, current);
      var transition = this._getTransition(this.transition);
      this._runTransition(transition, direction, current, previous);

      // Event
      this.emitter.trigger($.Event('transition', {
        direction: direction,
        current: current,
        previous: previous
      }));

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
     * Removes and destroys
     */

    remove: function () {
      this.emitter.trigger('remove');
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
     * Returns the adaptors
     */

    getAdaptors: function () {
      var adapt = this.adapt || Navstack.adapt;
      var nav = this;

      return map(adapt, function(name) {
        var adaptor = (nav.adaptors && nav.adaptors[name]) ||
          Navstack.adaptors[name];

        if (!adaptor)
          console.warn("Navstack: unknown adaptor '" + name + "'");

        return adaptor;
      });
    },

    /**
     * Wraps the given `obj` object with a suitable adaptor.
     *
     *     view = new Backbone.View({ ... });
     *     adaptor = nav.getAdaptorFor(view);
     *
     *     adaptor.el()
     *     adaptor.remove()
     */

    getAdaptorFor: function (obj) {
      var adaptors = this.getAdaptors();

      for (var i=0; i < adaptors.length; ++i) {
        var adaptor = adaptors[i];

        if (adaptor.filter(obj))
          return adaptor.wrap(obj, this);
      }

      throw new Error("Navstack: no adaptor found. Try returning an object with an 'el' property.");
    },

    /**
     * (Internal) Uses an initializer (registered with `register()`)
     * to initialize a pane. Returns a view object.
     */

    _useInitializer: function (init, $el) {
      return init.apply(this, $el);
    },

    /**
     * (Internal) Returns the direction of animation based on the
     * indices of panes `from` and `to`.
     *
     *     // Going to a pane
     *     this._getDirection('home', 'timeline')
     *     => 'forward'
     *
     *     // Going from a pane
     *     this._getDirection('timeline', 'home')
     *     => 'backward'
     *
     *     // Pane objects are ok too
     *     this._getDirection(this.pane['home'], this.pane['timeline']);
     */

    _getDirection: function (from, to) {
      if (!from) return 'first';

      var idx = {
        from: this.stack.indexOf((from && from.name) || from),
        to:   this.stack.indexOf((to && to.name) || to)
      };

      if (idx.to < idx.from)
        return 'backward';
      else
        return 'forward';
    },

    /**
     * (Internal) Spawns the pane of a given `name`.
     * Returns the pane instance.
     */

    _spawnPane: function (name) {
      // Create the element.
      // var $pane = $(this.paneEl);
      // $pane.attr('data-stack-pane', name);
      // $(this.el).append($pane);

      // Get the pane (previously .register()'ed) and initialize it.
      var current = this.panes[name];
      if (!current) throw new Error("Navstack: Unknown pane: "+name);
      current.init();//$pane[0]);

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

    _runTransition: function (transition, direction, current, previous) {
      transition.before(direction, current, previous, function () {
        $(document).queue(function (next) {
          transition.run(direction, current, previous, function () {
            transition.after(direction, current, previous, next);
          });
        });
      });
    },

    /**
     * (Internal) updates `this.stack` to include `pane`, taking into
     * account Z indices.
     *
     *     pane = this.pane['home'];
     *     this._insertIntoStack(pane);
     */

    _insertIntoStack: function (pane) {
      var name = pane.name;
      if (this.stack.indexOf(name) > -1) return;

      this.stack.push(pane.name);
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

    /** A wrapped version of the `view` */
    this.adaptor = null;
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
      var fn = this.initializer;

      if (typeof fn !== 'function')
        throw new Error("Navstack: pane initializer is not a function");

      if (fn.length === 0) {
        // Let the initializer create the element, just use it afterwards.
        this.view = this.initializer.call(this.parent);
        this.el = this.view.el;
      } else {
        // Create the DOM element as needed.
        if (!navigator.test)
          console.warn("Navstack: creating an element on the fly is going to be deprecated.");

        var $pane = $(this.parent.paneEl);
        this.view = this.initializer.call(this.parent, $pane);
        this.adaptor = this.parent.getAdaptorFor(this.view);
        this.el = this.adaptor.el();
      }

      $(this.parent.el).append(this.el);
      this.el.attr('data-stack-pane', this.name);
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

  Navstack.adaptors = {
    /* Generic filter, suitable for Backbone and Ractive */
    generic: {
      filter: function (obj) {
        return typeof obj === 'object' && obj.el;
      },

      wrap: function (obj, self) {
        return {
          el: function () { return obj.el; },
          remove: function () { return obj.remove.apply(obj); }
        };
      }
    }
  };

  Navstack.adapt = ['generic'];

  /*
   * Helpers
   */

  function map (obj, fn) {
    if (obj.map) return obj.map(fn);
    else throw new Error("Todo: implement map shim");
  }

  return Navstack;

});
