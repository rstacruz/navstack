require './setup'

testSuite 'Repeat', ->
  beforeEach ->
    @$el = $("<div>").appendTo('body')
    @stack = new Navstack
      el: @$el

  afterEach ->
    @stack.remove()

  describe '.push', ->
    it '.push', ->
      view = @stack.push 'home', ->
        { el: $("<div>"), title: "Home view", remove: -> }

      expect(view.title).eq "Home view"

    it '.push x2', ->
      count = 0

      view1 = @stack.push 'home', ->
        count++
        { el: $("<div id='home'>Home</div>"), title: "Home view", remove: -> }

      view2 = @stack.push 'home', ->
        { el: $("<div id='home'>Home</div>"), title: "I'm ignored", remove: -> }

      expect(view1.title).eq "Home view"
      expect(view2.title).eq "Home view"
      expect(count).eq 1

  describe '.register, .go', ->
    beforeEach ->
      @stack.register 'home', ->
        { el: $("<div>"), title: "Home view", remove: -> }

    it 'should work', ->
      view = @stack.go 'home'
      expect(view.title).eq "Home view"
