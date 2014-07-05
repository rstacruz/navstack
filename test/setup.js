var cov = (!! process.env.cov);

// Deps
global.chai = require('chai');
global.expect = require('chai').expect;
chai.use(require('chai-fuzzy'));
chai.should();

var fs = require('fs');

var scripts = {
  'jq': fs.readFileSync('vendor/jquery-2.0.2.js'),
  'navstack': fs.readFileSync('navstack.js')
};

function myEnv() {
  var jsdom = require('jsdom');
  return function(done) {
    jsdom.env({
      html: '<!doctype html>',
      src: [ scripts.jq, scripts.navstack ],
      done: function(errors, window) {
        if (errors) {
          errors.forEach(function (e) { console.error(e.data); });
          return done(errors[0].data.error);
        }
        window.navigator.test = true;

        window.console = console;
        global.window  = window;
        global.$       = window.$;
        global.jQuery  = window.jQuery;
        global.Ractive = window.Ractive;
        global.Navstack = window.Navstack;
        // window._$jscoverage = global._$jscoverage;
        global._$jscoverage = window._$jscoverage;

        chai.use(require('chai-jquery'));
        done();
      }
    });
  };
}

before(myEnv());
global.testSuite = describe;

beforeEach(function () {
  global.sinon = require('sinon').sandbox.create();
});

afterEach(function () {
  global.sinon.restore();
});

// Reset when needed
beforeEach(function () {
  $('body').html('');
});
