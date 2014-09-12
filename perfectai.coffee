class PerfectAI extends Player

  constructor: (game, side) ->
    super game, side

    self = @
    @ai_process = setInterval ->
      ball = self.game.first(Ball)
      if ball
        ball_pos = ball.top()
        self._top = ball_pos - self.height() / 2
        self.applyPosition()
    , 16
