require './setup'

describe 'Events', ->
  describe 'sanity', ->
    it '.on and .off', ->
      expect(Navstack.prototype.on).be.function
      expect(Navstack.prototype.off).be.function

    it '.one', ->
      expect(Navstack.prototype.one).be.function

  describe 'triggering', ->
    beforeEach ->
      @stack = new Navstack()

    afterEach ->
      @stack.remove()

    it 'should work', (done) ->
      @stack.on 'transition', (e) -> done()
      @stack.push 'home', ->

    it 'direction', (done) ->
      @stack.on 'transition', (e) ->
        expect(e.direction).eq 'first'
        done()

      @stack.push 'home', ->
