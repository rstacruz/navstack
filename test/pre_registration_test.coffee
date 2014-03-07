require './setup'

testSuite 'Pre registration', ->
  beforeEach ->
    @$el = $("<div>").appendTo('body')
    @stack = new Navstack
      el: @$el
      panes:
        home: (el) ->
          $(el).html("<div id='home'>Home</div>")
        messages: (el) ->
          $(el).html("<div id='messages'>Messages</div>")

  afterEach ->
    @stack.remove()

  beforeEach ->
    expect(@stack.stack.home).be.undefined
    @stack.go('home')

  it 'should register stack', ->
    expect(@stack.stack.home).be.object

  it 'pane exists', ->
    expect($ '#home').length 1

  it 'other pane doesn\'t exist', ->
    expect($ '#messages').length 0
