RNavigator
====

A view that manages multiple views. Perfect for tabs, navigation stacks, and 
similar. Inspired by iOS's UINavigationController.

### Basic usage

RNavigator is a `Ractive` class.

``` js
stage = new RNavigator({ el: '#stage' });

// Navigate to new pages using push
stage.push('home', function(el) {
  new Ractive({ el: el, ... });
});

// The first parameter is an ID for the pane to be pushed
stage.push('task:1', function(el) {
  new Ractive({ el: el, ... });
});

// Go back to old pages using .go() or .back()
stage.go('home');
stage.back();
```

### Tabs

You can also use it for tabs by creating your tab panes using `.register()` -- 
this tells RNavigator how to construct a tab as they're needed. This allows you to 
`.go()` to any tab at any time.

``` js
stage = new RNavigator({ el: '#stage' });

stage.register('home', function (el) {
  return new Ractive({
    el: el,
    template: "<h1>home</h1>"
  });
});

stage.register('messages', function (el) {
  return new Ractive({ ... });
});


stage.go('home');
stage.go('messages');
```

### As a class

``` js
Stage = RNavigator.extend({
  panes: {
    home: function (el) {
      return new Ractive({ el: el, ... });
    },
    messages: function (el) {
      return new Ractive({ el: el, ... });
    }
  }
});

stage = new Stage({ el: '#stage' });
stage.go('home');
```

### Transitions

Yep.

### Cheat sheet

``` js
stage = RNavigator.extend({
  panes: { ... },
  paneTransition: ...
});

stage.go('page');
stage.back();

stage.register('id', function (el) {
  /* create a view out of element `el` */
});

// Access the active pane
stage.active;
stage.active.el;    //=> <div>
stage.active.view;  //=> instance of Ractive
stage.active.name;  //=> "home"

// Access the stack
stage.stack;
stage.stack[0].view;
```
