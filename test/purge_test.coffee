require './setup'

testSuite 'Purging:', ->
  beforeEach ->
    @stack = new Navstack()

  describe '.purgePane()', ->
    it 'triggers navstack:remove', (done) ->
      $div = $("<div>")
      $div.on 'navstack:remove', -> done()
      @stack.push 'a', -> $div
      @stack.purgePane('a')

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
      @stack.one 'purge', (pane) ->
        expect(pane.name).eq 'a'
        done()
      @stack.purgePane('a')

    it 'triggers the event "purge:id"', (done) ->
      @stack.one 'purge:a', (pane) ->
        expect(pane.name).eq 'a'
        done()
      @stack.purgePane('a')

    it 'remove from dom', ->
      adaptor = @stack.panes.a.adaptor
      sinon.spy adaptor, 'remove'

      @stack.purgePane('a')

      expect(adaptor.remove.calledOnce).be.true

  describe 'purgeObsolete', ->
    beforeEach ->
      @stack.push 'a', -> $("<div>")
      @stack.push 'b', -> $("<div>")
      @stack.push 'c1', -> $("<div>")
      @stack.push 'c2', -> $("<div>")
      @stack.go('b')
      @stack.push 'd', -> $("<div>")

    it 'purge forward panes from stack', ->
      expect(@stack.stack).eql ['a', 'b', 'd']

    it 'remove', ->
      expect(@stack.panes['c1']).be.undefined
      expect(@stack.panes['c2']).be.undefined

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

