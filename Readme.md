Navi
====

A view that manages multiple views. Perfect for tabs, navigation stacks, and 
similar. Inspired by iOS's UINavigationController.

### Basic usage

Here's a basic example that sets a stage for tabs.

``` js
stage = new Navi({ el: '#stage' });

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
