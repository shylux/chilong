# Base for all objects appearing on the screen or interacting with it
class GameObject

	constructor: (@game, @e) ->
		@game.gameObjects.push @
		@destroyed = false
		@resize()

	destroy: ->
		@destroyed = true
		@e.remove()

	doesCollide: (gobj) ->
		# we don't collide with ourself
		if @ is gobj
			return

		a = @bounds()
		b = gobj.bounds()
		# detection copied from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
		(a.left <= b.right &&
	 	 a.right >= b.left &&
		 a.top <= b.bottom &&
		 a.bottom >= b.top)

	bounds: ->
		bd = @e.offset()
		bd.right = bd.left + @e.width()
		bd.bottom = bd.top + @e.height()
		return bd

	handleCollision: (handler) ->
		handler(gobj) for gobj in @game.gameObjects when gobj.doesCollide @

	resize: ->

	tick: ->
