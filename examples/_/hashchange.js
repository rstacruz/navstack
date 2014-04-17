(function () {
  var previous;

  // simple hashchange router
  $(window).on('hashchange', function () {
    if (previous === window.location.hash) return;
    $(document).trigger('nav:' + (window.location.hash || '#'));
    previous = window.location.hash;
  });

  // return home on reload
  $(function () {
    window.location.hash = '';
    $(window).trigger('hashchange');
  });

})();
