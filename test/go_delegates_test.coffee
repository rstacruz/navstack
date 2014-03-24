require './setup'

describe 'Go delegates', ->
  beforeEach ->
    @stack = new Navstack()

  afterEach ->
    @stack.remove()

  describe '_getDirection()', ->
    beforeEach ->
      @stack.push 'home', -> { el: $("<div>") }
      @stack.push 'settings', -> { el: $("<div>") }

    it 'forward', ->
      dir = @stack._getDirection('home', 'settings')
      expect(dir).eq 'forward'

    it 'backward', ->
      dir = @stack._getDirection('settings', 'home')
      expect(dir).eq 'backward'

    it 'first', ->
      dir = @stack._getDirection(null, 'settings')
      expect(dir).eq 'first'

  describe '_getTransition()', ->
    afterEach ->
      delete Navstack.transitions.aoeu

    it 'get from global', ->
      Navstack.transitions.aoeu = { hello: 'world' }

      trans = @stack._getTransition('aoeu')
      expect(trans).be.object
      expect(trans.hello).eq 'world'

    it 'get from class', ->
      @stack.transitions.aoeu = { hello: 'world' }

      trans = @stack._getTransition('aoeu')
      expect(trans).be.object
      expect(trans.hello).eq 'world'

    it 'get from class constructor', ->
      @newstack = new Navstack
        transitions:
          aoeu: { hello: 'world' }

      trans = @newstack._getTransition('aoeu')
      expect(trans).be.object
      expect(trans.hello).eq 'world'

    it 'get from params', ->
      trans = @stack._getTransition(hello: 'world')
      expect(trans).be.object
      expect(trans.hello).eq 'world'
