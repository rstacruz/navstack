require './setup'

describe 'Go delegates', ->
  beforeEach ->
    @stack = new Navstack()

  afterEach ->
    @stack.remove()

  describe '._getDirection()', ->
    beforeEach ->
      @stack.push 'home', (el) -> { }
      @stack.push 'settings', (el) -> { }

    it 'forward', ->
      dir = @stack._getDirection('home', 'settings')
      expect(dir).eq 'forward'

    it 'backward', ->
      dir = @stack._getDirection('settings', 'home')
      expect(dir).eq 'backward'

    it 'first', ->
      dir = @stack._getDirection(null, 'settings')
      expect(dir).eq 'first'
