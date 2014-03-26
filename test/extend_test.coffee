require './setup'

Mystack = null

testSuite 'Extend', ->
  describe 'instances', ->
    beforeEach ->
      Mystack = Navstack.extend
        three: -> 3

    beforeEach ->
      @stack = new Mystack()

    it 'instance methods', ->
      three = @stack.three()
      expect(three).eq 3

    it 'should work like navstack', ->
      expect(@stack.remove).be.a 'function'
      expect(@stack.el).be.an 'object'
