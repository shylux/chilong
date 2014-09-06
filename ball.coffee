class Ball extends GameObject

  @speedx_limit = 30
  @speedx_accel = 1.2

  constructor: (game) ->
    e = $('<div id="ball"></div>')
    $('body').prepend(e)
    super game, e
    @speedx = 10
    @speedy = 4
    @lastTouch = undefined

  resize: ->
    @e.width @e.height()

  tick: ->
    self = @
    bounds = @bounds()

    # check if ball is out
    if bounds.right < 0 or bounds.left > $(window).width()
      @destroy()
      return

    # applying speed avoids flickering of scrollbar
    if bounds.bottom + @speedy > $(window).height() or bounds.top + @speedy < 0
      @speedy *= -1

    @handleCollision (gobj) ->
      if gobj instanceof Player
        gobj.bounce self
      if gobj instanceof PowerUp
        gobj.activate self

    bounds = @bounds()
    @e.offset {
      top: bounds.top + @speedy
      left: bounds.left + @speedx
    }
