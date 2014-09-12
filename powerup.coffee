class PowerUp extends GameObject

  constructor: (game, e) ->
    super game, e
    @_height = .1
    @_left = 0.8 * Math.random() + 0.1
    @_top = 0.8 * Math.random() + 0.1
    @applyPosition()

  activate: (ball) ->

  @deactivate: ->

  resize: ->
    @_width = @height()
    super
