require './setup'

testSuite 'Pre registration', ->
  beforeEach ->
    @$el = $("<div>").appendTo('body')
    @stack = new Navstack
      el: @$el

  afterEach ->
    @stack.remove()

  describe '.push', ->
    it '.push', ->
      view = @stack.push 'home', (el) ->
        $(el).html("<div id='home'>Home</div>")
        "[Home view]"

      expect(view).eq "[Home view]"

    it '.push x2', ->
      count = 0
      view1 = @stack.push 'home', (el) ->
        $(el).html("<div id='home'>Home</div>")
        count++
        "[Home view]"

      view2 = @stack.push 'home', (el) ->
        $(el).html("<div id='home'>Home</div>")
        "[Other home view is ignored]"

      expect(view1).eq "[Home view]"
      expect(view2).eq "[Home view]"
      expect(count).eq 1

  describe '.go', ->
    beforeEach ->
      @stack.register 'home', (el) ->
        $(el).html("<div id='home'>Home</div>")
        "[Home view]"

    it 'should work', ->
      view = @stack.go 'home'
      expect(view).eq "[Home view]"
