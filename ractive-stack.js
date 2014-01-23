(function(factory) {
  window.RactiveStack = factory();
})(function () {

  var Pane = function(name, initializer, parent) {
    this.name = name;
    this.initializer = initializer;
    this.parent = parent;
    this.el = null;
    this.view = null;
  };

  Pane.prototype = {
    init: function(el) {
      this.el = el;
      this.view = this.initializer.call(this.parent, el);
    }
  };

  var RactiveStack = Ractive.extend({
    paneEl: "<div class='rstack-pane'>",

    init: function () {
      this.initializers = {};
      this.active = null;
      this.activeName = null;
      this.panes = {};
      this.stack = [];

      $(this.el).addClass('rstack');
    },

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
      var $pane = $(this.paneEl);
      $pane.attr('data-pane-name', name);
      $(this.el).append($pane);

      // Get the current pane so we can transition later
      var previous = this.active;

      // Initialize it
      // TODO: prevent double initialization
      var current = this.panes[name];
      current.init($pane[0]);

      // Register as current
      this.stack.push(current);
      this.active = current;

      // Transition
      this.paneTransition('forward', current, previous, function() { });
    },

    /**
     * Pane transition
     */

    paneTransition: function (direction, current, previous, done) {
      if (current)  $(current.el).show();
      if (previous) $(previous.el).hide();
      done();
    },

    /**
     * Uses an initializer (registered with `register()`) to initialize a pane.
     * Returns a view object.
     */

    _useInitializer: function (init, $el) {
      return init.apply(this, $el);
    }
  });

  return RactiveStack;

});
