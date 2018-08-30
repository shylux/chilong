/**** SCRIPT VARIABLES ****/
let gameobj, rift, ball, left, right, top_bar, bottom_bar, portal, lastScore;
let gameTicker;
let score = 190;

let currStage = 1;
let stageTwo = 200;

// pong
let speedx, speedx_limit, speedy; // will be set according window width
let speedx_accel = 1.2;
let max_bounce_angle = 6; // max bounce angle (shift on y speed)


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

let script_path;
function getScriptPath() {
  if (script_path !== undefined) return script_path;
  let scripts = document.getElementsByTagName('script');
  let path = scripts[scripts.length-1].src.split('?')[0]; // remove any ?query
  script_path = path.split('/').slice(0, -1).join('/'); // remove last filename part of path
  return script_path;
}
getScriptPath();

let head_html = `
  <link href='http://fonts.googleapis.com/css?family=Press+Start+2P' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="$path/chilong.css">
  <script src="$path/jss.min.js"></script>
`;
let body_html = `
<div id="scoreboard" class="chilong">
  <span>Score:</span><span id="score">0</span>
</div>
<div class="chilong pane">
  <div id="ball"></div>
  <div id="left" class="vbar"></div>
  <div id="right" class="vbar"></div>
  <div id="top" class="hbar"></div>
  <div id="bottom" class="hbar"></div>
  <img id="portal" class="powerup" src="$path/res/portal2.gif" alt="Portal Powerup">
  <div class="rift"><div></div><div></div><div></div><div></div><div></div><div></div></div>
</div>
`;
$('head').prepend(replaceAll(head_html, '$path', getScriptPath()));


/**** EVENT HANDLER ****/
$('body').ready(function() {
  $('body').prepend(replaceAll(body_html, '$path', getScriptPath()));
  gameStart();
});

function onResize() {
  // While the page is stil being rendered the height of the objects is 0. So we retry until the object is actually displayed.
  if (ball.height() === 0) setTimeout("onResize()", 5);

  ball.width(ball.height());
  rift.width(rift.height());
  $('.powerup').width($('.powerup').height());
}
function registerEventHandler() {
  $(window).resize(onResize);

  // Move the bars on both sides
  $(document).mousemove(function(event) {
    if (currStage === 1) {
    	// calculate the middle position for the boxes relative to the mouse
    	var l = event.pageY - left.height()/2;
    	var r = event.pageY - right.height()/2;

      if (currStage === 1) {
        if (l < 0) l = 0;
      	if (l + left.height() > $(window).height()) l = $(window).height()-left.height();
      	if (r < 0) r = 0;
      	if (r + right.height() > $(window).height()) r = $(window).height()-right.height();
      }
      left.css('top', l);
    	right.css('top', r);
    } else if (currStage === 2) {
      var midY = $(window).height()/2;
      var midX = $(window).width()/2;
      var diffMidX = event.pageX - midX;
      var diffMidY = event.pageY - midY;
      var funcSlope = diffMidY / diffMidX;
      var leftY = midY + funcSlope * -midX;
      var rightY = midY + funcSlope * midX;
      var topX = -midY / funcSlope + midX;
      var bottomX = midY / funcSlope + midX;
      left.css('top', leftY - left.height()/2);
      right.css('top', rightY - right.height()/2);
      top_bar.css('left', topX - top_bar.width()/2);
      bottom_bar.css('left', bottomX - bottom_bar.width()/2);
    }
  });
}

/**** GAME HELPER ****/
/* Returns bounds of jq object with attr left, right, top, bottom */
function bounds(obj) {
	let re = obj.offset();
	re.right = re.left + obj.width();
	re.bottom = re.top + obj.height();
	return re;
}

