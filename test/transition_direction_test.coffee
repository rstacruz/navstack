require './setup'

testSuite 'Transition direction', ->
  noop = (a, b, c, next) -> next()

  beforeEach ->
    @stack = new Navstack()

  it 'first', (done) ->
    @stack.one 'push', (e) ->
      expect(e.direction).eq 'first'
      done()

    @stack.push 'home', -> $("<div>")

  it 'forward, on 2nd', (done) ->
    @stack.push 'home', -> $("<div>")

    @stack.one 'push', (e) ->
      expect(e.direction).eq 'forward'
      done()

    @stack.push 'messages', -> $("<div>")

  it 'backward, on 3nd', (done) ->
    @stack.push 'home', -> $("<div>")
    @stack.push 'messages', -> $("<div>")

    @stack.one 'push', (e) ->
      expect(e.direction).eq 'backward'
      done()

    @stack.go 'home'

