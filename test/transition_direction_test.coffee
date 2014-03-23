require './setup'

describe 'Transition direction', ->
  noop = (a, b, c, next) -> next()

  beforeEach ->
    @stack = new Navstack()


  it 'first', (done) ->
    @stack.one 'transition', (e) ->
      expect(e.direction).eq 'first'
      done()

    @stack.push('home', ->)

  it 'forward, on 2nd', (done) ->
    @stack.push 'home', ->

    @stack.one 'transition', (e) ->
      expect(e.direction).eq 'forward'
      done()

    @stack.push 'messages', ->

  xit 'backward, on 3nd', (done) ->
    assert.fail "Actually returns forward. wtf"

    @stack.push 'home', ->
    @stack.push 'messages', ->

    @stack.one 'transition', (e) ->
      expect(e.direction).eq 'backward'
      done()

    @stack.go 'home'

