Navstack
========

Manage a stack of multiple views. Perfect for tabs, navigation stacks, and 
similar.  Inspired by iOS's UINavigationController.

 * __Framework-agnostic__: made to play fair with [Backbone], [Ractive], 
 [React.js] and more. Can even work with plain old jQuery.

 * __Router-friendly__: made to be able to work with pushstate routers (like 
     [page.js]).

 * __Mobile-like transitions__: buttery-smooth transitions are available out of 
 the box, modeled after iOS7.

Requires jQuery 1.7+.

[![Status](https://travis-ci.org/rstacruz/navstack.png?branch=master)](https://travis-ci.org/rstacruz/navstack)

(__Status:__ *very usable, but lacking documentation and examples. API is not 
 fully stable yet. Will get to that eventually!*)

Install
-------

Navstack is a JS + CSS bundle.

 * [navstack.js](https://raw.githubusercontent.com/rstacruz/navstack/master/navstack.js)
 * [navstack.css](https://raw.githubusercontent.com/rstacruz/navstack/master/navstack.css)

Or get it via Bower:

    bower install navstack

Then use it:

``` html
<script src="jquery.js"></script>
<script src="navstack.js"></script>
<link rel="stylesheet" href="navstack.css">
```

Usage
-----

### Basic usage

Use `.push()` to create your panes. Pass a callback that will return a 
[Backbone] view, [Ractive] or [React.js] instance, or a DOM element.

``` js
stage = new Navstack({ el: '#stage' });

// Navigate to new pages using push.
stage.push('home', function() {
  return $("<div class='full-screen'>This is the home screen</div>");
});

// The first parameter is an ID for the pane to be pushed
stage.push('task:1', function() {
  return $("<div class='full-screen'>Task #1 details: ...</div>");
});

// You may use Backbone, Ractive, or React.js views
stage.push('task:1', function() {
  return new Backbone.View({ ... });
});

// Switch to older panes using .go()
stage.go('home');
```

### Transitions

Include the [navstack.css](navstack.css) file and use:

``` js
stage = new Navstack({
  transition: 'slide'
})
```

Available transitions are:

 * `slide`
 * `modal`
 * ...more later

### As a class

Rather than repetitively defining your constructor parameters across different 
instances, you can subclass `Navstack` using `Navstack.extend`. This allows you 
to set preset parameters, as well as define your own methods.

``` js
Stage = Navstack.extend({
  /* options go here */
});

stage = new Stage({ el: '#stage' });
stage.go('home');
```

### Tabs

You can also use it for tabs by creating your tab panes --
this tells Navstack how to construct a tab as they're needed. This allows you to 
`.go()` to any tab at any time.

``` js
// Define your panes under the `panes` key
stage = new Navstack({
  el: '#stage',
  panes: {
    home: function() {
      return $("<div class='full-screen'>This is the home screen</div>")el: };
    },
    messages: function() {
      return $("<div class='full-screen'>Messages: ...</div>");
    }
  }
});

// Switch to a pane
stage.go('home');
stage.go('messages');
```

Cheat sheet
-----------

``` js
stage = Navstack.extend({
  panes: { ... },
  transition: ...
});

stage.go('page');

stage.push('pane_id', function () {
  return $("<div>...</div>";
  return new Ractive(...);
  return new ReactComponent(...);
});

// Access the active pane
stage.active;
stage.active.el;    //=> <div>
stage.active.view;  //=> whatever's returned in the initializer
stage.active.name;  //=> "home"

// Access the stack
stage.stack;
stage.stack['pane_id'].view;
stage.stackLength()
```

License
-------

© 2014, Rico Sta. Cruz. Released under the [MIT License].

[MIT License]: http://www.opensource.org/licenses/mit-license.php

 * [My website](http://ricostacruz.com) (ricostacruz.com)
 * [Twitter](http://twitter.com/rstacruz) (@rstacruz)

> Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
>
> The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[Ractive]: http://ractivejs.org
[React.js]: http://facebook.github.io/react
[Backbone]: http://backbonejs.org
[page.js]: http://visionmedia.github.io/page.js/
