class Player extends GameObject

  @max_bounce_angle = 6

  constructor: (game, @side) ->
    @bounce_direction = if @side == 'left' then 1 else -1
    e = $('<div class="bar '+@side+'"></div>')
    $('body').prepend(e)
    super game, e

  enableControl: (socket) ->
    self = @
    $(document).mousemove (event) ->
      top = event.pageY - self.e.height() / 2
      top = Math.max(top, 0)
      top = Math.min(top, $(window).height() - self.e.height())
      self.e.css 'top', top
      if socket
        socket.emit 'update', top / $(window).height()

  bounce: (ball) ->
    bbounds = ball.bounds()
    pbounds = @bounds()

    ball_mid = bbounds.top + ball.e.height() / 2
    player_quater = pbounds.top + @e.height() / 4
    player_3quater = pbounds.top + @e.height() / 4 * 3

    # relative position on where the ball hits the player
    # 0 is top of player 1 is bottom
    rel_impact = 1.0 / @e.height() * (ball_mid - pbounds.top)

    bounce_manipulation = 2 * Player.max_bounce_angle * rel_impact - Player.max_bounce_angle

    ball.speedy += bounce_manipulation

    if $('body').hasClass('portalActive')
      if @bounce_direction > 0
        ball.e.css('left', @game.right.bounds().left - ball.e.width())
      else
        ball.e.css('left', @game.left.bounds().right)
      Portal.deactivate()
      new Portal(@game)
      return

    # check if the ball has to be turned
    if ball.speedx * @bounce_direction < 0
      ball.speedx *= -1
      # accelerate
      if Math.abs(ball.speedx) < Ball.speedx_limit
        ball.speedx *= Ball.speedx_accel
