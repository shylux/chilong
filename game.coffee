# Handles game setup and loops
class Game
  @height = 1.0
  @width = 1.5

  constructor: (@singleplayer, player_side) ->
    self = @

    Game.width = $(window).width() / $(window).height()

    @gameObjects = []
    @powerUps = []

    other_side = if player_side == 'left' then 'right' else 'left'
    @player = new Player @, player_side
    if @singleplayer
      @opponent = new PerfectAI @, other_side
    else
      @opponent = new Player @, other_side

    if player_side == 'left'
      @left = @player
      @right = @opponent
    else if player_side == 'right'
      @right = @player
      @left = @opponent

    new Ball @
    new Portal @

    $(window).resize ->
      gobj.resize() for gobj in self.gameObjects
    $(window).resize()

    @loop(@)

  loop: (self) ->
    gobj.tick() for gobj in self.gameObjects
    self.cleanup()
    if self.count(Ball) == 0
      self.end()
    self.timeout = setTimeout self.loop, 30, self

  end: ->
    clearTimeout self.timeout
    gobj.destroy() for gobj in @gameObjects
    @cleanup()

  cleanup: ->
    i = 0
    while @gameObjects.length > i
      gobj = @gameObjects[i]
      if gobj.destroyed
        @gameObjects.splice @gameObjects.indexOf(gobj), 1
      else
        i++

  byType: (type) ->
    (gobj for gobj in @gameObjects when gobj instanceof type)

  count: (type) ->
    counter = 0
    counter++ for gobj in @gameObjects when gobj instanceof type
    return counter

  first: (type) ->
    return gobj for gobj in @gameObjects when gobj instanceof type
