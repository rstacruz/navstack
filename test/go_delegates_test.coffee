require './setup'

describe 'Go delegates', ->
  beforeEach ->
    @stack = new Navstack()

  afterEach ->
    @stack.remove()

  describe 'getDirection()', ->
    beforeEach ->
      @stack.push 'home', -> $("<div>")
      @stack.push 'settings', -> $("<div>")

    it 'forward', ->
      dir = @stack.getDirection('home', 'settings')
      expect(dir).eq 'forward'

    it 'backward', ->
      dir = @stack.getDirection('settings', 'home')
      expect(dir).eq 'backward'

    it 'first', ->
      dir = @stack.getDirection(null, 'settings')
      expect(dir).eq 'first'

  describe 'getTransition()', ->
    afterEach ->
      delete Navstack.transitions.aoeu

    it 'get from global', ->
      Navstack.transitions.aoeu = { hello: 'world' }

      trans = @stack.getTransition('aoeu')
      expect(trans).be.object
      expect(trans.hello).eq 'world'

    it 'get from class', ->
      @stack.transitions.aoeu = { hello: 'world' }

      trans = @stack.getTransition('aoeu')
      expect(trans).be.object
      expect(trans.hello).eq 'world'

    it 'get from class constructor', ->
      @newstack = new Navstack
        transitions:
          aoeu: { hello: 'world' }

      trans = @newstack.getTransition('aoeu')
      expect(trans).be.object
      expect(trans.hello).eq 'world'

    it 'get from params', ->
      trans = @stack.getTransition(hello: 'world')
      expect(trans).be.object
      expect(trans.hello).eq 'world'
