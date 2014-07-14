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

### Adding panes

Use `.push()` to create your panes. It takes 2 arguments:

 * `name` (string): the ID of the pane. This will the unique identifier that 
                    will identify your pane.
 * `initializer` (function): a function to return the pane's contents.

``` js
// Navigate to new pages using push.
stage.push('/home', function() {
  return $("<div class='full-screen'>This is the home screen</div>");
});

// The first parameter is an ID for the pane to be pushed.
// This will animate the stage to slide into the new view.
stage.push('/task/1', function() {
  return $("<div class='full-screen'>Task #1 details: ...</div>");
});
```

__Libraries support:__ The initializer can return [jQuery] elements, [Backbone] 
views, [Ractive] instances, or [React.js] components.

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

__Returning back:__ Calling `.push()` again with a pane that is already part of 
the stack will make the stage will animate backwards (slide left) to that old 
pane.  If the pane is recent (ie, last 5 panes used or so), the pane's DOM 
element is previously hidden and will be made visible. If it's an old pane, it 
will be recreated based on the initializer first passed onto `.push()`.

``` js
stage.push('/home', function() { ... });

stage.push('/task/1', function() { ... });

// this will slide left into the first screen.
stage.push('/home', function() { ... });
```

### Events

You can detect when pushes are completed.

```js
stage = new Navstack();

stage.on('push', function (e) {
  e.direction  // 'forward' or 'backward'
  e.current    // current pane
  e.previous   // previous pane
});

// to listen for a specific pane:
stage.on('push:yourpanenamehere', function (e) {
  ...
});
```

### Groups

You can group your panes together. Panes of the same group will slide 
left-and-right by default, while panes of a different group will pop up like 
modal dialogs.

This allows you to create logical sections of your app UI. In this example 
below, the settings pages will pop up in a modal.

```js
stage = new Navstack({ el: ... });

// Use no group names for the main parts of your app.
stage.push('home', function () { ... });
stage.push('messages', function () { ... });
stage.push('message/user1', function () { ... });

// this will pop up the `settings!config` dialog with a modal popup animation.
// the next one, `settings!account`, will animate by sliding to the right,
// since it's in the same group as the previous pane.
stage.push('settings!config', function () { ... });
stage.push('settings!account', function () { ... });

// by going back to `home`, there will be a modal exit animation, since you're 
// transitioning from one group to another.
stage.push('home', function () { ... });
```

### Sleeping and waking

When a view is about to be hidden, a `navstack:sleep` event is called. When a 
view is about to be shown, a `navstack:wake` event is called. These are 
triggered as [jQuery], [Backbone], [Ractive] or [React] events, depending on 
what your pane is.

```js
var $box = $("<div>hello</div>");
$box.on('navstack:sleep', function () { ... });
$box.on('navstack:wake', function () { ... });

stage.push('home', function () {
  return $box;
});
```

### Use with routers

To take full advantage of Navstack, it's recommended to use it with a router to
manage browser history states (read: makes the browser "Back" button work). 
Here's an example usage of Navstack with [page.js]:

``` js
var stack = new Navstack();

page('/home', function (ctx) {
  stack.push(ctx.canonicalPath, function () {
    return $("<div>...</div>");
  });
});

page('/book/:id', function (ctx) {
  stack.push(ctx.canonicalPath, function () {
    return $("<div>...</div>");
  });
});

document.body.appendChild(stack.el);
```

Or with [Backbone].Router:

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

[jQuery]: http://jquery.com
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
