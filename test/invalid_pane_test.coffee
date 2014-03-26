require './setup'

testSuite 'Invalid pane', ->
  beforeEach ->
    @stack = new Navstack()
    @stack.push 'a', -> $("<div>")

  it 'should error', ->
    expect(=>
      @stack.go('b')
    ).throw /unknown pane 'b'/
