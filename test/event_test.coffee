require './setup'

describe 'Events', ->
  beforeEach ->
    @stack = new Navstack()

  afterEach ->
    @stack.remove()

  describe 'chaining', ->
    it '.on', ->
      expect(@stack.on('f', ->)).eq @stack

    it '.off', ->
      expect(@stack.off('f', ->)).eq @stack

    it '.one', ->
      expect(@stack.one('f', ->)).eq @stack

  describe '.one', ->
    it 'should only trigger once', (done) ->
      @stack.one 'transition', -> done()

      @stack.push 'home', ->
      @stack.push 'messages', ->
      @stack.push 'whatelse', ->

  describe '.on(remove)', ->
    it 'on remove', (done) ->
      @stack.one 'remove', -> done()
      @stack.remove()

  describe 'triggering', ->
    it 'should work', (done) ->
      @stack.on 'transition', (e) -> done()
      @stack.push 'home', ->

    it 'attributes', (done) ->
      @stack.push 'home', ->
        { id: "Home view" }

      @stack.on 'transition', (e) ->
        expect(e.direction).eq 'forward'
        expect(e.previous.name).eq 'home'
        expect(e.previous.view.id).eq 'Home view'

        expect(e.current.name).eq 'timeline'
        expect(e.current.view.id).eq 'Timeline view'
        done()

      @stack.push 'timeline', ->
        { id: "Timeline view" }
