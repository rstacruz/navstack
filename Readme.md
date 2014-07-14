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

Installation
------------

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

Getting started
---------------

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

<!-- include: navstack.js -->
<a name="Navstack"></a>
## Navstack
> `new Navstack(options)`

Instanciates a new Navstack stage that manages multiple panes.

```js
stage = new Navstack({
  el: '#stack'
});
```

You may pass any of these options below. All of them are optional.

* `el` <span class='dash'>&mdash;</span> a selector, a jQuery object, or a DOM element.
* `transition` <span class='dash'>&mdash;</span> a string of the transition name to use.
* `groupTransition` <span class='dash'>&mdash;</span> a string of the transition to use in between groups.

You'll then use [push] to add panes into the stage.

```js
stage.push('home', function () {
  return $("<div>Hello</div>");
});
```

<a name="Attributes"></a>
## Attributes



<a name="transitions"></a>
### transitions

Registry of pane transitions.
A local version of `Navstack.transitions`.

<a name="adaptors"></a>
### adaptors

Registry of suitable adaptors.
A local version of `Navstack.adaptors`.

<a name="panes"></a>
### panes

Index of panes that have been registered with this Navstack.
Object with pane names as keys and [Pane] instances as values.

```js
nav.push('home', function () { ... });

nav.panes['home']
nav.panes['home'].name   //=> 'home'
nav.panes['home'].el     //=> DOMElement
nav.panes['home'].view
```

<a name="active"></a>
### active

The active pane. This is a [Pane] instance.

```js
nav.push('home', function() { ... });

// later:
nav.active.name   //=> 'home'
nav.active.el     //=> DOMElement
nav.active.view
```

It is a pointer to the active pane in the [panes] object.

```js
nav.push('home', function() { ... });

// later:
nav.active === nav.panes['home']
```

<a name="stack"></a>
### stack
> `Array`

Ordered array of pane names of what are the panes present in the stack.
When doing [push()], you are adding an item to the stack.

```js
stage.push('home', function() { ... });
stage.stack == ['home'];

stage.push('timeline', function() { ... });
stage.stack == ['home', 'timeline'];

stage.push('home');
stage.stack == ['home'];
```

<a name="transition"></a>
### transition

The transition name to be used. Defaults to `"slide"`.  This can either
be a *String* (a transition name), a *Function*, or `false` (no animations).

```js
stage = new Navstack({
  transition: 'slide',
  groupTransition: 'modal'
});

// the second push here will use the slide animation.
stage.push('home', function() { ... });
stage.push('mentions', function() { ... });

// this will use the modal transition, as its in a different group.
stage.push('auth!login', function() { ... });
```

<a name="groupTransition"></a>
### groupTransition

