/**
 * Creates a test suite function that uses permutations of the setup script
 * (made via `generator`).
 *
 *     // Set up a `generator` that returns a function you can use as a before hook.
 *     gen = function(version) { return function() { ... } };
 *
 *     // Create a `suite`, then use it instead of `describe`.
 *     mysuite = multisuite(['aaa', 'bbb'], gen);
 *     mysuite('event tests', function() {
 *       ....
 *     });
 *
 * That example above is equivalent to doing:
 *
 *     describe('aaa', function() {
 *       before(gen('aaa'));
 *       ....
 *     });
 *
 *     describe('bbb', function() {
 *       before(gen('bbb'));
 *       ....
 *     });
 *
 * Useful for testing multiple jQuery versions, for example.
 *
 *     function jquery(version) {
 *       return function(done) {
 *         // fire up jsdom with the right version of jQuery
 *       }
 *     }
 *
 *     mysuite = multisuite(['1.9', '1.10', '2.0'], jquery);
 *     mysuite(function() {
 *     });
 */

module.exports = function(variants, generator) {
  return function(name, fn) {
    variants.forEach(function(variant) {

      var subname = name;
      if (variants.length > 1) subname = variant.toString() + " " + subname;

      describe(subname, function() {
        var arr = variant.constructor === Array ? variant : [variant];
        before(generator.apply(this, arr));
        fn.apply(this);
      });

    });
  };
};
