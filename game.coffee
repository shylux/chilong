# Handles game setup and loops
class Game

  constructor: (@singleplayer, player_side) ->
    @gameObjects = []
    @powerUps = []

    @left = new Player @, 'left'
    @right = new Player @, 'right'

    if player_side == 'left'
      @player = @left
      @opponent = @right
    else if player_side == 'right'
      @player = @right
      @opponent = @left

    if @singleplayer
      @opponent.destroy()
      @opponent = new PerfectAI @, @opponent.side

    new Ball @
    new Portal @

    $(window).resize ->
      gobj.resize() for gobj in @gameObjects

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
