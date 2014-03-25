require './setup'

xdescribe 'Purging', ->
  beforeEach ->
    @stack = new Navstack()

  it 'purge forward panes', ->
    @stack.push 'a', -> { el: $("<div>") }
    @stack.push 'b', -> { el: $("<div>") }
    @stack.push 'c', -> { el: $("<div>") }
    @stack.go('c')
    @stack.push 'd', -> { el: $("<div>") }

    expect(@stack.stack).eq ['a', 'b', 'd']
    expect(@stack.panes['c']).be.undefined

  it 'account for zIndex', ->
    @stack.push 'item:1', -> { el: $("<div>") }
    @stack.push 'home', zIndex:-1, -> { el: $("<div>") }
    @stack.push 'item:2', -> { el: $("<div>") }

    expect(@stack.stack).eq ['home', 'item:2']
    expect(@stack.panes['item:1']).be.undefined

xdescribe 'zIndex', ->
  it 'zIndex', ->
    @stack.push 'item', -> { el: $("<div>") }
    @stack.push 'home', zIndex:-1, -> { el: $("<div>") }

    expect(@stack.stack).eq ['home', 'item']

