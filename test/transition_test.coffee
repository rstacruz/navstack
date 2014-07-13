require './setup'

# For some reason, it randomly fails in jQuery 1.7
describe 'Transitions:', ->
  classNames = (what) -> window.document.querySelector(what).className.split(' ')

  # Stub the queueing mechanism
  beforeEach ->
    sinon.stub Navstack, 'queue', (fn) -> setImmediate -> fn(->)

  beforeEach ->
    @parent = $("<section id='parent'>").appendTo("body")
    @stack = new Navstack
      transition: 'slide'
      el: @parent

  beforeEach ->
    @stack.push 'home', -> $("<div id='previous'>")
    @stack.push 'messages', -> $("<div id='current'>")

  afterEach ->
    @stack.teardown()

  # Ensure that the animations die off properly
  afterEach ->
    $("<div>").trigger('animationend')

  # Before any animations start
  describe 'before animations start', ->
    it 'leave parent alone', ->
      expect(classNames "#parent").include '-navstack'

    it 'must keep the current pane hidden', ->
      expect(classNames "#current").include '-navstack-hide'

    it 'run queue', (done) ->
      setTimeout (->
        expect(Navstack.queue.callCount).gte 1
        done()
      ), 25

  # While animations are running
  describe 'an animation run', ->
    beforeEach (done) ->
      setTimeout done, 10

    it 'must run queue() a few times', ->
      expect(Navstack.queue.callCount).gte 2

    it 'must work on the parent container', ->
      expect(classNames "#parent").include 'slide-container'

    it 'must trigger the enter animation', ->
      expect(classNames "#current").include 'slide-enter-forward'

    it 'must trigger the exit animation', ->
      expect(classNames "#previous").include 'slide-exit-forward'

  # After animations run
  describe 'completing an animation', ->
    beforeEach (done) ->
      setTimeout done, 10

    trigger = (el, event) ->
      if el['_on'+event]
        el['_on'+event]()
      else
        event = window.document.createEvent('HTMLEvents')
        event.initEvent(event, true, false)
        el.dispatchEvent(event)

    qs = (sel) ->
      window.document.querySelector(sel)

    beforeEach (done) ->
      trigger qs('#current'), 'animationend'
      setTimeout done, 10

    it 'must remove classes from parent', ->
      expect(classNames "#parent").include '-navstack'

    it 'must remove classes from current', ->
      expect(classNames "#current").include '-navstack-pane'

    it 'must remove classes from previous', ->
      expect(classNames "#previous").include '-navstack-pane'
      expect(classNames "#previous").include '-navstack-hide'

    it 'must run queue() a few times', ->
      expect(Navstack.queue.callCount).gte 2
