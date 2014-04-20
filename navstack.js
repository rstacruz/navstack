/* jshint es3: true */
/*
 * Navstack
 * https://github.com/rstacruz/navstack
 *
 * Manages a stack of multiple views.
 */

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory); /* AMD */
  } else if (typeof exports === 'object') {
    factory(jquery()); /* CommonJS */
  } else {
    root.Navstack = factory(jquery()); /* Globals */
  }

  function jquery() {
    var $ = (typeof require === 'function' && require('jquery')) || root.jQuery || root.$ || null;
    if (!$) throw new Error("Navstack: jQuery not found.");
    return $;
  }

})(this, function ($) {

  var Navstack, Pane;

  /***
   * Navstack : new Navstack(options)
   * A stack. Instanciate a new stack:
   *
   *     nav = new Navstack();
   *
   * You may pass these options:
   *
   * ~ el: a selector, a jQuery object, or a DOM element.
   */

  Navstack = function (options) {
    /**
     * transitions:
     * Registry of pane transitions.
     * A local version of `Navstack.transitions`.
     */

    this.transitions = {};

    /**
     * adaptors:
     * Registry of suitable adaptors.
     * A local version of `Navstack.adaptors`.
     */

    this.adaptors = {};

    $.extend(this, options);

    /**
     * panes:
     * Index of panes that have been registered with this Navstack.
     * Object with pane names as keys and `Pane` instances as values.
     *
     *     nav.push('home', function () { ... });
     *
     *     nav.panes['home']
     *     nav.panes['home'].name
     *     nav.panes['home'].el
     *     nav.panes['home'].view
     */
    this.panes = {};

    /** active: Alias for the active pane. This is a `Pane` instance. */
    this.active = null;

    /** stack:
     * Ordered array of pane names of what are the actively. */
    this.stack = [];

    /** emitter:
     * (Internal) event emitter. */
    this.emitter = $({});

    /** el:
     * The DOM element.
     *
     *       $(nav.el).show()
     */
    this.el = (options && options.el) ? $(options.el) : $('<div>');

    $(this.el)
      .attr('data-stack', true)
      .addClass('-navstack');

    this.init(options);
  };

  Navstack.prototype = {
    /**
     * init:
     * Constructor. Override me.
     *
     *   var MyStack = Navstack.extend({
     *     init: function() {
     *       // initialize here
     *     }
     *   });
     */

    init: function () {},

    /**
     * Events:
     * There's events. Available events are:
     *
     * ~ remove: called when removing
     */

    /**
     * on : .on(event, function)
     * Binds an event handler.
     *
     *     nav.on('remove', function() {
     *       // do things
     *     });
     */

    on: function (event, handler) {
      this.emitter.on(event, $.proxy(handler, this));
      return this;
    },

    /**
     * off : .off(event, callback)
     * Removes an event handler.
     *
     *     nav.off('remove', myfunction);
     */

    off: function (event, handler) {
      this.emitter.off(event, $.proxy(handler, this));
      return this;
    },

    /**
     * one : .one(event, callback)
     * Works like `.on`, except it unbinds itself right after.
     */

    one: function (event, handler) {
      this.emitter.one(event, $.proxy(handler, this));
      return this;
    },

    /**
     * push : .push(name, [fn])
     * Registers a pane.
     *
     *     nav.push('home', function() {
     *       return $("<div>...</div>");
     *     });
     */

    push: function (name, options, fn) {
      if (arguments.length === 2) {
        fn = options;
        options = undefined;
      }

      if (!this.panes[name]) {
        if (!fn) throw new Error("Navstack: unknown pane '" + name + "'");
        this.register(name, options, fn);
      }

      return this.go(name);
    },

    /**
     * go : .go(name)
     * (internal) Switches to a given pane `name`.
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
        this.spawnPane(name);
      }

      var current = this.panes[name];

      // Insert into stack
      if (this.stack.indexOf(name) === -1) {
        this.purgeObsolete();
        this.insertIntoStack(current);
      }

      // Register a new 'active' pane
      this.active = current;

      // Perform the transition
      var direction = this.getDirection(previous, current);

      // determine transition
      var transName;
      if (direction === 'forward') transName = current.transition;
      else if (direction === 'backward') transName = previous.transition;
      if (!transName) transName = this.transition;

      // use transition
      var transition = this.getTransition(transName);
      this.runTransition(transition, direction, current, previous);

      // Event
      this.emitter.trigger($.Event('transition', {
        direction: direction,
        current: current,
        previous: previous
      }));

      return (current && current.view);
    },

    /**
     * transition: Object
     * Pane transition.
     */

    transition: function (direction, current, previous) {
      return {
        before: function(next) {
          if (current)  $(current.el).hide();
          return next();
        },
        run: function(next) {
          if (current)  $(current.el).show();
          if (previous) $(previous.el).hide();
          return next();
        },
        after: function (next) {
          return next();
        }
      };
    },

    /**
     * remove:
     * Removes and destroys the Navstack.
     */

    remove: function () {
      // TODO: destroy each pane
      this.emitter.trigger('remove');
      $(this.el).remove();
    },

    /**
     * teardown:
     * Alias for `remove` (to make Navstack behave a bit more like Ractive
     * components).
     */

    teardown: function () {
      return this.remove.apply(this, arguments);
    },

    /**
     * getAdaptors:
     * Returns the adaptors available.
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
     * getAdaptorFor : .getAdaptorFor(obj)
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

        if (adaptor.filter(obj)) {
          var wrapped = adaptor.wrap(obj, this);
          wrapped.adaptor = adaptor;
          return wrapped;
        }
      }

      throw new Error("Navstack: no adaptor found");
    },

    /**
     * purgePane:
     * (internal) Purges a given pane.
     *
     *     this.purgePane('home');
     *     this.purgePane(this.panes['home']);
     */

    purgePane: function (name, options) {
      var pane = typeof name === 'string' ?
        this.panes[name] : name;

      // if pane doesn't exist: act like it was removed
      if (!pane) return;

      name = pane.name;

      // emit events
      this.emitter.trigger('purge', pane);
      this.emitter.trigger('purge:'+name, pane);

      // remove from DOM
      this.panes[name].adaptor.remove();
      delete this.panes[name];

      // remove from stack
      var idx = this.stack.indexOf(name);
      if (idx > -1) this.stack.splice(idx, 1);
    },

    /*
     * (Internal) Purges any panes that are not needed.
     */

    purgeObsolete: function () {
      if (!this.active) return;

      var idx = this.stack.indexOf(this.active.name);

      for (var i = this.stack.length; i>idx; i--) {
        this.purgePane(this.stack[i]);
      }
    },

    /**
     * getDirection : .getDirection(from, to)
     * (internal) Returns the direction of animation based on the
     * indices of panes `from` and `to`.
     *
     *     // Going to a pane
     *     this.getDirection('home', 'timeline')
     *     => 'forward'
     *
     *     // Going from a pane
     *     this.getDirection('timeline', 'home')
     *     => 'backward'
     *
     *     // Pane objects are ok too
     *     this.getDirection(this.pane['home'], this.pane['timeline']);
     */

    getDirection: function (from, to) {
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
     * spawnPane : .spawnPane(name)
     * (internal) Spawns the pane of a given `name`.
     * Returns the pane instance.
     */

    spawnPane: function (name) {
      // Get the pane (previously .register()'ed) and initialize it.
      var current = this.panes[name];
      if (!current) throw new Error("Navstack: Unknown pane: "+name);
      current.init();

      return current;
    },

    /**
     * getTransition : .getTransition(transition)
     * (internal) get the transition object for the given string `transition`.
     * Throws an error if it's invalid.
     */

    getTransition: function (transition) {
      if (typeof transition === 'string') {
        transition = (this.transitions && this.transitions[transition]) ||
          Navstack.transitions[transition];
      }

      if (typeof transition !== 'function')
        throw new Error("Navstack: invalid 'transition' value");

      return transition;
    },

    /**
     * runTransition : .runTransition(...)
     * (internal) performs a transition with the given `transition` object.
     */

    runTransition: function (transitionFn, direction, current, previous) {
      var transition = transitionFn(direction, current, previous);
      transition.before(function () {
        Navstack.queue(function (next) {
          transition.run(function () {
            transition.after(next);
          });
        });
      });
    },

    /**
     * insertIntoStack : .insertIntoStack(pane)
     * (internal) updates `this.stack` to include `pane`, taking into
     * account Z indices.
     *
     *     pane = this.pane['home'];
     *     this.insertIntoStack(pane);
     */

    insertIntoStack: function (pane) {
      var name = pane.name;
      if (this.stack.indexOf(name) > -1) return;

      this.stack.push(pane.name);
    },

    /**
     * register : .register(name, options, fn)
     * (internal) Registers a pane `name` with initializer function `fn`,
     * allowing you to use `.go()` on the registered pane later.
     *
     * This is called on `.push`.
     */

    register: function (name, options, fn) {
      if (arguments.length === 2) {
        fn = options;
        options = undefined;
      }

      this.panes[name] = new Pane(name, options, fn, this);
    }

  };

  /**
   * extend:
   * Subclasses Navstack to create your new Navstack class.
   *
   *     var Mystack = Navstack.extend({
   *     });
   */

  Navstack.extend = function (proto) {
    var klass = function() { Navstack.apply(this, arguments); };
    $.extend(klass.prototype, Navstack.prototype, proto);
    return klass;
  };


  /***
   * Navstack.Pane:
   * A pane. Panes are accessible via `navstack.panes['name']` or
   * `navstack.active`. You'll find these properties:
   *
   *     pane.name
   *     pane.initializer  // function
   *     pane.el
   *     pane.view
   */

  Pane = Navstack.Pane = function (name, options, initializer, parent) {
    /**
     * name: The identification `name` of this pane, as passed to [push()] and
     * [register()].
     */

    this.name = name;

    /**
     * transition: the transition to use for this pane. (String)
     */

    this.transition = (options && options.transition);

    /**
     * zIndex: determines the position in the stack. (Number)
     */

    this.zIndex = (options && options.zIndex);

    /** initializer: Function to create the view. */
    this.initializer = initializer;

    /** parent: Reference to `Navstack`. */
    this.parent = parent;

    /** el: DOM element. Created on `init()`. */
    this.el = null;

    /** view: View instance as created by initializer. Created on `init()`. */
    this.view = null;

    /** adaptor: A wrapped version of the `view` */
    this.adaptor = null;
  };

  Pane.prototype = {
    /**
     * init:
     * (internal) Initializes the pane's view if needed.
     */

    init: function () {
      if (!this.isInitialized()) this.forceInit();
    },

    /**
     * forceInit:
     * (internal) Forces initialization even if it hasn't been yet.
     */

    forceInit: function () {
      var fn = this.initializer;

      if (typeof fn !== 'function')
        throw new Error("Navstack: pane initializer is not a function");

      // Let the initializer create the element, just use it afterwards.
      this.view = this.initializer.call(this.parent);
      this.adaptor = this.parent.getAdaptorFor(this.view);
      this.el = this.adaptor.el();

      if (!this.el)
        throw new Error("Navstack: no element found");

      $(this.el)
        .attr('data-stack-pane', this.name)
        .addClass('-navstack-pane')
        .appendTo(this.parent.el);
    },

    isInitialized: function () {
      return !! this.el;
    }
  };

  /***
   * Static members:
   * These are static members you can access from the global `Navstack` object.
   */

  /**
   * Navstack.buildTransition: buildTransition(prefix)
   * (internal) builds a transition for the given `prefix`.
   */

  Navstack.buildTransition = function (prefix) {
    // scroll-stopper
    var noscroll = function (e) { e.preventDefault(); };

    return function (direction, current, previous) {
      var $current = $(current && current.el);
      var $previous = $(previous && previous.el);
      var $parent =
        current ? $(current.el).parent() :
        previous ? $(previous.el).parent() : null;

      var hide    = prefix + '-hide',
        container = prefix + '-container',
        enter     = prefix + '-enter-' + direction,
        exit      = prefix + '-exit-' + direction,
        animationend = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

      return {
        before: function (next) {
          if (direction !== 'first')
            $current.addClass(hide);

          // Do transitions on next browser tick so that any DOM elements that
          // need rendering will take its time
          return setTimeout(next, 0);
        },

        after: function (next) {
          $(document).off('touchmove', noscroll);
          return next();
        },

        run: function (next) {
          if (direction === 'first') return next();

          // prevent scrolling while transitions are working
          $(document).on('touchmove', noscroll);

          var after = once(function() {
            $parent.removeClass(container);
            $previous.addClass(hide).removeClass(exit);
            $current.removeClass(enter);
            setTimeout(next, 0);
          });

          $parent
            .addClass(container);
          $previous
            .removeClass(hide).addClass(exit)
            .one(animationend, after);
          $current
            .removeClass(hide).addClass(enter)
            .one(animationend, after);
        }
      };
    };
  };

  /**
   * Navstack.transitions:
   * The global transitions registry. It's an Object where transition functions are
   * stored.
   *
   * Whenever a transition is used on a Navstack (eg, with `new Navstack({
   * transition: 'foo' })`), it is first looked up in the stack's own registry
   * ([transitions]). If it's not found there, it's then looked up in the
   * global transitions registry, `Navstack.transitions`.
   *
   * You can define your own transitions via:
   *
   *     Navstack.transitions.foo = function (direction, previous, current) {
   *
   *       // this function should return an object with 3 keys: `before`,
   *       // `run`, and `after`. Each of them are asynchronous functions
   *       // that will perform different phases of the transition.
   *       //
   *       // you can use the arguments:
   *       //
   *       //   direction - this is either "first", "forward", or "backward".
   *       //   previous  - the previous pane. This an instance of [Pane].
   *       //   current   - the pane to transition to.
   *
   *       return {
   *         before: function (next) {
   *           // things to perform in preparation of a transition,
   *           // such as hide the current pane.
   *           // invoke next() after it's done.
   *
   *           if (current) $(current.el).hide();
   *           next();
   *         },
   *
   *         run: function (next) {
   *           // run the actual transition.
   *           // invoke next() after it's done.
   *
   *           if (current)  $(current.el).show();
   *           if (previous) $(previous.el).hide();
   *           next();
   *         },
   *
   *         after: function (next) {
   *           // things to perform after running the transition.
   *           // invoke next() after it's done.
   *           next();
   *         }
   *       }
   *     };
   */

  Navstack.transitions = {
    slide: Navstack.buildTransition('slide'),
    modal: Navstack.buildTransition('modal'),
    flip: Navstack.buildTransition('flip')
  };

  /**
   * Navstack.queue:
   * (internal) Queues animations.
   */

  Navstack.queue = function (fn) {
    $(document).queue(fn);
  };

  /**
   * Navstack.adaptors:
   * Adaptors registry.
   */

  Navstack.adaptors = {};

  /**
   * buildAdaptor:
   * (internal) Helper for building a generic filter
   */

  function buildAdaptor (options) {
    return {
      filter: function (obj) {
        return typeof obj === 'object' && options.check(obj);
      },

      wrap: function (obj, nav) {
        return {
          el: function () { return options.el(obj); },
          remove: function () { return options.remove(obj); }
        };
      }
    };
  }

  /*
   * Backbone adaptor
   */

  Navstack.adaptors.backbone = buildAdaptor({
    el: function (obj) { return obj.el; },
    check: function (obj) {
      return (typeof obj.remove === 'function') && (typeof obj.el === 'object');
    },
    remove: function (obj) { return obj.remove(); }
  });

  /*
   * Ractive adaptor
   */

  Navstack.adaptors.ractive = buildAdaptor({
    el: function (obj) { return obj.find('*'); },
    check: function (obj) {
      return (typeof obj.teardown === 'function') && (typeof obj.el === 'object');
    },
    remove: function (obj) { return obj.teardown(); }
  });

  /*
   * React.js adaptor
   */

  Navstack.adaptors.react = buildAdaptor({
    el: function (obj) { return obj.getDOMNode(); },
    check: function (obj) { return (typeof obj.getDOMNode === 'function'); },
    remove: function (obj) { return window.React.unmountComponentAtNode(obj.getDOMNode()); }
  });


  /*
   * Generic adaptor. Accounts for any object that gives off an `el` property.
   */

  Navstack.adaptors.jquery = buildAdaptor({
    el: function (obj) { return $(obj); },
    check: function (obj) { return $(obj)[0].nodeType === 1; },
    remove: function (obj) { return $(obj).remove(); }
  });

  Navstack.adapt = ['backbone', 'ractive', 'react', 'jquery'];

  /*
   * Helpers
   */

  function map (obj, fn) {
    if (obj.map) return obj.map(fn);
    else throw new Error("Todo: implement map shim");
  }

  function once (fn) {
    var ran, value;
    return function () {
      if (ran) return value;
      ran = true;
      value = fn.apply(this, arguments);
      return value;
    };
  }

  /**
   * Navstack.version:
   * A string of the version of Navstack.
   */

  Navstack.version = '0.1.2';

  return Navstack;

});
