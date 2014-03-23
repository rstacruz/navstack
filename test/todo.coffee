describe 'To do: v0.2', ->
  describe 'features', ->
    it 'double initialization', ->

    it 'custom transitions', ->
      expect(Navstack.transitions).be.object

  xit '"no extra markup" mode', ->

  describe 'stack', ->
    xit 'rename .stack to .cache', ->
    xit 'write a proper .stack', ->

  describe 'flushing', ->
    xit 'flushing of cached panes', ->

  describe 'custom pane settings', ->
    xit 'push(name, object, fn)', ->

  describe 'events', ->
    it '.on, .off, .one', ->
      expect(Navstack.prototype.on).be.function
      expect(Navstack.prototype.off).be.function
      expect(Navstack.prototype.one).be.function
