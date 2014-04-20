<a name="Navstack"></a>
## Navstack `new Navstack(options)`

A stack. Instanciate a new stack:

```js
nav = new Navstack();
```

You may pass these options:

* `el` <span class='dash'>&mdash;</span> a selector, a jQuery object, or a DOM element.

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
Object with pane names as keys and `Pane` instances as values.

```js
nav.push('home', function () { ... });

nav.panes['home']
nav.panes['home'].name
nav.panes['home'].el
nav.panes['home'].view
```

<a name="active"></a>
### active

Alias for the active pane. This is a `Pane` instance.

<a name="stack"></a>
### stack

Ordered array of pane names of what are the actively.

<a name="emitter"></a>
### emitter

(Internal) event emitter.

<a name="el"></a>
### el

The DOM element.

```js
  $(nav.el).show()
```

<a name="init"></a>
### init

Constructor. Override me.

```js
var MyStack = Navstack.extend({

init: function() {


// initialize here

}
});
```

<a name="Events"></a>
### Events

There's events. Available events are:

* `remove` <span class='dash'>&mdash;</span> called when removing

<a name="on"></a>
### on `.on(event, function)`

Binds an event handler.

```js
nav.on('remove', function() {
  // do things
});
```

<a name="off"></a>
### off `.off(event, callback)`

Removes an event handler.

```js
nav.off('remove', myfunction);
```

<a name="one"></a>
### one `.one(event, callback)`

Works like `.on`, except it unbinds itself right after.

<a name="push"></a>
### push `.push(name, [fn])`

Registers a pane.

```js
nav.push('home', function() {
  return $("<div>...</div>");
});
```

<a name="go"></a>
### go `.go(name)`

(internal) Switches to a given pane `name`.

<a name="transition"></a>
### transition

Object
Pane transition.

<a name="remove"></a>
### remove

Removes and destroys the Navstack.

<a name="teardown"></a>
### teardown

Alias for `remove` (to make Navstack behave a bit more like Ractive
components).

<a name="getAdaptors"></a>
### getAdaptors

Returns the adaptors available.

<a name="getAdaptorFor"></a>
### getAdaptorFor `.getAdaptorFor(obj)`

Wraps the given `obj` object with a suitable adaptor.

```js
view = new Backbone.View({ ... });
adaptor = nav.getAdaptorFor(view);

adaptor.el()
adaptor.remove()
```

<a name="purgePane"></a>
### purgePane

(internal) Purges a given pane.

```js
this.purgePane('home');
this.purgePane(this.panes['home']);
```

<a name="getDirection"></a>
### getDirection `.getDirection(from, to)`

(internal) Returns the direction of animation based on the
indices of panes `from` and `to`.

```js
// Going to a pane
this.getDirection('home', 'timeline')
=> 'forward'

// Going from a pane
this.getDirection('timeline', 'home')
=> 'backward'

// Pane objects are ok too
this.getDirection(this.pane['home'], this.pane['timeline']);
```

<a name="spawnPane"></a>
### spawnPane `.spawnPane(name)`

(internal) Spawns the pane of a given `name`.
Returns the pane instance.

<a name="getTransition"></a>
### getTransition `.getTransition(transition)`

(internal) get the transition object for the given string `transition`.
Throws an error if it's invalid.

<a name="runTransition"></a>
### runTransition `.runTransition(...)`

(internal) performs a transition with the given `transition` object.

<a name="insertIntoStack"></a>
### insertIntoStack `.insertIntoStack(pane)`

(internal) updates `this.stack` to include `pane`, taking into
account Z indices.

```js
pane = this.pane['home'];
this.insertIntoStack(pane);
```

<a name="register"></a>
### register `.register(name, options, fn)`

(internal) Registers a pane `name` with initializer function `fn`,
allowing you to use `.go()` on the registered pane later.

This is called on `.push`.

<a name="extend"></a>
### extend

Subclasses Navstack to create your new Navstack class.

```js
var Mystack = Navstack.extend({
});
```

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

<a name="zIndex"></a>
### zIndex

determines the position in the stack. (Number)

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

<a name="init"></a>
### init

(internal) Initializes the pane's view if needed.

<a name="forceInit"></a>
### forceInit

(internal) Forces initialization even if it hasn't been yet.

<a name="Static_members"></a>
## Static members

These are static members you can access from the global `Navstack` object.

<a name="Navstack_buildTransition"></a>
### Navstack.buildTransition

buildTransition(prefix)
(internal) builds a transition for the given `prefix`.

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

<a name="Navstack_queue"></a>
### Navstack.queue

(internal) Queues animations.

<a name="Navstack_adaptors"></a>
### Navstack.adaptors

Adaptors registry.

<a name="buildAdaptor"></a>
### buildAdaptor

(internal) Helper for building a generic filter

<a name="Navstack_version"></a>
### Navstack.version

A string of the version of Navstack.
