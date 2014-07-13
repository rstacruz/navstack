require './setup'

describe 'Invalid pane', ->
  beforeEach ->
    @stack = new Navstack()
    @stack.push 'a', -> document.createElement('DIV')

  it 'should error', ->
    expect(=>
      @stack.go('b')
    ).throw /unknown pane 'b'/
