testSuite 'stack', ->
  HomeView = undefined

  beforeEach ->
    HomeView = Ractive.extend({})

  it 'should work', ->
    # ok
  
  it 'should define global', ->
    expect(window.RactiveStack).be.a 'function'

  describe 'sanity tests', ->
    beforeEach ->
      @chrome = new Stack()

    it 'instanciatable', ->
      expect(@chrome).instanceOf Stack

    it '.stack', ->
      expect(@chrome.stack).object

  describe 'tabs', ->
    beforeEach ->
      @chrome = new Stack(el: 'body')

      @chrome.register 'home', ($el) =>
        new HomeView(el: $el, template: '<h1>hi</h1>')

      @chrome.register 'messages', ($el) ->

    describe 'before navigation', ->
      it 'empty', ->
        expect($(@chrome.el).find('>*').length).eql 0

      it '.active', ->
        expect(@chrome.active).be.null

    describe 'after navigation', ->
      beforeEach ->
        @chrome.go 'home'

      beforeEach ->
        @$pane = $(@chrome.el).find('>*')

      it 'should have one pane', ->
        expect(@$pane.length).eq 1

      it 'pane should be .rstack-pane', ->
        expect(@$pane).have.class 'rstack-pane'

      it 'should register a stack subview', ->
        expect($ @chrome.stack.home.el).have.html '<h1>hi</h1>'

      it '.active', ->
        expect(@chrome.active).be.object

      it '.active.el', ->
        expect(@chrome.active.el.outerHTML).eql @$pane[0].outerHTML

      it '.active.name', ->
        expect(@chrome.active.name).eql 'home'

      it '.active.view', ->
        expect(@chrome.active.view).be.instanceOf HomeView

  xit 'prevent double initialization', ->

  xit 'flushing of cached panes', ->
