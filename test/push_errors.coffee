require './setup'

describe 'Push errors', ->
  it 'invalid pane initializer', ->
    try
      @stack = new Navstack()
      @stack.push 'hi', undefined
      expect(2).eq 3

    catch e
      expect(e.message).match /pane initializer is not a function/

  it 'no element found', ->
    try
      @stack = new Navstack()
      @stack.push 'hi', ->
        el: null
        remove: ->

      expect(2).eq 3

    catch e
      expect(e.message).match /no element found/
