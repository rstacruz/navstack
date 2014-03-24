require './setup'

testSuite 'Stack', ->
  it 'should work', ->
    # ok
  
  it 'should define global', ->
    expect(window.Navstack).be.a 'function'

  describe 'sanity tests', ->
    beforeEach ->
      @chrome = new Navstack()

    it 'instanciatable', ->
      expect(@chrome).instanceOf Navstack

    it '.stack', ->
      expect(@chrome.stack).object

  describe 'tabs', ->
    beforeEach ->
      @chrome = new Navstack(el: 'body')

      @chrome.register 'home', ->
        { el: $('<div><h1>hi</h1></div>'), number: 31337 }

      @chrome.register 'messages', ->
        { el: $('<div>') }

    describe 'before navigation', ->
      it 'class', ->
        expect($ 'body[data-stack]').length 1

      it 'empty', ->
        expect($(@chrome.el).find('>*').length).eql 0

      it '.stack', ->
        expect(@chrome.stack).be.array
        expect(@chrome.stack).be.empty

      it '.active', ->
        expect(@chrome.active).be.null

    describe 'after navigation', ->
      beforeEach ->
        @chrome.go 'home'

      beforeEach ->
        @$pane = $(@chrome.el).find('>*')

      it 'should have one pane', ->
        expect(@$pane.length).eq 1

      it 'pane should be data-stack-pane', ->
        expect(@$pane.is('[data-stack-pane]')).true

      it '.panes["home"]', ->
        expect($ @chrome.panes.home.el).have.html '<h1>hi</h1>'

      it '.stack.length', ->
        expect(@chrome.stack.length).eq 1

      it '.active', ->
        expect(@chrome.active).be.object

      it '.active.el', ->
        expect($(@chrome.active.el)[0].outerHTML).eql @$pane[0].outerHTML

      it '.active.name', ->
        expect(@chrome.active.name).eql 'home'

      it '.active.view', ->
        expect(@chrome.active.view.number).eql 31337
