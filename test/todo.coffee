describe 'To do: v0.2', ->
  xdescribe 'todo', ->
    it 'push(name, object, fn)', ->
      # passing an options object (.push('name', {}, function() {}))
      # should work.

    it 'zindex', ->
      # .push('xxx', { zIndex: 0 }) should be handled.

    it 'purging', ->
      # going back then .push()ing should purge the later panes.

    it 'update CSS for "no extra markup" mode', ->
      # don't use .full-screen and >* anymore.

  describe 'done', ->
    it 'adaptors', ->
      expect(Navstack.adaptors).be.an 'object'

    it '"no extra markup" mode', ->
      # no extra <div>s.

    it 'double initialization', ->
      # two consecutive .push()es should be handled.

    it 'custom transitions', ->
      expect(Navstack.transitions).be.object

    it '.stack', ->
      @stack = new Navstack()
      expect(@stack.stack).be.array
      expect(@stack.stack).be.empty

    it '.events', ->
      expect(Navstack.prototype.on).be.a 'function'
      expect(Navstack.prototype.off).be.a 'function'
      expect(Navstack.prototype.one).be.a 'function'
