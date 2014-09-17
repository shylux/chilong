socket = undefined

singleplayer = true

$(->

  socket = io()
  opponent = undefined
  g = new Game singleplayer, 'right'
  g.player.enableControl()
  socket.on 'game start', (msg) ->
    g.end(true)
    g = new Game false, msg
    g.player.enableControl socket

    socket.on 'update', (msg) ->
      g.opponent._top = msg
)
