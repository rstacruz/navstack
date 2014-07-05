require './setup'

describe 'Transition direction', ->
  noop = (a, b, c, next) -> next()

  div = ->
    document.createElement('DIV')

  beforeEach ->
    @stack = new Navstack()

  it 'should be "first" on the first puh', (done) ->
    @stack.one 'push', (e) ->
      expect(e.direction).eq 'first'
      done()

    @stack.push 'home', -> div()

  it 'should be "forward" on the 2nd push', (done) ->
    @stack.push 'home', -> div()

    @stack.one 'push', (e) ->
      expect(e.direction).eq 'forward'
      done()

    @stack.push 'messages', -> div()

  it 'should be "backward" after pushing back', (done) ->
    @stack.push 'home', -> div()
    @stack.push 'messages', -> div()

    @stack.one 'push', (e) ->
      expect(e.direction).eq 'backward'
      done()

    @stack.go 'home'

