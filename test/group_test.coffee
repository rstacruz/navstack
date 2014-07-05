require './setup'

testSuite 'Groups', ->
  div = (id) ->
    el = document.createElement('div')
    el.setAttribute 'id', id
    el

  beforeEach ->
    @stack = new Navstack
      transition: 'slide'
      groupTransition: 'modal'

  beforeEach ->
    sinon.spy @stack, 'getTransition'
    sinon.stub @stack, 'runTransition', (a, b, c, d, fn) -> setImmediate fn

    @transitions = ->
      @stack.getTransition.getCalls().map (c) -> c.args[0]

  # ensure we're done
  afterEach (done) ->
    @stack.ready -> done()

  it 'ok', ->
    @stack.push 'root!x', -> div('root-x')
    @stack.push 'modal!a', -> div('modal-a')
    expect(@stack.stack).eql ['root!x', 'modal!a']

  it 'save the proper group names', ->
    @stack.push 'root!x', -> div()
    pane = @stack.panes['root!x']
    expect(pane.name).eql 'root!x'
    expect(pane.group).eql 'root'

  it 'default group name', ->
    @stack.push 'x', -> div()
    pane = @stack.panes['x']
    expect(pane.group).eql ''

  it 'insert into proper position', ->
    @stack.push 'root!x', -> div()
    @stack.push 'modal!a', -> div()
    @stack.push 'root!y', -> div()
    expect(@stack.stack).eql ['root!x', 'root!y', 'modal!a']

  it 'do the correct transitions', ->
    @stack.push 'root!x', -> div()
    @stack.push 'modal!a', -> div()
    @stack.push 'root!y', -> div()
    expect(@transitions()).eql ['slide', 'modal', 'modal']

  describe 'pane element', ->
    beforeEach ->
      @div = div()
      @stack.push 'root!x', => @div

    it 'should have data-stack-pane', ->
      expect(@div.getAttribute('data-stack-pane')).eql 'root!x'

    it 'should have data-stack-group', ->
      expect(@div.getAttribute('data-stack-group')).eql 'root'
