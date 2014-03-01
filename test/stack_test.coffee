testSuite 'stack', ->
  HomeView = undefined

  beforeEach ->
    HomeView = Ractive.extend({})

  it 'should work', ->
    # ok
  
  it 'should define global', ->
    expect(window.RNavigator).be.a 'function'

  describe 'sanity tests', ->
    beforeEach ->
      @chrome = new RNavigator()

    it 'instanciatable', ->
      expect(@chrome).instanceOf RNavigator

    it '.stack', ->
      expect(@chrome.stack).object

  describe 'tabs', ->
    beforeEach ->
      @chrome = new RNavigator(el: 'body')

      @chrome.register 'home', (el) =>
        new HomeView(el: el, template: '<h1>hi</h1>')

      @chrome.register 'messages', (el) ->

    describe 'before navigation', ->
      it 'class', ->
        expect($ 'body').have.class 'rstack'

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

      it 'pane should be .rstack-pane', ->
        expect(@$pane).have.class 'rstack-pane'

      it '.panes["home"]', ->
        expect($ @chrome.panes.home.el).have.html '<h1>hi</h1>'

      it '.stack count', ->
        expect(@chrome.stack).have.length 1

      it '.stack[0]', ->
        expect(@chrome.stack[0]).eq @chrome.panes.home

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
