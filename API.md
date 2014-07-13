<a name="Navstack"></a>
## Navstack
> `new Navstack(options)`

A stack. Instanciate a new stack:

```js
stage = new Navstack({
  el: '#stack'
});
```

You may pass these options (all of them are optional):

* `el` <span class='dash'>&mdash;</span> a selector, a jQuery object, or a DOM element.
* `transition` <span class='dash'>&mdash;</span> a string of the transition name to use.
* `groupTransition` <span class='dash'>&mdash;</span> a string of the transition to use in between groups.

You'll then use [push].

```js
stage
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

<a name="el"></a>
### el

The DOM element.

```js
$(nav.el).show()
```

<a name="Methods"></a>
## Methods



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

<a name="Events"></a>
### Events

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

<a name="push"></a>
### push
> `.push(name, [options], [fn])`

Registers a pane.

```js
nav.push('home', function() {
  return $("<div>...</div>");
});
```

<a name="transition"></a>
### transition

Pane transition. This can either be a *String* or a *Function*.

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

Pane transition to use in between groups.

<a name="remove"></a>
### remove

Destroys the Navstack instance, removes the DOM element associated with
it.

```js
stage = new Navstack({ el: '#stack' });
stage.remove();
```

<a name="teardown"></a>
### teardown

Alias for [remove()]. This alias exists so that stacks behave a bit more like
Ractive components.

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
[on]: #on
[Pane]: #pane
[push]: #push
