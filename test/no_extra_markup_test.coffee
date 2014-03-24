require './setup'

describe 'No extra markup', ->
  beforeEach ->
    @stack = new Navstack()

  it 'create elements when needed (old behavior)', ->
    @stack.push 'home', (el) ->
      $(el).html('hi')

    expect(@stack.el.find('> div:first-child:last-child').html()).eq 'hi'

  it 'don\'t create elements', ->
    @stack.push 'home', ->
      { el: $("<div>hi</div>") }

    expect(@stack.el.find('> div:first-child:last-child').html()).eq 'hi'

