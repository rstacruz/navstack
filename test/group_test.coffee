require './setup'

describe 'Groups', ->
  beforeEach ->
    @stack = new Navstack()

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

  it 'insert into proper position', ->
    @stack.push 'root!x', -> $("<div id='root-x'>")
    @stack.push 'modal!a', -> $("<div id='modal-a'>")
    @stack.push 'root!y', -> $("<div id='root-y'>")
    expect(@stack.stack).eql ['root!x', 'root!y', 'modal!a']

