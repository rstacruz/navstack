testSuite 'Todo: v0.2', ->

  xdescribe 'todo', ->
    it 'push(name, object, fn)', ->
      # passing an options object (.push('name', {}, function() {}))
      # should work.

    it 'zindex', ->
      # .push('xxx', { zIndex: 0 }) should be handled.

    it 'purging', ->
      # going back then .push()ing should purge the later panes.

  describe 'done', ->

    it 'adaptors', ->
      # Navstack.adaptors

    it '"no extra markup" mode', ->
      # no extra <div>s.

    it 'double initialization', ->
      # two consecutive .push()es should be handled.

    it 'custom transitions', ->
      # Navstack.transitions

    it '.stack', ->
      # Navstack#stack

    it '.events', ->
      # .on, .off, .one

    it 'update CSS for "no extra markup" mode', ->
      # don't use .full-screen and >* anymore.

