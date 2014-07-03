require './setup'

testSuite 'Ready:', ->
  beforeEach ->
    @log = []

  beforeEach ->
    @stack = new Navstack
      transition: 'slide'

  beforeEach 'stub runTransition', ->
    sinon.stub @stack, 'runTransition', (a, dir, cur, prev, fn) =>
      setImmediate => @log.push 'transition'
      setImmediate fn

  describe '.transitioning', ->
    it 'becomes true after a push', ->
      @stack.push 'root', -> $("<div>")
      expect(@stack.transitioning).eql true

    it 'becomes false after transitions', (done) ->
      @stack.push 'root', -> $("<div>")
      @stack.ready =>
        expect(@stack.transitioning).eql false
        done()

  describe '.ready', ->
    it 'gives the correct sequence', (done) ->
      @log.push 'push'
      @stack.push 'root', -> $("<div>")
      @stack.ready =>
        expect(@log).eql ['push', 'transition']
        done()
