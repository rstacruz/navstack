require './setup'

describe 'Adaptors', ->
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

      expect(adaptors).have.length 4
      expect(adaptors[0]).eq Navstack.adaptors.backbone
      expect(adaptors[1]).eq Navstack.adaptors.ractive
      expect(adaptors[2]).eq Navstack.adaptors.react
      expect(adaptors[3]).eq Navstack.adaptors.generic

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

      @stack.adapt = ['custom', 'generic']
      adaptor = @stack.getAdaptorFor({ want: 'custom' })

      expect(adaptor.el()).eq "element"

    it 'custom adaptors in global', ->
      Navstack.adaptors.custom =
        filter: (obj) ->
          obj.want is 'custom'
        wrap: (obj, self) ->
          { el: (-> "element"), remove: (->) }

      @stack.adapt = ['custom', 'generic']
      adaptor = @stack.getAdaptorFor({ want: 'custom' })

      expect(adaptor.el()).eq "element"

  describe 'instance', ->
    beforeEach ->
      @stack = new Navstack()

