// Deps
global.chai = require('chai');
global.expect = require('chai').expect;
chai.should();

var fs = require('fs');
var multisuite = require('./support/multisuite');

var scripts = {
  'jq-2.0': fs.readFileSync('vendor/jquery-2.0.2.js'),
  'navstack': fs.readFileSync('navstack.js')
};

function myEnv(jq) {
  var jsdom = require('jsdom');
  return function(done) {
    jsdom.env({
      html: '<!doctype html>',
      src: [ scripts[jq], scripts.navstack ],
      done: function(errors, window) {
        window.console = console;
        global.window  = window;
        global.$       = window.$;
        global.jQuery  = window.jQuery;
        global.Ractive = window.Ractive;
        global.Navstack = window.Navstack;

        chai.use(require('chai-jquery'));
        done(errors);
      }
    });
  };
}

before(myEnv('jq-2.0'));
global.testSuite = describe;
