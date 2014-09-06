socket = undefined

singleplayer = true

$(->

  socket = io()
  opponent = undefined
  g = new Game singleplayer, 'right'
  g.player.enableControl()
  socket.on 'game start', (msg) ->
    g.end()
    g = new Game msg
    g.player.enableControl socket

    socket.on 'update', (msg) ->
      g.opponent.e.css 'top', msg * $(window).height()
)
