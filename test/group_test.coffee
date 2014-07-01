require './setup'

describe 'Groups', ->
  beforeEach ->
    @stack = new Navstack
      transition: 'slide'
      groupTransition: 'modal'

  beforeEach ->
    sinon.spy @stack, 'getTransition'
    sinon.spy @stack, 'runTransition'

    @transitions = ->
      @stack.getTransition.getCalls().map (c) -> c.args[0]

  it 'ok', ->
    @stack.push 'root!x', -> $("<div id='root-x'>")
    @stack.push 'modal!a', -> $("<div id='modal-a'>")
    expect(@stack.stack).eql ['root!x', 'modal!a']

  it 'save the proper group names', ->
    @stack.push 'root!x', -> $("<div>")
    pane = @stack.panes['root!x']
    expect(pane.name).eql 'root!x'
    expect(pane.group).eql 'root'

  it 'default group name', ->
    @stack.push 'x', -> $("<div>")
    pane = @stack.panes['x']
    expect(pane.group).eql ''

  describe 'groups', ->
    beforeEach ->

    it 'insert into proper position', ->
      @stack.push 'root!x', -> $("<div>")
      @stack.push 'modal!a', -> $("<div>")
      @stack.push 'root!y', -> $("<div>")
      expect(@stack.stack).eql ['root!x', 'root!y', 'modal!a']

    it 'do the correct transitions', ->
      @stack.push 'root!x', -> $("<div>")
      @stack.push 'modal!a', -> $("<div>")
      @stack.push 'root!y', -> $("<div>")
      expect(@transitions()).eql ['slide', 'modal', 'modal']
