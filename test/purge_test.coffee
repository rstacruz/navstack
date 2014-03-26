require './setup'

testSuite 'Purging', ->
  beforeEach ->
    @stack = new Navstack()

  describe '.purgePane()', ->
    beforeEach ->
      @stack.push 'a', -> $("<div>")
      @stack.push 'b', -> $("<div>")
      @stack.push 'c', -> $("<div>")
      @stack.push 'd', -> $("<div>")
      @stack.push 'e', -> $("<div>")
      @stack.purgePane('c')

    it 'removes pane', ->
      expect(@stack.panes.c).be.undefined

    it 'correct stack', ->
      expect(@stack.stack).eql ['a', 'b', 'd', 'e']

    it 'triggers the event "purge"', (done) ->
      @stack.one 'purge', (e, pane) ->
        expect(pane.name).eq 'a'
        done()
      @stack.purgePane('a')

    it 'triggers the event "purge:id"', (done) ->
      @stack.one 'purge:a', (e, pane) ->
        expect(pane.name).eq 'a'
        done()
      @stack.purgePane('a')

  describe 'purgeObsolete', ->
    it 'purge forward panes', ->
      @stack.push 'a', -> $("<div>")
      @stack.push 'b', -> $("<div>")
      @stack.push 'c1', -> $("<div>")
      @stack.push 'c2', -> $("<div>")
      @stack.go('b')
      @stack.push 'd', -> $("<div>")

      expect(@stack.stack).eql ['a', 'b', 'd']
      expect(@stack.panes['c']).be.undefined

xdescribe 'Purging', ->
  beforeEach ->
    @stack = new Navstack()

  it 'account for zIndex', ->
    @stack.push 'item:1', -> $("<div>")
    @stack.push 'home', zIndex:-1, -> $("<div>")
    @stack.push 'item:2', -> $("<div>")

    expect(@stack.stack).eq ['home', 'item:2']
    expect(@stack.panes['item:1']).be.undefined

xdescribe 'zIndex', ->
  it 'zIndex', ->
    @stack.push 'item', -> $("<div>")
    @stack.push 'home', zIndex:-1, -> $("<div>")

    expect(@stack.stack).eql ['home', 'item']

