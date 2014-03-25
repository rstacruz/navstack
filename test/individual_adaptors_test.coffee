require './setup'

describe 'Individual adaptors', ->
  beforeEach ->
    @stack = new Navstack(el: $("<div>").appendTo('body'))

  describe 'adaptors.jquery', ->
    beforeEach ->
      @stack.adapt = ['jquery']
      @stack.push 'home', -> $("<div class='xyz'>hello</div>")

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el', ->
      expect(@stack.panes.home.el.html()).eq "hello"

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

  describe 'adaptors.ractive', ->
    beforeEach ->
      @stack.adapt = ['ractive']
      @stack.push 'home', ->
        div = $("<div class='xyz'>hello</div>")[0]
        el: div
        find: (sel) -> div
        teardown: -> $(".xyz").remove()

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el', ->
      expect($(@stack.panes.home.el).html()).eq "hello"

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

  describe 'adaptors.backbone', ->
    beforeEach ->
      @stack.adapt = ['backbone']
      @stack.push 'home', ->
        el: $("<div class='xyz'>hello</div>")
        remove: -> $(".xyz").remove()

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el', ->
      expect(@stack.panes.home.el.html()).eq "hello"

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined
