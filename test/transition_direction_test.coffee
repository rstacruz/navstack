require './setup'

describe 'Transition direction', ->
  noop = (a, b, c, next) -> next()

  beforeEach ->
    Navstack.transitions.moo =
      before: noop
      after: noop
      run: noop

  beforeEach ->
    @stack = new Navstack(transition: 'moo')

  afterEach ->
    delete Navstack.transitions.moo

  it 'first', (done) ->
    Navstack.transitions.moo.run = (d, cur, prev, next) ->
      expect(d).eq 'first'
      expect(prev).be.null
      done()
      next()

    @stack.push('home', ->)

  it 'forward, on 2nd', (done) ->
    @stack.push 'home', ->

    Navstack.transitions.moo.run = (d, cur, prev, next) ->
      expect(d).eq 'forward'
      done()
      next()

    @stack.push 'messages', ->

  xit 'backward, on 3nd', (done) ->
    @stack.push 'home', ->
    @stack.push 'messages', ->

    Navstack.transitions.moo.run = (d, cur, prev, next) =>
      expect(d).eq 'backward'
      done()
      next()

    @stack.go 'home'
