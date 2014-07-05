require './setup'

testSuite 'Repeat', ->
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
    it '.push', ->
      view = @stack.push 'home', ->
        { el: div(), title: "Home view", remove: (->), trigger: sinon.spy() }

      expect(view.title).eq "Home view"

    it '.push x2', ->
      count = 0

      view1 = @stack.push 'home', ->
        count++
        { el: div(), title: "Home view", remove: (->), trigger: sinon.spy() }

      view2 = @stack.push 'home', ->
        { el: div(), title: "I'm ignored", remove: (->), trigger: sinon.spy() }

      expect(view1.title).eq "Home view"
      expect(view2.title).eq "Home view"
      expect(count).eq 1

  describe '.register, .go', ->
    beforeEach ->
      sinon.spy @stack, 'spawnPane'

      @stack.register 'home', ->
        { el: div(), title: "Home view", remove: (->), trigger: sinon.spy() }

    it 'should work', ->
      view = @stack.go 'home'
      expect(view.title).eq "Home view"

    it 'double .go', ->
      view = @stack.go 'home'
      expect(view.title).eq "Home view"
      expect(@stack.spawnPane).calledOnce

