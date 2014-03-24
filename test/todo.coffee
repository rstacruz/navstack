describe 'To do: v0.2', ->
  xdescribe 'todo', ->
    it 'push(name, object, fn)', ->
    it 'zindex', ->
    it 'purging', ->
    it 'update CSS for "no extra markup" mode', ->

  describe 'done', ->
    it '"no extra markup" mode', ->

    it 'double initialization', ->
      expect(true).be.true

    it 'custom transitions', ->
      expect(Navstack.transitions).be.object

    it '.stack', ->
      @stack = new Navstack()
      expect(@stack.stack).be.array
      expect(@stack.stack).be.empty

    it '.events', ->
      expect(Navstack.prototype.on).be.function
      expect(Navstack.prototype.off).be.function
      expect(Navstack.prototype.one).be.function
