require './setup'

describe 'Events', ->
  describe 'sanity', ->
    it '.on and .off', ->
      expect(Navstack.prototype.on).be.function
      expect(Navstack.prototype.off).be.function

    it '.one', ->
      expect(Navstack.prototype.one).be.function

describe 'Events', ->
  beforeEach -> @stack = new Navstack()
  afterEach ->  @stack.remove()

  describe 'chaining', ->
    it '.on', ->
      expect(@stack.on('f', ->)).eq @stack

    it '.off', ->
      expect(@stack.off('f', ->)).eq @stack

    it '.one', ->
      expect(@stack.one('f', ->)).eq @stack

  describe 'one', ->
    it 'should only trigger once', (done) ->
      @stack.one 'transition', -> done()

      @stack.push 'home', ->
      @stack.push 'messages', ->
      @stack.push 'whatelse', ->

  describe 'triggering', ->
    it 'should work', (done) ->
      @stack.on 'transition', (e) -> done()
      @stack.push 'home', ->

    it 'direction', (done) ->
      @stack.on 'transition', (e) ->
        expect(e.direction).eq 'first'
        done()

      @stack.push 'home', ->
