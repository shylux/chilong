class PowerUp extends GameObject

  constructor: (game, e) ->
    super game, e

    posx = (0.8 * Math.random() + 0.1) * $(window).width()
    posy = (0.8 * Math.random() + 0.1) * $(window).height()
    e.css {
      'left': posx
      'top': posy
    }

  activate: (ball) ->

  @deactivate: ->

  resize: ->
    @e.width @e.height()
