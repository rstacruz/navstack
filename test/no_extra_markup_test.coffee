require './setup'

testSuite 'No extra markup', ->
  beforeEach ->
    @stack = new Navstack()

  it 'don\'t create elements', ->
    @stack.push 'home', -> $("<div>hi</div>")

    expect(@stack.el.find('> div:first-child:last-child').html()).eq 'hi'

