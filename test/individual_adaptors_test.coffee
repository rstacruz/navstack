require './setup'

testSuite 'Individual adaptors', ->
  beforeEach ->
    @parent = $("<div>").appendTo('body')
    @stack = new Navstack(el: @parent)

  afterEach ->
    @parent.remove()

  describe 'adaptors.dom', ->
    beforeEach ->
      @sleep = sinon.spy()
      @wake = sinon.spy()
      @div = $("<div class='xyz'>hello</div>")[0]
      @div.addEventListener 'navstack:sleep', @sleep
      @div.addEventListener 'navstack:wake', @wake
      @stack.adapt = ['dom']
      @stack.push 'home', => @div

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el is a DOM node', ->
      expect(@stack.panes.home.el.nodeType).eql 1

    it 'el', ->
      expect($(@stack.panes.home.el).html()).eq "hello"

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

    xdescribe 'jsdom doesnt support custom events', ->
      it 'wake', ->
        expect(@wake.calledOnce).eql.true

      it 'sleep', ->
        @stack.push 'other', =>
          $("<div class='xyz'>hello</div>")[0]

        expect(@sleep.calledOnce).eql true

  describe 'adaptors.jquery', ->
    beforeEach ->
      @sleep = sinon.spy()
      @wake = sinon.spy()
      @stack.adapt = ['jquery']
      @stack.push 'home', =>
        $("<div class='xyz'>hello</div>")
          .on('navstack:sleep', @sleep)
          .on('navstack:wake', @wake)

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el is a DOM node', ->
      expect(@stack.panes.home.el.nodeType).eql 1

    it 'el', ->
      expect($(@stack.panes.home.el).html()).eq "hello"

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

    it 'wake', ->
      expect(@wake.calledOnce).eql.true

    it 'sleep', ->
      @stack.push 'other', =>
        $("<div class='xyz'>hello</div>")

      expect(@sleep.calledOnce).eql true

  describe 'adaptors.ractive', ->
    beforeEach ->
      @fire = sinon.spy()
      @stack.adapt = ['ractive']
      @stack.push 'home', =>
        div = $("<div class='xyz'>hello</div>")[0]
        el: div
        find: (sel) -> div
        teardown: -> $(".xyz").remove()
        fire: @fire

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el is a DOM node', ->
      expect(@stack.panes.home.el.nodeType).eql 1

    it 'wake', ->
      expect(@fire.calledOnce).eql.true
      expect(@fire.firstCall.args).eql ['navstack:wake']

    it 'sleep', ->
      @stack.push 'other', =>
        div = $("<div class='xyz'>hello</div>")[0]
        el: div
        find: (sel) -> div
        teardown: -> $(".xyz").remove()
        fire: ->

      expect(@fire.callCount).eql 2
      expect(@fire.secondCall.args).eql ['navstack:sleep']

    it 'el', ->
      expect($(@stack.panes.home.el).html()).eq "hello"

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

  describe 'adaptors.backbone', ->
    beforeEach ->
      @div = $("<div class='xyz'>hello</div>")[0]
      @trigger = sinon.spy()
      @stack.adapt = ['backbone']
      @stack.push 'home', =>
        el: @div
        remove: => $(@div).remove()
        trigger: @trigger

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'wake', ->
      expect(@trigger.calledOnce).eql.true
      expect(@trigger.firstCall.args).eql ['navstack:wake']

    it 'sleep', ->
      @stack.push 'other', =>
        el: $("<div class='xyz'>hello</div>")[0]
        remove: -> $(".xyz").remove()
        trigger: (->)

      expect(@trigger.callCount).eql 2
      expect(@trigger.secondCall.args).eql ['navstack:sleep']

    it 'el', ->
      expect($(@stack.panes.home.el).html()).eq "hello"

    it 'el is a DOM node', ->
      expect(@stack.panes.home.el.nodeType).eql 1

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

  describe 'adaptors.react', ->
    beforeEach ->
      @stack.adapt = ['react']

      @stack.push 'home', ->
        div = $("<div class='xyz'>hello</div>")[0]
        getDOMNode: -> div

    beforeEach ->
      window.React =
        unmountComponentAtNode: (el) -> $(el).remove()

    afterEach ->
      delete window.React

    it 'push', ->
      expect($('body > div > .xyz')[0]).not.be.undefined

    it 'el', ->
      expect($(@stack.panes.home.el).html()).eq "hello"

    it 'el is a DOM node', ->
      expect(@stack.panes.home.el.nodeType).eql 1

    it 'remove', ->
      @stack.panes.home.adaptor.remove()
      expect($('.xyz')[0]).be.undefined

