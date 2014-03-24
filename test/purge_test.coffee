require './setup'

xdescribe 'Purging', ->
  beforeEach ->
    @stack = new Navstack()

  afterEach ->
    @stack.remove()

  it 'ok', ->
    @stack.push 'a', (el) -> { }
    @stack.push 'b', (el) -> { }
    @stack.push 'c', (el) -> { }

    @stack.go('c')
    @stack.push 'd', (el) -> { }

  it 'zIndex', ->
    @stack.push 'item', (el) -> { }
    @stack.push 'home', zIndex: -1, (el) -> { }

    expect(@stack.stack).eq ['home', 'item']

  it 'account for zIndex', ->
    @stack.push 'item:1', (el) -> { }
    @stack.push 'home', zIndex: -1, (el) -> { }
    @stack.push 'item:2', (el) -> { }

    expect(@stack.stack).eq ['home', 'item:2']
    expect(@stack.panes['item:1']).be.undefined
