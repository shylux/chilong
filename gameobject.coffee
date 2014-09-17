# Base for all objects appearing on the screen or interacting with it
class GameObject

	constructor: (@game, @e) ->
		@id = Math.random()

		@_left = 0
		@_top = 0
		@_width = 0
		@_height = 0

		@game.gameObjects.push @
		@destroyed = false
		@resize()

	destroy: ->
		@destroyed = true
		if @e
			@e.remove()

	left: ->
		@_left
	right: ->
		@_left + @_width
	top: ->
		@_top
	bottom: ->
		@_top + @_height
	width: ->
		@_width
	height: ->
		@_height
	# middle Vertical
	middle: ->
		(@top() + @bottom()) / 2


	doesCollide: (gobj) ->
		# we don't collide with ourself
		if @ is gobj
			return

		# detection copied from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
		(@left() <= gobj.right() &&
	 	 @right() >= gobj.left() &&
		 @top() <= gobj.bottom() &&
		 @bottom() >= gobj.top())

	handleCollision: (handler) ->
		handler(gobj) for gobj in @game.gameObjects when gobj.doesCollide @

	resize: ->
		@applySize()
		@applyPosition()

	tick: ->

	applySize: ->
		if @e
			@e.width(@width()*$(window).height())
			@e.height(@height()*$(window).height())

	applyPosition: ->
		if @e
			@e.offset({
				top: @top()*$(window).height()
				left: @left()/Game.width*$(window).width()
			})
