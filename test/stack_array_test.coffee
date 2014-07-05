require './setup'

describe 'Stack array', ->
  div = ->
    document.createElement('DIV')

  beforeEach ->
    @stack = new Navstack()

  afterEach ->
    @stack.remove()

  it 'on construction', ->
    expect(@stack.stack).be.array
    expect(@stack.stack).be.empty

  it 'one push', ->
    @stack.push 'home', -> div()

    expect(@stack.stack).have.length 1
    expect(@stack.stack[0]).eq 'home'

  it 'two pushes', ->
    @stack.push 'home', -> div()
    @stack.push 'timeline', -> div()

    expect(@stack.stack).have.length 2
    expect(@stack.stack[0]).eq 'home'
    expect(@stack.stack[1]).eq 'timeline'
