require './setup'

testSuite 'No extra markup', ->
  beforeEach ->
    @stack = new Navstack()

  it 'don\'t create elements', ->
    @stack.push 'home', ->
      el = document.createElement('DIV')
      el.innerHTML = 'hi'
      el

    expect(@stack.el.children).have.length 1
    expect(@stack.el.children[0].innerHTML).eq 'hi'

