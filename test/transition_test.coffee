require './setup'

# For some reason, it randomly fails in jQuery 1.7
describe 'Transitions', ->
  className = (what) -> $("#{what}").attr('class')

  # Stub the queueing mechanism
  beforeEach ->
    sinon.stub Navstack, 'queue', (fn) -> fn(->)

  beforeEach ->
    @stack = new Navstack
      transition: 'slide'
      el: $("<section id='parent'>").appendTo("body")

  beforeEach ->
    @stack.push 'home', -> $("<div id='previous'>")

  beforeEach (done) ->
    setTimeout done, 10

  beforeEach ->
    @stack.push 'messages', -> $("<div id='current'>")

  # Ensure that the animations die off properly
  afterEach ->
    $("<div>").trigger('animationend')

  # Before any animations start
  describe 'before', ->
    it 'leave parent alone', ->
      expect(className "#parent").eq '-navstack'

    it 'hide at first', ->
      expect(className "#current").match /slide-hide/

    it 'run queue', ->
      expect(Navstack.queue.callCount).gte 1

  # While animations are running
  describe 'run', ->
    beforeEach (done) ->
      setTimeout done, 10

    it 'run queue', ->
      expect(Navstack.queue.calledTwice).be.true

    it 'parent container', ->
      expect(className "#parent").match /slide-container/

    it 'enter animation', ->
      expect(className "#current").match /slide-enter-forward/

    it 'exit animation', ->
      expect(className "#previous").match /slide-exit-forward/

  # After animations run
  describe 'after', ->
    beforeEach (done) ->
      setTimeout done, 10

    beforeEach (done) ->
      $('#current').trigger('animationend')
      setTimeout done, 10

    it 'remove classes from parent', ->
      expect(className "#parent").eq '-navstack'

    it 'remove classes from current', ->
      expect(className "#current").eq '-navstack-pane'

    it 'remove classes from previous', ->
      expect(className "#previous").eq '-navstack-pane slide-hide'

    it 'run queue', ->
      expect(Navstack.queue.calledTwice).be.true