Pane transition to use in between groups. Defaults to `"modal"`.
See [transition](#transition) for more details.

<a name="el"></a>
### el

The DOM element of the stack.  You may specify this while creating a
Navstack instance. When no `el` is given, it will default to creating a
new `<div>` element.

```js
stage = new Navstack({
  el: document.getElementById('#box')
});
```

You may also pass a jQuery object here for convenience.

```js
stage = new Navstack({
  el: $('#box')
});
```

You can access this later in the `Navstack` instance:

```js
$(stage.el).show()
```

<a name="Methods"></a>
## Methods



<a name="push"></a>
### push
> `.push(name, [options], [fn])`

Registers a pane with the given `name`.

The function will specify the initializer that will return the view to
be pushed. It can return a DOM node, a [jQuery] object, a [Backbone] view,
[Ractive] instance, or a [React] component.

```js
stage.push('home', function() {
  return $("<div>...</div>");
});
```

You can specify a pane's group by prefixing the name with the group name
and a bang.

```js
stage.push('modal!form', function() {
  return $("<div>...</div>");
});
```

You can specify options.

```js
stage.push('home', { ... }, function() {
  return $("<div>...</div>");
});
```

<a name="init"></a>
### init

Constructor. You may override this function when subclassing via
[Navstack.extend] to run some code when subclassed stack is
instanciated.

```js
var MyStack = Navstack.extend({
  init: function() {
    // initialize here
  }
});
```

<a name="remove"></a>
### remove

Destroys the Navstack instance, removes the DOM element associated with
it.

```js
stage = new Navstack({ el: '#stack' });
stage.remove();
```

This is also aliased as *.teardown()*, following Ractive's naming conventions.

<a name="ready"></a>
### ready
> `ready(fn)`

Runs a function `fn` when transitions have elapsed. If no transitions
are happening, run the function immediately.

```js
nav = new Navstack();
nav.push('home', function () { ... });
nav.push('messages', function () { ... });

nav.ready(function () {
  // gets executed only after transitions are done
});
```

<a name="Events"></a>
## Events

A stack may emit events, which you can listen to via [on()]. Available events are:

* `remove` <span class='dash'>&mdash;</span> called when removing the stack.

<a name="on"></a>
### on
> `.on(event, function)`

Binds an event handler.

```js
stage.on('remove', function() {
  // do things
});
```

<a name="off"></a>
### off
> `.off(event, callback)`

Removes an event handler.

```js
stage.off('remove', myfunction);
```

<a name="one"></a>
### one
> `.one(event, callback)`

Works like `.on`, except it unbinds itself right after.

<a name="Navstack_Pane"></a>
## Navstack.Pane

A pane. Panes are accessible via `navstack.panes['name']` or
`navstack.active`. You'll find these properties:

```js
pane.name
pane.initializer  // function
pane.el
pane.view
```

<a name="name"></a>
### name

The identification `name` of this pane, as passed to [push()] and
[register()].

<a name="transition"></a>
### transition

the transition to use for this pane. (String)

<a name="initializer"></a>
### initializer

Function to create the view.

<a name="parent"></a>
### parent

Reference to `Navstack`.

<a name="el"></a>
### el

DOM element. Created on `init()`.

<a name="view"></a>
### view

View instance as created by initializer. Created on `init()`.

<a name="adaptor"></a>
### adaptor

A wrapped version of the `view`

<a name="Static_members"></a>
## Static members

These are static members you can access from the global `Navstack` object.

<a name="Navstack_extend"></a>
### Navstack.extend
> `extend(prototype)`

Subclasses Navstack to create your new Navstack class. This allows you to
create 'presets' of the options to be passed onto the constructor.

```js
var Mystack = Navstack.extend({
  transition: 'slide'
});

// doing this is equivalent to passing `transition: 'slide'` to the
// options object.
var stack = new Mystack({ el: '#stack' });
```

<a name="Navstack_transitions"></a>
### Navstack.transitions

The global transitions registry. It's an Object where transition functions are
stored.

Whenever a transition is used on a Navstack (eg, with `new Navstack({
transition: 'foo' })`), it is first looked up in the stack's own registry
([transitions]). If it's not found there, it's then looked up in the
global transitions registry, `Navstack.transitions`.

You can define your own transitions via:

```js
Navstack.transitions.foo = function (direction, previous, current) {

  // this function should return an object with 3 keys: `before`,
  // `run`, and `after`. Each of them are asynchronous functions
  // that will perform different phases of the transition.
  //
  // you can use the arguments:
  //
  //   direction - this is either "first", "forward", or "backward".
  //   previous  - the previous pane. This an instance of [Pane].
  //   current   - the pane to transition to.

  return {
    before: function (next) {
      // things to perform in preparation of a transition,
      // such as hide the current pane.
      // invoke next() after it's done.

      if (current) $(current.el).hide();
      next();
    },

    run: function (next) {
      // run the actual transition.
      // invoke next() after it's done.

      if (current)  $(current.el).show();
      if (previous) $(previous.el).hide();
      next();
    },

    after: function (next) {
      // things to perform after running the transition.
      // invoke next() after it's done.
      next();
    }
  }
};
```

<a name="Navstack_adaptors"></a>
### Navstack.adaptors

Adaptors registry.

<a name="Navstack_jQuery"></a>
### Navstack.jQuery

Pointer to the instance of jQuery to optionally use. Set this if you would
like Navstack to utilize [jQuery.queue].

```js
Navstack.jQuery = jQuery;
```

[jQuery.queue]: http://api.jquery.com/queue/
[Ractive]: http://ractivejs.org
[React]: http://facebook.github.io/react
[Backbone]: http://backbonejs.org
[jQuery]: http://jquery.com
[on]: #on
[Pane]: #pane
[push]: #push
<!-- /include: navstack.js -->

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
[on]: #on
[Pane]: #pane
[push]: #push

Thanks
------

**Navstack** © 2014, Rico Sta. Cruz. Released under the [MIT License].<br>
Authored and maintained by Rico Sta. Cruz with help from [contributors].

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT License]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/navstack/contributors
