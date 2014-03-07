Navstack
========

A view that manages multiple views. Perfect for tabs, navigation stacks, and 
similar. Inspired by iOS's UINavigationController.

 * __Framework-agnostic__: made to play fair with Backbone, [Ractive], React.js 
 and more. Can even work with plain old jQuery.

 * __Router-friendly__: made to be able to work with pushstate routers (like 
     page.js).

 * __Mobile-like transitions__: buttery-smooth transitions are available out of 
 the box.

### Basic usage

``` js
stage = new Navstack({ el: '#stage' });

// Navigate to new pages using push
stage.push('home', function(el) {
  $(el).html("<div class='full-screen'>This is the home screen</div>");
});

// The first parameter is an ID for the pane to be pushed
stage.push('task:1', function(el) {
  $(el).html("<div class='full-screen'>Task #1 details: ...</div>");
});

// Go back to old pages using .go() or .back()
stage.go('home');
```

### Tabs

You can also use it for tabs by creating your tab panes --
this tells Navstack how to construct a tab as they're needed. This allows you to 
`.go()` to any tab at any time.

``` js
stage = new Navstack({
  el: '#stage',
  panes: {
    home: function(el) {
      $(el).html("<div class='full-screen'>This is the home screen</div>");
    }
    messages: function(el) {
      $(el).html("<div class='full-screen'>Messages: ...</div>");
    }
  }

});

stage.go('home');
stage.go('messages');
```

### As a class

``` js
Stage = Navstack.extend({
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
stage = Navstack.extend({
  panes: { ... },
  transition: ...
});

stage.go('page');

stage.push('pane_id', function (el) {
  /* create a view out of element `el` */
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
