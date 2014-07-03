require './setup'

testSuite 'Purge all:', ->
  beforeEach ->
    @stack = new Navstack()

  describe '.cleanup() and .purgeAll()', ->
    beforeEach ->
      @stack.push 'a', -> $("<div>")
      @stack.push 'b', -> $("<div>")
      @stack.push 'c', -> $("<div>")
      @stack.push 'd', -> $("<div>")
      @stack.push 'e', -> $("<div>")

    it 'cleans all panes but the current', (done) ->
      @stack.push 'c'
      @stack.cleanup()
      @stack.ready =>
        expect(Object.keys(@stack.panes)).eql ['c']
        done()

    it 'triggers navstack:remove', (done) ->
      $(@stack.panes.a.el).on 'navstack:remove', -> done()
      @stack.cleanup()
