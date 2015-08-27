/**** SCRIPT VARIABLES ****/
var gameobj, ball, left_bar, right_bar, portal;
var gameTicker;
var score = 0;

// pong
var speedx = 10;
var speedx_limit = speedx * 3;
var speedx_accel = 1.2;
var speedy = 4;
var max_bounce_angle = 6; // max bounce angle (shift on y speed)


/**** USEFUL FUNCTIONS ****/
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function checkMobile() {
	return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) );
}



/**** SETUP STUFF ****/

// check for jquery
if (typeof $ === 'undefined') {
  throw new Error("Chilong needs jquery!");
}

var script_path;
function getScriptPath() {
  if (script_path !== undefined) return script_path;
  var scripts = document.getElementsByTagName('script');
  var path = scripts[scripts.length-1].src.split('?')[0]; // remove any ?query
  script_path = path.split('/').slice(0, -1).join('/'); // remove last filename part of path
  return script_path;
}
getScriptPath();

var head_html = `
  <link href='http://fonts.googleapis.com/css?family=Press+Start+2P' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="$path/chilong.css">
  <script src="$path/jss.min.js"></script>
`
var body_html = `
<div id="scoreboard" class="chilong">
  <span>Score:</span><span id="score">0</span>
</div>
<div class="chilong">
  <div id="ball"></div>
  <div id="left" class="bar"></div><div id="right" class="bar"></div>
  <img id="portal" class="powerup" src="$path/res/portal2.gif" alt="Portal Powerup">
</div>
`;
$('head').prepend(replaceAll(head_html, '$path', getScriptPath()));


/**** EVENT HANDLER ****/
$('body').ready(function() {
  $('body').prepend(replaceAll(body_html, '$path', getScriptPath()));
  gameStart();
});

function registerEventHandler() {
  $(window).resize(function() {
  	ball.width(ball.height());
  	$('.powerup').width($('.powerup').height());
  });

  // Move the bars on both sides
  $(document).mousemove(function(event) {
  	// calculate the middle position for the boxes relative to the mouse
  	var l = event.pageY - left.height()/2
  	if (l < 0) l = 0;
  	if (l + left.height() > $(window).height()) l = $(window).height()-left.height();
  	left.css('top', l);

  	var r = event.pageY - right.height()/2
  	if (r < 0) r = 0;
  	if (r + right.height() > $(window).height()) r = $(window).height()-right.height();
  	right.css('top', r);
  });
}

/**** GAME HELPER ****/
/* Returns bounds of jq object with attr left, right, top, bottom */
function bounds(obj) {
	var re = obj.offset();
	re.right = re.left + obj.width();
	re.bottom = re.top + obj.height();
	return re;
}

/* Check if two jq objects collide */
function collide(obj1, obj2) {
	var p1 = bounds(obj1);
	var p2 = bounds(obj2);
	// top left corner
	if (p1.left >= p2.left && p1.left <= p2.right && p1.top >= p2.top && p1.top <= p2.bottom) return true;
	// bottom right corner
	if (p1.right >= p2.left && p1.right <= p2.right && p1.bottom >= p2.top && p1.bottom <= p2.bottom) return true;
	return false;
}



/**** OVERALL GAME CODE ****/
function gameStart() {
  if (checkMobile()) {
    endGame();
    return;
  }

  gameobj = $('.chilong');
  ball = $('#ball');
  left = $('#left');
  right = $('#right');
  portal = $('#portal');
  placePowerup(portal);

  registerEventHandler();
  setTimeout('$(window).resize();', 10);
  gameTicker = setInterval('gameTick();', 30);
}

function endGame() {
  jss.set('.chilong', {display: 'None'});
  setTimeout("$('#scoreboard').hide()", 5000);
  clearInterval(gameTicker);
}

function gameTick() {
  pongTick();
}

function addScore(addAmount) {
  score += addAmount;
  $('#score').text(score);
}

/* places an jq obj randomly on the screen (not at the edge) */
function placePowerup(obj) {
	var targetx = $(window).width()*0.8;
	var targety = $(window).height()*0.8;
	var newx = targetx * Math.random() + $(window).width()*0.1;
	var newy = targety * Math.random() + $(window).height()*0.1;
	obj.css('top', newy);
	obj.css('left', newx);
	obj.show();
}


/**** PONG FUNCTIONS ****/
function pongTick() {
  if (!ball.is(':visible')) endGame(); // ball went out of bounds
  var pball = bounds(ball);
  // check collisions
  if (speedx > 0) {
    if (collide(ball, right)) bounce(pball, right);
  } else {
    if (collide(ball, left)) bounce(pball, left);
  }
  if (collide(ball, portal)) activatePortal();
  // update ball
  pball = bounds(ball);
  // check if out
  if (pball.left > $(window).width() || pball.right < 0) endGame();
  if (pball.top+speedy <= 0 || pball.bottom+speedy >= $(window).height()) speedy = -speedy;
  // do the move
  ball.offset({top: pball.top+speedy, left: pball.left+speedx});
}
/* bounces the pong ball based on where it hit the bar */
function bounce(pball, bar) {
  addScore(10);
	var ball_mid = pball.top + ball.height()/2;
	var pbar = bounds(bar);
	var bar_quarter = pbar.top + bar.height()/4;
	var bar_3quarter = pbar.top + bar.height()/4*3;

	// accelerate ball
	if (Math.abs(speedx) < speedx_limit) speedx = speedx*speedx_accel;

	// bounce angle
	var relball = Math.abs(ball_mid - pbar.top); // ball mid can be outside bar
	// black magic
	var percbounce = (1.0/bar.height())*relball;
	var bounce_manipulation = (max_bounce_angle*2)*percbounce-max_bounce_angle;
	console.log(bounce_manipulation);
	speedy += bounce_manipulation;

	// check portal
	if (portalState) {
		if (bar.attr('id') == 'left') {
			ball.css('left', bounds(right).left);
		} else if (bar.attr('id') == 'right') {
			ball.css('left', bounds(left).right - ball.width());
		}
		deactivatePortal();
  } else {
    speedx = -speedx;
  }
}

var portalState = false;
function activatePortal() {
  addScore(100);
	portalState = true;
	gameobj.addClass('portal_active');
	portal.hide();
}
function deactivatePortal() {
	portalState = false;
	gameobj.removeClass('portal_active');
	placePowerup(portal);
}
