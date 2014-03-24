require './setup'

describe 'Transition direction', ->
  noop = (a, b, c, next) -> next()

  beforeEach ->
    @stack = new Navstack()

  it 'first', (done) ->
    @stack.one 'transition', (e) ->
      expect(e.direction).eq 'first'
      done()

    @stack.push 'home', -> { el: $("<div>") }

  it 'forward, on 2nd', (done) ->
    @stack.push 'home', -> { el: $("<div>") }

    @stack.one 'transition', (e) ->
      expect(e.direction).eq 'forward'
      done()

    @stack.push 'messages', -> { el: $("<div>") }

  it 'backward, on 3nd', (done) ->
    @stack.push 'home', -> { el: $("<div>") }
    @stack.push 'messages', -> { el: $("<div>") }

    @stack.one 'transition', (e) ->
      expect(e.direction).eq 'backward'
      done()

    @stack.go 'home'

