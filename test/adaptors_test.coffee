require './setup'

testSuite 'Adaptors', ->
  it 'should be present', ->
    expect(Navstack.adaptors).be.a 'object'
    expect(Navstack.adapt).be.an 'array'

  describe '.getAdaptors()', ->
    beforeEach ->
      @stack = new Navstack()

    afterEach ->
      delete Navstack.adaptors.custom

    it 'defaults', ->
      adaptors = @stack.getAdaptors()

      expect(adaptors).have.length.gte 4

    it 'warn without proper adaptor', ->
      sinon.stub console, 'warn'
      @stack.adapt = ['x']
      @stack.getAdaptors()

      expect(console.warn.calledOnce).be.true

    it 'custom adaptors in instance', ->
      @stack.adaptors.custom =
        filter: (obj) ->
          obj.want is 'custom'
        wrap: (obj, self) ->
          { el: (-> "element"), remove: (->) }

      @stack.adapt = ['custom', 'jquery']
      adaptor = @stack.getAdaptorFor({ want: 'custom' })

      expect(adaptor.el()).eq "element"

    it 'custom adaptors in global', ->
      Navstack.adaptors.custom =
        filter: (obj) ->
          obj.want is 'custom'
        wrap: (obj, self) ->
          { el: (-> "element"), remove: (->) }

      @stack.adapt = ['custom', 'jquery']
      adaptor = @stack.getAdaptorFor({ want: 'custom' })

      expect(adaptor.el()).eq "element"
