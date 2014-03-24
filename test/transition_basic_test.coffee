require './setup'

testSuite 'Transition basic', ->
  it 'should have transitions object', ->
    expect(Navstack.transitions).be.object

  it 'modal and slide', ->
    expect(Navstack.transitions.modal).be.object
    expect(Navstack.transitions.slide).be.object

  it 'before, run, after', ->
    expect(Navstack.transitions.slide.before).be.function
    expect(Navstack.transitions.slide.run).be.function
    expect(Navstack.transitions.slide.after).be.function

  it 'throw on invalid transition', ->
    @stack = new Navstack
      transition: 'foobar'

    try
      @stack.push 'home', -> { el: $("<div>") }
    catch e
      expect(e.message).match /invalid 'transition' value/

  describe 'run transitions', ->
    it 'run transitions', (done) ->
      order = ""
      Navstack.transitions.moo =
        before: (d, cur, prev, next) ->
          order += "1"
          next()
        run: (d, cur, prev, next) ->
          order += "2"
          next()
        after: (d, cur, prev, next) ->
          order += "3"
          expect(order).eq "123"
          done()

      @stack = new Navstack
        transition: 'moo'

      @stack.push 'home', -> { el: $("<div>") }

    afterEach ->
      delete Navstack.transitions.moo
