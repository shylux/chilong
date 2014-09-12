class Player extends GameObject

  @max_bounce_angle = .02

  constructor: (game, @side) ->
    @bounce_direction = if @side == 'left' then 1 else -1
    e = $('<div class="bar '+@side+'"></div>')
    $('body').prepend(e)
    super game, e
    @_width = .03
    @_height = .15
    @_left = if @side == 'left' then 0 else Game.width - @width()

  enableControl: (socket) ->
    self = @
    $(document).mousemove (event) ->
      top = event.pageY - self.e.height() / 2
      top = Math.max(top, 0)
      top = Math.min(top, $(window).height() - self.e.height())
      self._top = top / $(window).height()
      self.applyPosition()
      if socket
        socket.emit 'update', top / $(window).height()

  bounce: (ball) ->
    ball_mid = ball.top() + ball.height() / 2
    player_quater = @top() + ball.height() / 4
    player_3quater = @top() + @height() / 4 * 3

    # relative position on where the ball hits the player
    # 0 is top of player 1 is bottom
    rel_impact = 1.0 / @height() * (ball_mid - @top())

    bounce_manipulation = 2 * Player.max_bounce_angle * rel_impact - Player.max_bounce_angle

    ball.speedy += bounce_manipulation

    if $('body').hasClass('portalActive')
      if @bounce_direction > 0
        ball._left = @game.right.left() - ball.width()
      else
        ball._left = @game.left.right()
      Portal.deactivate()
      new Portal(@game)
      return

    # check if the ball has to be turned
    if ball.speedx * @bounce_direction < 0
      ball.speedx *= -1
      # accelerate
      if Math.abs(ball.speedx) < Ball.speedx_limit
        ball.speedx *= Ball.speedx_accel
