require './setup'

describe 'Repeat:', ->
  div = ->
    document.createElement('DIV')

  beforeEach ->
    @$el = div()
    document.body.appendChild(@$el)
    @stack = new Navstack
      el: @$el

  afterEach ->
    @stack.remove()

  describe '.push', ->
    it 'should create the correct view', (done) ->
      @stack.push 'home', ->
        { el: div(), title: "Home view", remove: (->), trigger: sinon.spy() }

      @stack.ready =>
        expect(@stack.active.view.title).eq "Home view"
        done()

    it 'twice will ignore the next fn()', (done) ->
      count = 0

      view1 = @stack.push 'home', ->
        count++
        { el: div(), title: "Home view", remove: (->), trigger: sinon.spy() }

      view2 = @stack.push 'home', ->
        { el: div(), title: "I'm ignored", remove: (->), trigger: sinon.spy() }

      @stack.ready =>
        expect(@stack.active.view.title).eq "Home view"
        expect(count).eq 1
        done()

  describe '.register() and .go():', ->
    beforeEach ->
      sinon.spy @stack, 'spawnPane'

      @stack.register 'home', ->
        { el: div(), title: "Home view", remove: (->), trigger: sinon.spy() }

    it 'should work', (done) ->
      @stack.go 'home'

      @stack.ready =>
        expect(@stack.active.view.title).eq "Home view"
        done()

    it 'calling double .go should spawn pane just once', (done) ->
      @stack.go 'home'

      @stack.ready =>
        @stack.go 'home'

        @stack.ready =>
          expect(@stack.active.view.title).eq "Home view"
          expect(@stack.spawnPane).calledOnce
          done()
