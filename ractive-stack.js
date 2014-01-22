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

    go: function (name, fn) {
      if (fn) this.register(name, fn);

      var $pane = $(this.paneEl);
      $pane.attr('data-pane-name', name);
      $(this.el).append($pane);

      var init = this.initializers[name];
      var subview = this._useInitializer(init, $pane);

      this.stack[name] = subview;

      // Register it as the active pane
      this.active = subview;
      this.activeName = name;
    },

    /**
     * Pane transition
     */

    paneTransition: function (direction, $enter, $exit) {
      if ($enter) $enter.show();
      if ($exit) $exit.hide();
    },

    /**
     * Uses an initializer (registered with `register()`) to initialize a pane.
     */

    _useInitializer: function (init, $el) {
      return init.apply(this, $el);
    }
  });

  return RactiveStack;

});
