require './setup'

describe 'Push errors', ->
  it 'invalid pane initializer', ->
    expect(->
      @stack = new Navstack()
      @stack.push 'hi', undefined
    ).throw /pane initializer is not a function/

  it 'no element found', ->
    expect(->
      @stack = new Navstack()
      @stack.push 'hi', ->
        el: null
        remove: ->

      expect(2).eq 3
    ).throw /no element found/
