<a name="Navstack"></a>
## Navstack

A stack.

```js
nav = new Navstack();
```

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

<a name="register"></a>
### register

(internal) Registers a pane `name` with initializer function `fn`,
allowing you to use `.go()` on the registered pane later.

This is called on `.push`.

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
### off

(event, callback)
Removes an event handler.

```js
nav.off('remove', myfunction);
```

<a name="one"></a>
### one

.one(event, callback)
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
### getAdaptorFor

.getAdaptorFor(obj)
Wraps the given `obj` object with a suitable adaptor.

```js
view = new Backbone.View({ ... });
adaptor = nav.getAdaptorFor(view);

adaptor.el()
adaptor.remove()
```

<a name="purgePane"></a>
### purgePane

(Internal) Purges a given pane.

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
### spawnPane

.spawnPane(name)
(Internal) Spawns the pane of a given `name`.
Returns the pane instance.

<a name="getTransition"></a>
### getTransition

.getTransition(transition)
(Internal) get the transition object for the given string `transition`.
Throws an error if it's invalid.

<a name="extend"></a>
### extend

Subclasses Navstack to create your new Navstack class.
