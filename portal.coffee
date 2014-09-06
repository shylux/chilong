class Portal extends PowerUp

  constructor: (game) ->
    e = $('<img id="portal" class="powerup" src="portal2.gif">')
    $('body').prepend(e)
    super game, e

  activate: ->
    $('body').addClass('portalActive')
    @destroy()

  @deactivate: ->
    $('body').removeClass('portalActive')
