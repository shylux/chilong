class ScreenObject

  constructor: (@left, @top, @width, @height) ->

  left: ->
    @left
  top: ->
    @top
  right: ->
    @left + @width
  bottom: ->
    @top + @height
