require './setup'

describe 'Push errors', ->
  it 'unknown pane', ->
    expect(->
      @stack = new Navstack()
      @stack.push 'hi', undefined
    ).throw /pane 'hi' has no initializer/

  it 'invalid pane initializer', ->
    expect(->
      @stack = new Navstack()
      @stack.push 'hi', 323423
    ).throw /pane 'hi' has no initializer/

  it 'no element found', ->
    expect(->
      @stack = new Navstack()
      @stack.push 'hi', ->
        el: null
        remove: ->

      expect(2).eq 3
    ).throw /no element found/
