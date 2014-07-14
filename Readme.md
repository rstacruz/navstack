Navstack
========

<img src="http://ricostacruz.com/navstack/assets/navstack.gif" align="right">

Manage a stack of multiple views. Perfect for tabs, navigation stacks, and 
similar. Inspired by iOS's UINavigationController.

 * __Framework-agnostic__: made to play fair with [Backbone], [Ractive], 
 [React.js] and more. Can even work with plain old jQuery.

 * __Router-friendly__: made to be able to work with pushstate routers (like 
     [page.js]), giving you back/forward button support.

 * __Mobile-like transitions__: buttery-smooth transitions are available out of 
 the box, modeled after iOS7.

[![Status](https://travis-ci.org/rstacruz/navstack.png?branch=master)](https://travis-ci.org/rstacruz/navstack)

__Status:__ very usable - just need to add documentation and examples.

Install
-------

Navstack is a JS + CSS bundle.

 * [navstack.js](https://raw.githubusercontent.com/rstacruz/navstack/master/navstack.js)
 * [navstack.css](https://raw.githubusercontent.com/rstacruz/navstack/master/navstack.css)

Or get it via Bower:

    bower install navstack

Then use it:

``` html
<script src="navstack.js"></script>
<link rel="stylesheet" href="navstack.css">
```

Usage
-----

Create your stack. You may pass a selector to `el`, or a jQuery object (eg,
`$('#stage')`), or a DOM node.

``` js
stage = new Navstack({
  el: '#stage'
});
```

### Basic usage

Use `.push()` to create your panes. It takes 2 arguments:

 * `name` (string): the ID of the pane. This allows you to go back to previous panes.
 * `initializer` (function): a function to return the pane's contents.

``` js
// Navigate to new pages using push.
stage.push('home', function() {
  return $("<div class='full-screen'>This is the home screen</div>");
});

// The first parameter is an ID for the pane to be pushed.
stage.push('task:1', function() {
  return $("<div class='full-screen'>Task #1 details: ...</div>");
});
```

The initializer can return [jQuery] elements, [Backbone] views, [Ractive] 
instances, or [React.js] components.

``` js
stage.push('task:1', function() {
  /* Backbone: */
  return new Backbone.View({ ... });

  /* Ractive: */
  return new Ractive({ template: '...' });

  /* React.js: */
  var MyComponent = React.createClass({ ... });
  return new MyComponent({ name: "John" });
});
```

### Switching back

To switch back to previously-defined panes, use `.push(name)`.

If the pane is recent (ie, last 5 panes used or so), the pane's DOM element is
previously hidden and will be made visible. If it's an old pane, it will be
recreated based on the initializer first passed onto `.push()`.

``` js
stage.push('home');
```

### Transitions

Include the [navstack.css](navstack.css) file and use:

``` js
stage = new Navstack({
  el: '#hello',
  transition: 'slide'
})
```

Available transitions are `slide` and `modal`.

### Events

You can listen to events.

```js
stage = new Navstack().
stage.on('push', function (e) {
  e.direction  // 'forward' or 'backward'
  e.current    // current pane
  e.previous   // previous pane
});

stage.on('push:yourpanenamehere', function (e) { ... });
```

### Groups

Allows you to do modal dialogs.

(TODO: explain this.)

```js
stage = new Navstack({
  transition: 'slide',
  groupTransition: 'modal',
});

stage.push('root!hello', function () { ... });
stage.push('modal!login', function () { ... });
stage.push('modal!confirm-email', function () { ... });
```

### Sleeping and waking

When a view is about to be hidden, a `navstack:sleep` event is called.

When a view is about to be shown, a `navstack:wake` event is called.

```js
var $box = $("<div>hello</div>");
$box.on('navstack:sleep', function () { ... });
$box.on('navstack:wake', function () { ... });

stage.push('home', function () {
  return $box;
});

### Use with routers

To take full advantage of Navstack, it's recommended to use it with a router to
manage browser history states (read: makes the browser "Back" button work).

An example usage of Navstack with [page.js]:

``` js
var stack = new Navstack();

page('/home', function () {
  stack.push('home', function () {
    return $("<div>...</div>");
  });
});

page('/book/:id', function (ctx) {
  var id = ['book', ctx.params.id].join(':');
  stack.push(id, function () {
    return $("<div>...</div>");
  });
});

$(function () {
  $(stack.el).appendTo('body');
});

```

Or with Backbone.Router:

``` js
var stack = new Navstack();

App.Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'book/:id': 'showBook'
  },

  home: function () {
    stack.push('home', function () {
      return new HomeView(...);
    });
  },

  showBook: function (id) {
    stack.push('book:' + id, function () {
      var book = new Book(id: id);
      return new BookView(book);
    });
  }
});

$(function () {
  $(stack.el).appendTo('body');
  Backbone.history.start();
});
```

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

Cheat sheet
-----------

``` js
// Basic usage
stage = new Navstack();

// All options are optional
stage = new Navstack({
  el: 'body', /* selector, or jQuery object */

  adapt: ['backbone'],
  adaptors: { backbone: ... },

  transition: 'slide' | 'modal',
  transitions: { slide: ... }, /* custom transitions */
});

stage.push('pane_id', function () {
  return $("<div>...</div>");
  return new Ractive(...);
  return new ReactComponent(...);
});

// Return to old pane
stage.push('pane_id');


// The main element
stage.el;           //=> <div>

// Access the active pane
stage.active;
stage.active.el;    //=> <div>
stage.active.view;  //=> whatever's returned in the initializer
stage.active.name;  //=> "home"

// Access the stack
stage.stack;
stage.stack['pane_id'].view;
stage.stack.length;

// Global repositories
Navstack.adaptors = {...};
Navstack.transitions = {...};
```

Status
------

Public API is stable, and is okay for public consumption. The internal API is
not stable yet (eg, transitions are due for a refactor).

License
-------

[Ractive]: http://ractivejs.org
[React.js]: http://facebook.github.io/react
[Backbone]: http://backbonejs.org
[page.js]: http://visionmedia.github.io/page.js/

Thanks
------

**Navstack** © 2014, Rico Sta. Cruz. Released under the [MIT License].<br>
Authored and maintained by Rico Sta. Cruz with help from [contributors].

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT License]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/navstack/contributors