/* Check if two jq objects collide */
function collide(obj1, obj2) {
	let p1 = bounds(obj1);
	let p2 = bounds(obj2);
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
  rift = $('.rift');
  ball = $('#ball');
  left = $('#left');
  right = $('#right');
  top_bar = $('#top');
  bottom_bar = $('#bottom');
  portal = $('#portal');
  placePowerup(portal);

  registerEventHandler();
  $(window).resize();

  speedx = $(window).width() / 100;
  speedx_limit = speedx * 2;
  speedy = $(window).height() / 200;

  gameTicker = setInterval('gameTick();', 30);
}

function endGame() {
  jss.set('.chilong', {display: 'None'});
  setTimeout("$('#scoreboard').hide()", 5000);
  clearInterval(gameTicker);
}

function gameTick() {
  if (currStage === 1)
    pongTick();
  else if (currStage === 2)
    stageTwoTick();
}

function addScore(addAmount) {
  lastScore = score;
  score += addAmount;
  $('#score').text(score);

  if (lastScore < stageTwo && score >= stageTwo) {
    activateStageTwo();
  }
}

let riftState = false;
let riftCounter = 0, riftCountNextHit = true;
function activateStageTwo() {
    $('.chilong').addClass('stage2');
    currStage = 2;
    top_bar.show();
    bottom_bar.show();

  rift.show();
  riftState = true;
  riftCounter = 0;
  $(rift.children()[0]).show()
}
function riftHit() {
  if (!riftCountNextHit) return;
  riftCounter++;
  $(rift.children()[riftCounter]).show();
  riftCountNextHit = false;
  if (riftCounter === 5) loadStageTwo();
}

/* places an jq obj randomly on the screen (not at the edge) */
function placePowerup(obj) {
	let targetx = $(window).width()*0.8;
	let targety = $(window).height()*0.8;
	let newx = targetx * Math.random() + $(window).width()*0.1;
	let newy = targety * Math.random() + $(window).height()*0.1;
	obj.css('top', newy);
	obj.css('left', newx);
	obj.show();
}


/**** PONG FUNCTIONS ****/
function pongTick() {
  if (!ball.is(':visible')) endGame(); // ball went out of bounds
  let pball = bounds(ball);
  // check collisions
  if (speedx > 0) {
    if (collide(ball, right)) bounce(pball, right);
  } else {
    if (collide(ball, left)) bounce(pball, left);
  }
  if (collide(ball, portal)) activatePortal();
  if (riftState && collide(ball, rift)) riftHit();
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
  // make sure ball cant get stuck in bars
  if (bar === left && speedx > 0) return;
  if (bar === right && speedx < 0) return;
  if (bar === top && speedy > 0) return;
  if (bar === bottom && speedy < 0) return;

  addScore(10);
  riftCountNextHit = true;
	let ball_mid = pball.top + ball.height()/2;
	let pbar = bounds(bar);

	// accelerate ball
	if (Math.abs(speedx) < speedx_limit) speedx = speedx*speedx_accel;

	// bounce angle
	let relball = Math.abs(ball_mid - pbar.top); // ball mid can be outside bar
	// black magic
	let percbounce = (1.0/bar.height())*relball;
	let bounce_manipulation = (max_bounce_angle*2)*percbounce-max_bounce_angle;

	speedy += bounce_manipulation;

	// check portal
	if (portalState) {
		if (bar.attr('id') === 'left') {
			ball.css('left', bounds(right).left);
		} else if (bar.attr('id') === 'right') {
			ball.css('left', bounds(left).right - ball.width());
		}
		deactivatePortal();
  } else {
    speedx = -speedx;
  }
}

let portalState = false;
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

/**** STAGE TWO ****/
function loadStageTwo() {
  console.log("Stage TWO");
}

function stageTwoTick() {
  var pball = bounds(ball);
  if (collide(ball, right)) bounce(pball, right);
  if (collide(ball, left)) bounce(pball, left);
  if (collide(ball, top_bar)) bounce(pball, top_bar);
  if (collide(ball, bottom_bar)) bounce(pball, bottom_bar);
  ball.offset({top: pball.top+speedy, left: pball.left+speedx});
}
