require './setup'

describe 'No extra markup', ->
  beforeEach ->
    @stack = new Navstack()

  it 'create elements when needed', ->
    @stack.push 'home', (el) ->
      $(el).html('hi')

    expect(@stack.el.find('> div')).have.length 1
    expect(@stack.el.find('> div').html()).eq 'hi'

  it 'don\'t create elements', ->
    @stack.push 'home', ->
      { el: $("<div>hi</div>") }

    expect(@stack.el.find('> div')).have.length 1
    expect(@stack.el.find('> div').html()).eq 'hi'

