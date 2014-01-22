testSuite 'stack', ->
  $body = null
  Stack = null
  chrome = null
  $pane = null

  beforeEach ->
    $body = $("body")
    Stack = window.RactiveStack

  it 'should work', ->
  
  it 'should define global', ->
    expect(Stack).be.a 'function'

  describe 'sanity tests', ->
    beforeEach ->
      chrome = new Stack()

    it 'instanciatable', ->
      expect(chrome).instanceOf Stack

    it '#stack', ->
      expect(chrome.stack).object

  describe 'tabs', ->
    beforeEach ->
      chrome = new Stack(el: $body)
      chrome.register 'home', ($el) ->
        42
      chrome.register 'messages', ($el) ->

    describe 'before navigation', ->
    describe 'after navigation', ->
      beforeEach ->
        chrome.go 'home'

      beforeEach ->
        $pane = $(chrome.el).find('>*')

      it 'should have one pane', ->
        expect($pane.length).eq 1

      it 'pane should be .rstack-pane', ->
        expect($pane.is('.rstack-pane')).true

      it 'should register a stack subview', ->
        expect(chrome.stack.home).to.eq 42
