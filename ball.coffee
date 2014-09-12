class Ball extends GameObject

  @speedx_limit = .03
  @speedx_accel = 1.2

  constructor: (game) ->
    e = $('<div id="ball"></div>')
    $('body').prepend(e)
    super game, e
    @_height = .02
    @resize()
    @_left = .4
    @_top = .4
    @speedx = .01
    @speedy = .004
    @lastTouch = undefined

  resize: ->
    @_width = @height()
    super

  tick: ->
    self = @

    # check if ball is out
    if @right() < 0 or @left() > Game.width
      @destroy()
      return

    # applying speed avoids flickering of scrollbar
    if @bottom() + @speedy > 1 or @top() + @speedy < 0
      @speedy *= -1

    @handleCollision (gobj) ->
      if gobj instanceof Player
        gobj.bounce self
      if gobj instanceof PowerUp
        gobj.activate self

    @_top = @top() + @speedy
    @_left = @left() + @speedx
    @applyPosition()
