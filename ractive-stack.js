(function(factory) {
  window.RactiveStack = factory();
})(function () {

  var RactiveStack = Ractive.extend({
    paneEl: "<div class='rstack-pane'>",

    init: function () {
      this.stack = {};
      this.initializers = {};
      this.active = null;
      this.activeName = null;

      $(this.el)
        .addClass('rstack');
    },

    /**
     * Registers a pane `name` with initializer function `fn`.
     */

    register: function (name, fn) {
      this.initializers[name] = fn;
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

      var init = this.initializers[name];
      var subview = this._useInitializer(init, $pane);

      this.stack[name] = subview;

      // Register it as the active pane
      var current = this.active = {
        el: $pane[0],
        view: subview,
        name: name
      };

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
