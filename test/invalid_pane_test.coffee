require './setup'

testSuite 'Invalid pane', ->
  beforeEach ->
    @stack = new Navstack()
    @stack.push 'a', -> $("<div>")

  it 'should error', ->
    try
      @stack.go('b')
      expect(2).eq 3
    catch e
      expect(e.message).match /unknown pane 'b'/
