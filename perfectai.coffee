class PerfectAI extends Player

  constructor: (game, side) ->
    super game, side

    self = @
    @ai_process = setInterval ->
      ball = self.game.first(Ball)
      if ball
        ball_pos = ball.bounds().top
        my_pos = ball_pos - self.e.height() / 2
        self.e.css 'top', my_pos
    , 16
