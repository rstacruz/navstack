/* jshint es3: true, expr: true */
/* globals define */
/*
 * Navstack
 * https://github.com/rstacruz/navstack
 *
 * Manages a stack of multiple views.
 */

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory); /* AMD */
  } else if (typeof exports === 'object') {
    module.exports = factory(); /* CommonJS */
  } else {
    root.Navstack = factory(); /* Globals */
  }

})(this, function () {

  var Navstack, Pane, setImmediate, Queue;

  /***
   * Navstack : new Navstack(options)
   * Instanciates a new Navstack stage that manages multiple panes.
   *
   *     stage = new Navstack({
   *       el: '#stack'
   *     });
   *
   * You may pass any of these options below. All of them are optional.
   *
   * ~ el: a selector, a jQuery object, or a DOM element.
   * ~ transition: a string of the transition name to use.
   * ~ groupTransition: a string of the transition to use in between groups.
   *
   * You'll then use [push] to add panes into the stage.
   *
   *     stage.push('home', function () {
   *       return $("<div>Hello</div>");
   *     });
   */

  Navstack = function (options) {
    /*** Attributes: */

    extend(this, options);

    /**
     * transitions:
     * (private) Registry of pane transitions.
     * A local version of `Navstack.transitions`.
     */

    if (typeof this.transitions === 'undefined')
      this.transitions = {};

    /**
     * adaptors:
     * (private) Registry of suitable adaptors.
     * A local version of `Navstack.adaptors`.
     */

    if (typeof this.adaptors === 'undefined')
      this.adaptors = {};

    /**
     * panes:
     * Index of panes that have been registered with this Navstack.
     * Object with pane names as keys and [Pane] instances as values.
     *
     *     stage.push('home', function () { ... });
     *
     *     stage.panes['home']
     *     stage.panes['home'].name   //=> 'home'
     *     stage.panes['home'].el     //=> DOMElement
     *     stage.panes['home'].view
     */
    this.panes = {};

    /**
     * active:
     * A reference to the active pane. This is a [Navstack.Pane] instance.
     *
     *     stage.push('home', function() { ... });
     *
     *     // later:
     *     stage.active.name   //=> 'home'
     *     stage.active.el     //=> DOMElement
     *     stage.active.view
     *
     * It is a pointer to the active pane in the [panes] object.
     *
     *     stage.push('home', function() { ... });
     *
     *     // later:
     *     stage.active === stage.panes['home']
     */

    this.active = null;

    /**
     * stack:
     * Ordered array of pane names of what are the panes present in the stack.
     * When doing [push()], you are adding an item to the stack.
     *
     *     stage.push('home', function() { ... });
     *     stage.stack
     *     => ['home']
     *
     *     stage.push('timeline', function() { ... });
     *     stage.stack
     *     => ['home', 'timeline']
     */

    this.stack = [];

    /** emitter: (internal) event emitter. */
    this.emitter = new Emitter();

    /**
     * transition:
     * The transition name to be used. Defaults to `"slide"`.  This can either
     * be a *String* (a transition name), a *Function*, or `false` (no animations).
     *
     *     stage = new Navstack({
     *       transition: 'slide',
     *       groupTransition: 'modal'
     *     });
     *
     *     // the second push here will use the slide animation.
     *     stage.push('home', function() { ... });
     *     stage.push('mentions', function() { ... });
     *
     *     // this will use the modal transition, as its in a different group.
     *     stage.push('auth!login', function() { ... });
     */

    if (typeof this.transition === 'undefined')
      this.transition = 'slide';

    /**
     * groupTransition:
     * Pane transition to use in between groups. Defaults to `"modal"`.
     * See [transition](#transition) for more details.
     */

    if (typeof this.groupTransition === 'undefined')
      this.groupTransition = 'modal';

    /** el:
     * The DOM element of the stack.  You may specify this while creating a
     * Navstack instance. When no `el` is given, it will default to creating a
     * new `<div>` element.
     *
     *     stage = new Navstack({
     *       el: document.getElementById('#box')
     *     });
     *
     * You may also pass a jQuery object here for convenience.
     *
     *     stage = new Navstack({
     *       el: $('#box')
     *     });
     *
     * You can access this later in the `Navstack` instance:
     *
     *     $(stage.el).show()
     */

    if (typeof this.el === 'undefined')
      this.el = document.createElement('DIV');

    // Un-jQuery the element.
    if (this.el[0]) this.el = this.el[0];

    addClass(this.el, '-navstack');
    attr(this.el, 'data-stack', true);

    this.init(options);
  };

  Navstack.prototype = {
    /*** Methods: */

    /**
     * push : .push(name, [options], [fn])
     * Registers a pane with the given `name`.
     *
     * The function will specify the initializer that will return the view to
     * be pushed. It can return a DOM node, a [jQuery] object, a [Backbone] view,
     * [Ractive] instance, or a [React] component.
     *
     *     stage.push('home', function() {
     *       return $("<div>...</div>");
     *     });
     *
     * You can specify a pane's group by prefixing the name with the group name
     * and a bang.
     *
     *     stage.push('modal!form', function() {
     *       return $("<div>...</div>");
     *     });
     *
     * You can specify options.
     *
     *     stage.push('home', { group: 'root' }, function() {
     *       return $("<div>...</div>");
     *     });
     *
     * Available options are (all are optional):
     *
     * ~ group (String): the group name that the pane should belong to.
     * ~ transition (String): the name of the transition to use. See [Navstack.transitions].
     */

    push: function (name, options, fn) {
      // support .push(name, fn) as well
      if (!fn && typeof options === 'function') {
        fn = options;
        options = undefined;
      }

      // support .push(name, { group: x })
      if (options && options.group) {
        name = options.group + "!" + name;
        delete options.group;
      }

      if (!this.panes[name]) {
        if (!fn) throw new Error("Navstack: pane '" + name + "' has no initializer function provided");
        this.register(name, {}, fn);
      }

      return this.go(name, options);
    },

    /**
     * init:
     * Constructor. You may override this function when subclassing via
     * [Navstack.extend] to run some code when subclassed stack is
     * instanciated.
     *
     *   var MyStack = Navstack.extend({
     *     init: function() {
     *       // initialize here
     *     }
     *   });
     */

    init: function () {},

    /**
     * go : .go(name, [options])
     * (internal) Switches to a given pane `name`. The `options` is the options
     * object passed onto .push(). Delegates to goNow().
     *
     * For external API, Use .push() instead.
     */

    go: function (name, options) {
      var nav = this;

      // Queue it synchonously (don't wait for the actual switching to finish).
      // The actual switching will have the transitions push things to the queue,
      // and we want those to happen immediately.
      Navstack.queue(function (next) {
        nav.goNow(name, options);
        next();
      });
    },

    /**
     * goNow : .goNow(name, [options])
     * Performs the actual moving, as delegated to by .go(), which is then
     * delegated from .push().
     *
     * For external API, Use .push() instead.
     */

    goNow: function (name, options) {
      var self = this;

      // Switching to the same thing? No need to do anything
      if (self.active && self.active.name === name)
        return self.active.view;

      if (!self.panes[name])
        throw new Error("Navstack: unknown pane '"+name+"'");

      // Get the current pane so we can transition later
      var previous = self.active;

      // Spawn the pane if it hasn't been spawned before
      if (!self.panes[name].el) {
        self.spawnPane(name);
      }

      var current = self.panes[name];

      // Insert into stack
      if (self.stack.indexOf(name) === -1) {
        self.insertIntoStack(current);
      }

      // tell it
      try { current.adaptor.onwake(); } catch(e) {}

      // Register a new 'active' pane
      self.active = current;

      // Perform the transition
      var direction = self.getDirection(previous, current);

      // determine transition
      var transName;
      var newGroup = (current && previous && current.group !== previous.group);

      if (options && typeof options.transition !== 'undefined')
        transName = options.transition;

      if (typeof transName === 'undefined' && newGroup)
        transName = self.groupTransition;

      if (typeof transName === 'undefined')
        transName = self.transition;

      // use transition
      var transition = self.getTransition(transName);
      self.transitioning = true;
      self.runTransition(transition, direction, current, previous, function () {
        try { if (previous) previous.adaptor.onsleep(); } catch(e) {}
        self.transitioning = false;
        self.deferredPurgeObsolete();
        self.ready();
      });

      var eventData =  {
        direction: direction,
        current: current,
        previous: previous
      };

      // Events
      self.emitter.trigger('push:'+current.name, eventData);
      self.emitter.trigger('push', eventData);

      return (current && current.view);
    },

    transition: defaultTransition,

    /**
     * remove:
     * Destroys the Navstack instance, removes the DOM element associated with
     * it.
     *
     *     stage = new Navstack({ el: '#stack' });
     *     stage.remove();
     *
     * This is also aliased as *.teardown()*, following Ractive's naming conventions.
     */

    remove: function () {
      // TODO: destroy each pane
      this.emitter.trigger('remove');
      if (this.el.parentNode)
        this.el.parentNode.removeChild(this.el);
    },

    teardown: function () {
      return this.remove.apply(this, arguments);
    },

    /**
     * ready : ready(fn)
     * Runs a function `fn` when transitions have elapsed. If no transitions
     * are happening, run the function immediately.
     *
     *     nav = new Navstack();
     *     nav.push('home', function () { ... });
     *     nav.push('messages', function () { ... });
     *
     *     nav.ready(function () {
     *       // gets executed only after transitions are done
     *     });
     */

    ready: function (fn) {
      if (fn) {
        if (!this.transitioning) {
          fn();
        } else {
          if (!this._callbacks) this._callbacks = [];
          this._callbacks.push(fn);
        }
        return this;
      } else {
        if (this._callbacks) {
          for (var i = 0, len = this._callbacks.length; i < len; i++) {
            var callback = this._callbacks[i];
            callback();
          }
          delete this._callbacks;
        }
      }
    },

    /**
     * getAdaptors:
     * (internal) Returns the adaptors available.
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
     * (internal) Wraps the given `obj` object with a suitable adaptor.
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
      pane.adaptor && pane.adaptor.remove();
      delete this.panes[name];

      // remove from stack
      var idx = this.stack.indexOf(name);
      if (idx > -1) this.stack.splice(idx, 1);
    },

    /*
     * Kills all panes but the current one.
     */

    cleanup: function () {
      var self = this;
      Navstack.queue(function (next) {
        self.purgeAll();
        next();
      });
    },

    /***
     * Events:
     * A stack may emit events, which you can listen to via [on()].
     *
     *     stage = new Navstack();
     *     
     *     stage.on('push', function (e) {
     *       e.direction  // 'forward' or 'backward'
     *       e.current    // current pane
     *       e.previous   // previous pane
     *     });
     *     
     *     // to listen for a specific pane:
     *     stage.on('push:NameHere', function (e) {
     *       ...
     *     });
     *
     * Available events are:
     *
     * - `push` -- called after a [push()] succeeds
     * - `push:NAME` -- called after a pane with the name *NAME* is pushed
     * - `purge` -- called when a pane is purged from being obsolete
     * - `purge:NAME` -- called when pane *NAME* is purged
     * - `remove` -- called when removing the stack
     */

    /**
     * on : .on(event, function)
     * Binds an event handler.
     *
     *     stage.on('remove', function() {
     *       // do things
     *     });
     */

    on: function (event, handler) {
      this.emitter.on(event, proxy(handler, this));
      return this;
    },

    /**
     * off : .off(event, callback)
     * Removes an event handler.
     *
     *     stage.off('remove', myfunction);
     */

    off: function (event, handler) {
      this.emitter.off(event, proxy(handler, this));
      return this;
    },

    /**
     * one : .one(event, callback)
     * Works like `.on`, except it unbinds itself right after.
     */

    one: function (event, handler) {
      this.emitter.one(event, proxy(handler, this));
      return this;
    },

    /*
     * (Internal) Purges all panes in front of the current pane.
     */

    purgeObsolete: function () {
      if (!this.active) return;

      var idx = this.stack.indexOf(this.active.name);

      for (var i = this.stack.length; i>idx; i--) {
        this.purgePane(this.stack[i]);
      }
    },

    deferredPurgeObsolete: function ()  {
      var self = this;
      if (typeof self._purgeTimer !== 'undefined') {
        clearTimeout(self._purgeTimer);
        delete self._purgeTimer;
      }
      self._purgeTimer = setTimeout(function () {
        delete self._purgeTimer;
        self.purgeObsolete();
      }, 2500);
    },

    /*
     * (Internal) Purges all panes except the current one.
     * Use `.cleanup()` instead.
     */

    purgeAll: function () {
      if (!this.active) return;

      for (var name in this.panes) {
        if (this.panes.hasOwnProperty(name)) {
          var pane = this.panes[name];
          if (pane.name !== this.active.name) {
            this.purgePane(name);
          }
        }
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
      if (!transition)
        return Navstack.transitions['default'];

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
     * Runs the given `callback` when its done.
     */

    runTransition: function (transitionFn, direction, current, previous, callback) {
      var transition = transitionFn(direction, current, previous);
      var nav = this;
      var el = this.el;

      transition.before(function () {
        Navstack.queue(function (next) {
          if (transition.nav)
            nav.runOverlay(direction, current, previous);
          transition.run(function () {
            if (transition.nav) {
              var navEl = el.querySelector('.-navstack-nav');
              if (navEl) navEl.parentNode.removeChild(navEl);
            }
            transition.after(function () {
              if (callback) callback();
              next();
            });
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
     *
     * This also accounts for grouped panes.
     */

    insertIntoStack: function (pane) {
      var name = pane.name;
      var group = pane.group;

      // don't repush
      if (~this.stack.indexOf(name)) return;

      // find the other panes in the same group, and find their last pane.
      var alpha, omega;
      for (var i = 0, len = this.stack.length; i < len; i++) {
        var item = this.stack[i];
        var _pane = this.panes[item];
        if (typeof alpha === 'undefined' && _pane.group === group) alpha = i;
        if (typeof alpha !== 'undefined' && typeof omega === 'undefined' && _pane.group !== group) omega = i;
      }
      if (!alpha) alpha = this.stack.length;
      if (!omega) omega = this.stack.length;

      // insert at the correct place.
      this.stack.splice(omega, 0, pane.name);
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
    },

    /**
     * runOverlay: (internal) makes the overlay div to draw the animating nav
     * elements.
     */

    runOverlay: function (direction, current, previous) {
      if (direction === 'first' || !this.nav) return;

      var currentEl = current && current.el;
      var previousEl = previous && previous.el;
      var parentEl = currentEl.parentNode || previousEl.parentNode;
      if (!currentEl || !previousEl) return;

      var nav = this.nav;

      // build the nav in there
      var nav1 = currentEl.querySelector(nav);
      var nav2 = previousEl.querySelector(nav);
      if (!nav1 || !nav2) return;

      // create the overlay bar
      var bar = document.createElement(nav2.nodeName);
      bar.className = nav2.className;

      // add the previous stuff as exiting
      eachChild(nav2, function () {
        var el = this.cloneNode(true);

        // skip if the same data-id exists in the current pane
        var id = attr(this, 'data-id');
        if (id && nav1.querySelector('>[data-id="'+id+'"]')) return;

        addClass(el, 'nav-slide-exit-'+direction);
        bar.appendChild(el);
      });

      // add the current stuff as entering
      eachChild(nav1, function () {
        var el = this.cloneNode(true);

        // skip entrance animation if the same data-id exists in the previous
        var id = attr(this, 'data-id');
        if (!id || !nav2.querySelector('>[data-id="'+id+'"]'))
          addClass(el, 'nav-slide-enter-'+direction);

        bar.appendChild(el);
      });

      // build the overlay bar
      var overlay = document.createElement('DIV');
      overlay.className = '-navstack-nav';
      overlay.appendChild(bar);
      parentEl.appendChild(overlay);

      // change the classname to transition
      setImmediate(function () {
        bar.className = nav1.className;
      });
    }

  };

  /***
   * Navstack.Pane:
   * Panes are accessible via `navstack.panes['name']` or `navstack.active`.
   *
   *     stage = new Navstack();
   *     pane = stage.active;
   *
   *     pane.name
   *     pane.initializer  // function
   *     pane.el
   *     pane.view
   *
   * You'll find these properties:
   *
   * ~ name (String): the identifier for this pane as passed onto [push()].
   * ~ parent: a reference to the [Navstack] instance.
   * ~ el: DOM element.
   * ~ view: the view instance created by the initializer passed onto [push()].
   * ~ adaptor: a wrapped version of `view` (internal).
   */

  Pane = Navstack.Pane = function (name, options, initializer, parent) {
    // `options` is reserved for future use.
    if (!options) options = {};

    this.name = name;
    this.initializer = initializer;
    this.parent = parent;
    this.el = null;
    this.view = null;
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
      this.group = getGroupName(this.name) || '';

      if (!this.el)
        throw new Error("Navstack: no element found");

      if (!this.el.nodeType)
        throw new Error("Navstack: pane element is not a DOM node");

      var el = this.el;
      attr(el, 'data-stack-pane', this.name);
      attr(el, 'data-stack-group', this.group);
      addClass(el, '-navstack-pane');
      this.parent.el.appendChild(el);
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
   * Navstack.extend : extend(prototype)
   * Subclasses Navstack to create your new Navstack class. This allows you to
   * create 'presets' of the options to be passed onto the constructor.
   *
   *     var Mystack = Navstack.extend({
   *       transition: 'slide'
   *     });
   *
   *     // doing this is equivalent to passing `transition: 'slide'` to the
   *     // options object.
   *     var stack = new Mystack({ el: '#stack' });
   */

  Navstack.extend = function (proto) {
    var klass = function() { Navstack.apply(this, arguments); };
    extend(klass.prototype, Navstack.prototype, proto);
    return klass;
  };

  /**
   * Navstack.buildTransition : buildTransition(prefix)
   * (internal) builds a transition for the given `prefix`.
   */

  Navstack.buildTransition = function (prefix, options) {
    // scroll-stopper
    var noscroll = function (e) { e.preventDefault(); };

    return function (direction, current, previous) {
      var currentEl = current && current.el;
      var previousEl = previous && previous.el;
      var parentEl = (currentEl && currentEl.parentNode) || (previousEl && previousEl.parentNode);

      var hide    = '-navstack-hide',
        moving    = '-navstack-animating',
        container = prefix + '-container' + ' ' + moving,
        enter     = prefix + '-enter-' + direction + ' ' + moving,
        exit      = prefix + '-exit-' + direction + ' ' + moving,
        animationend = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

      var trans = {
        before: function (next) {
          if (direction !== 'first')
            addClass(currentEl, hide);

          // Do transitions on next browser tick so that any DOM elements that
          // need rendering will take its time
          return setImmediate(next);
        },

        after: function (next) {
          return next();
        },

        run: function (next) {
          if (direction === 'first') return next();

          // prevent scrolling while transitions are working
          on(document, 'touchmove', noscroll);

          var after = once(function() {
            modClass(parentEl,   { rem: container });
            modClass(previousEl, { rem: exit, add: hide });
            modClass(currentEl,  { rem: enter });
            off(document, 'touchmove', noscroll);
            next();
          });

          modClass(parentEl,   { add: container });
          modClass(previousEl, { rem: hide, add: exit });
          modClass(currentEl,  { rem: hide, add: enter });
          one(previousEl, animationend, after);
          one(currentEl,  animationend, after);
        }
      };

      // enable nav support for certain transitions
      if (options && options.nav) trans.nav = true;

      return trans;
    };
  };

  /**
   * Navstack.transitions:
   * The global transitions registry. It's an Object where transition functions are
   * stored.
   *
   * Available transitions are:
   *
   * ~ default: show new panes immediately, no animation
   * ~ slide: slides the new panes horizontally like iOS7
   * ~ modal: slides the new panes vertically
   *
   * Whenever a transition is used on a Navstack (eg, with `new Navstack({
   * transition: 'slide' })`), it is first looked up in the stack's own registry
   * (`stage.transitions`). If it's not found there, it's then looked up in the
   * global transitions registry, `Navstack.transitions`.
   *
   * You can define your own transitions via:
   *
   *     Navstack.transitions.foo = function (direction, current, previous) {
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
    'default': defaultTransition,
    slide: Navstack.buildTransition('slide', { nav: true }),
    modal: Navstack.buildTransition('modal'),
    flip: Navstack.buildTransition('flip')
  };

  /**
   * Navstack.queue:
   * (internal) Queues animations.
   */

  Navstack.queue = function (fn) {
    // use the jQuery queue if possible.
    if (Navstack.jQuery) {
      Navstack.jQuery(window.document).queue(fn);
    } else {
      Queue.add(fn);
    }
  };

  /**
   * Navstack.flushQueue:
   * (internal) Forcibly clears the command queue. Only useful in tests.
   */

  Navstack.flushQueue = function (fn) {
    Queue.flush();
  };

  /**
   * Navstack.adaptors:
   * (internal) Adaptors registry.
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
          remove: function () { return options.remove(obj); },
          onsleep: function () { options.onsleep(obj); },
          onwake: function () { options.onwake(obj); }
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
      return (typeof obj.remove === 'function') &&
        (typeof obj.el === 'object');
    },
    remove: function (obj) { obj.trigger('navstack:remove'); return obj.remove(); },
    onsleep: function (obj) { obj.trigger('navstack:sleep'); },
    onwake: function (obj) { obj.trigger('navstack:wake'); }
  });

  /*
   * Ractive adaptor
   */

  Navstack.adaptors.ractive = buildAdaptor({
    el: function (obj) {
      var el = obj.find('*');
      if (el) return el;

      // ractive 0.5+ doesn't render the elements by default
      var fragment = document.createDocumentFragment();
      obj.render(fragment);
      return obj.find('*');
    },
    check: function (obj) {
      return (typeof obj.teardown === 'function') &&
        (typeof obj.fire === 'function') &&
        (typeof obj.find === 'function') &&
        (typeof obj.render === 'function');
    },
    remove: function (obj) { obj.fire('navstack:remove'); return obj.teardown(); },
    onsleep: function (obj) { obj.fire('navstack:sleep'); },
    onwake: function (obj) { obj.fire('navstack:wake'); }
  });

  /*
   * React.js adaptor
   */

  Navstack.adaptors.react = buildAdaptor({
    el: function (obj) { return obj.getDOMNode(); },
    check: function (obj) { return (typeof obj.getDOMNode === 'function'); },
    remove: function (obj) { return window.React.unmountComponentAtNode(obj.getDOMNode()); },
    onsleep: function (obj) { },
    onwake: function (obj) { }
  });


  /*
   * jQuery adaptor
   */

  Navstack.adaptors.jquery = buildAdaptor({
    el: function (obj) { return obj[0]; },
    check: function (obj) { return obj && obj[0] && obj[0].nodeType === 1; },
    remove: function (obj) { obj.trigger('navstack:remove'); return obj.remove(); },
    onsleep: function (obj) { obj.trigger('navstack:sleep'); },
    onwake: function (obj) { obj.trigger('navstack:wake'); }
  });

  /*
   * Generic adaptor
   */

  Navstack.adaptors.dom = buildAdaptor({
    el: function (obj) { return obj; },
    check: function (obj) { return obj && obj.nodeType === 1; },
    remove: function (obj) { trigger(obj, 'navstack:remove'); obj.parentNode.removeChild(obj); return obj; },
    onsleep: function (obj) { trigger(obj, 'navstack:sleep'); },
    onwake: function (obj) { trigger(obj, 'navstack:wake'); }
  });

  /*
   * Adaptors in use
   */

  Navstack.adapt = ['backbone', 'ractive', 'react', 'jquery', 'dom'];

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

  function getGroupName (name) {
    var m = name.match(/^([^!]+)!/);
    return m && m[1];
  }

  function proxy (fn, context) {
    return function () {
      fn.apply(context, arguments);
    };
  }

  function addClass (el, className) {
    return modClass(el, { add: className });
  }

  function remClass (el, className) {
    return modClass(el, { rem: className });
  }

  function modClass (el, opts) {
    var list = el.className.split(' '), idx;
    if (opts.rem) {
      var rm = opts.rem.split(' ');
      for (var i = rm.length-1; i >= 0; i--) {
        while ((idx = list.indexOf(rm[i])) > -1) {
          list.splice(idx, 1);
        }
      }
    }
    if (opts.add) {
      list.push(opts.add);
    }

    el.className = list.join(' ');
    return el;
  }

  function attr (el, key, val) {
    if (arguments.length === 3) {
      el.setAttribute(key, val);
      return el;
    } else {
      return el.getAttribute(key);
    }
  }

  // Adds an event listener.
  // (also adds el._onxxxx for tests to pick up)
  function on (el, eventName, fn) {
    if (~eventName.indexOf(' ')) {
      var names = eventName.split(' ');
      for (var i = 0, len = names.length; i < len; i++) {
        if (names[i].length > 0) {
          el.addEventListener(names[i], fn);
          el['_on'+names[i]] = fn;
        }
      }
    } else {
      el.addEventListener(eventName, fn);
      el['_on'+eventName] = fn;
    }
    return el;
  }

  // Removes an event listener
  function off (el, eventName, fn) {
    if (~eventName.indexOf(' ')) {
      var names = eventName.split(' ');
      for (var i = 0, len = names.length; i < len; i++) {
        if (names[i].length > 0) {
          delete el['_on'+names[i]];
          el.removeEventListener(names[i], fn);
        }
      }
    } else {
      el.removeEventListener(eventName, fn);
      delete el['_on'+eventName];
    }
    return el;
  }

  function one (el, eventName, fn) {
    var called, result;
    var callback = function () {
      if (called) return result;
      called = true;
      result = fn.apply(this, arguments);
      off(el, eventName, callback);
      return result;
    };
    on(el, eventName, callback);
  }

  // triggers a custom event
  function trigger (el, eventName, data) {
    var event;
    if (window.CustomEvent) {
      event = new window.CustomEvent(eventName, { detail: data || {} });
    } else {
      event = document.createEvent('CustomEvent');
      if (!event.initCustomEvent) return;
      event.initCustomEvent(eventName, true, true, data || {});
    }
    el.dispatchEvent(event);
    return true;
  }

  // Reimplementation of jQuery.extend
  function extend (out) {
    if (!out) out = {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) continue;

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key))
          out[key] = arguments[i][key];
      }
    }

    return out;
  }

  function eachChild (el, fn) {
    for (var i=el.children.length; i--;){
      // Skip comment nodes on IE8
      if (el.children[i].nodeType !== 8)
        fn.call(el.children[i], i, el.children[i]);
    }
  }

  /*
   * Emitter based on microevent.js
   * https://github.com/jeromeetienne/microevent.js
   */

  function Emitter() {}

  Emitter.prototype = {
    on: function (event, fct) {
      this._events = this._events || {};
      this._events[event] = this._events[event]	|| [];
      this._events[event].push(fct);
    },
    off: function (event, fct) {
      this._events = this._events || {};
      if(event in this._events === false) return;
      this._events[event].splice(this._events[event].indexOf(fct), 1);
    },
    one: function (event, fct) {
      var self = this;
      var callback = function () {
        self.off(event, callback);
        return fct.apply(this, arguments);
      };
      self.on(event, callback);
    },
    trigger: function (event /* , args... */) {
      this._events = this._events || {};
      if( event in this._events === false) return;
      for(var i = 0; i < this._events[event].length; i++){
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };

  function defaultTransition (direction, current, previous) {
    function hide (el) { addClass(el, '-navstack-hide'); }
    function show (el) { remClass(el, '-navstack-hide'); }

    return {
      before: function(next) {
        if (current)  hide(current.el);
        return next();
      },
      run: function(next) {
        if (current)  show(current.el);
        if (previous) hide(previous.el);
        return next();
      },
      after: function (next) {
        return next();
      }
    };
  }

  Queue = {
    commands: [],

    add: function (fn) {
      // Adds a command to the buffer, and executes it if it's
      // the only command to be ran.
      var commands = this.commands;
      commands.push(fn);
      if (this.commands.length === 1) fn(next);

      // Moves onto the next command in the buffer.
      function next() {
        commands.shift();
        if (commands.length) commands[0](next);
      }
    },

    flush: function () {
      this.commands = [];
    }
  };


  /**
   * Navstack.jQuery:
   * Pointer to the instance of jQuery to optionally use. Set this if you would
   * like Navstack to utilize [jQuery.queue].
   *
   *     Navstack.jQuery = jQuery;
   */

  Navstack.jQuery = undefined;

  /*
   * setImmediate helper
   * Taken from browserify's process.nextTick
   */

  Navstack.setImmediate = setImmediate = (function() {
    var canSetImmediate = typeof window !== 'undefined' && window.setImmediate;
    var canPost = typeof window !== 'undefined' && window.postMessage && window.addEventListener;

    if (canSetImmediate) {
      return function (f) { return window.setImmediate(f); };
    }

    if (canPost) {
      var queue = [];
      window.addEventListener('message', function (ev) {
        var source = ev.source;
        if ((source === window || source === null) && ev.data === 'process-tick') {
          ev.stopPropagation();
          if (queue.length > 0) {
            var fn = queue.shift();
            fn();
          }
        }
      }, true);

      return function (fn) {
        queue.push(fn);
        window.postMessage('process-tick', '*');
      };
    }

    return function (fn) {
      setTimeout(fn, 0);
    };
  })();

  Navstack.version = '0.4.3';

  return Navstack;

});
