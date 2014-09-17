express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)

port = 8000

class ServerGame extends Game
  constructor: (@left, @right) ->
    console.log "New Game!"
    @players = []
    @players.push @left
    @players.push @right

    @left.emit 'game start', 'left'
    @right.emit 'game start', 'right'

    self = @
    @left.on 'update', (msg) ->
      console.log "left", msg
      self.right.emit('update', msg)
    @right.on 'update', (msg) ->
      console.log "right", msg
      self.left.emit('update', msg)

class Lobby
  constructor: ->
    @players = []

  onConnection: (socket) ->
    self = @

    console.log "Connection"
    @players.push socket
    console.log "Players in lobby:", @players.length
    if @players.length == 2
      new ServerGame @players[0], @players[1]

    socket.on 'disconnect', ->
      console.log "Disconnect"
      self.players.splice self.players.indexOf(socket)
      console.log "Players in lobby:", self.players.length

app.use express.static(__dirname + '/static')

lobby = new Lobby

io.on 'connection', (socket) ->
  lobby.onConnection socket

http.listen port
console.log "Running server on port:", port
