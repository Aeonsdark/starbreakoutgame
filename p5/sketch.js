// select canvas element
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//game variables and constants
let life = 5;
let score = 0;
const scoreunit = 10;
let level = 1;
const maxlevel = 3;
let gameisover = false;
let paused = false;
let mode = 0;
var bgmisplaying = false

//load images
const bgimg = new Image();
bgimg.src = "img/starnightbg.jpg";

const lifeimg = new Image();
lifeimg.src = "img/whitelife.png";

const scoreimg = new Image();
scoreimg.src = "img/whitescore.png";

//load sounds
const paddlehit = new Audio();
paddlehit.src = "sounds/paddlehit.wav";

const brickhit = new Audio();
brickhit.src = "sounds/brickhit.wav";

const levelupsound = new Audio();
levelupsound.src = "sounds/levelup.wav";

const winsound = new Audio();
winsound.src = "sounds/win.mp3";

const defeatsound = new Audio();
defeatsound.src = "sounds/defeat.wav";

const loselife = new Audio();
loselife.src = "sounds/loselife.mp3";

const bgm = new Audio();
bgm.src = "sounds/bgmshort.mp3";

//paddle variables
var padh = 15;
var padw = 80;
var padmargbot = 50;

//create paddle
const paddle = {
  x: (canvas.width - padw) / 2,
  y: canvas.height - padh - padmargbot,
  width: padw,
  height: padh,
  dx: 5
}

//draw paddle
function drawPaddle() {
  ctx.fillStyle = "#f1f6f9";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

//control paddle
let leftarrow = false;
let rightarrow = false;
document.addEventListener("keydown", function(event) {
  if(event.keyCode === 37){
    leftarrow = true;
  }
  else if (event.keyCode === 39) {
    rightarrow = true;
  }
});
document.addEventListener("keyup", function(event) {
  if (event.keyCode === 37) {
    leftarrow = false;
  }
  else if (event.keyCode === 39) {
    rightarrow = false;
  }
});


// move paddle
function movePaddle() {
  if (rightarrow && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.dx;
  }
  else if (leftarrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

//create ball
var ballrad = 10;
const ball = {
    x: canvas.width/2,
    y: paddle.y - ballrad,
    radius: ballrad,
    speed: 3,
    dx: 3,
    dy: -3
  }

// draw ball
var drawBall = function() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = "#f1f6f9";
  ctx.fill();
  ctx.closePath();
};

//ball move
function moveball() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

//ball bounce and collision 
function ballwallcollision() {
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;   
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }
  if (ball.y + ball.radius > canvas.height) {
    life--;
    resetball();
    loselife.play();
  }
}

//reset ball
function resetball() {
  ball.x = canvas.width/2,
  ball.y = paddle.y - ballrad,
  ball.dx = 3 * (Math.random() * 2 - 1),
  ball.dy = -3
}

// ball paddle collision
function ballpaddlecollision(){
  if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && ball.y < paddle.y + paddle.height && ball.y > paddle.y){
    //play sound
    paddlehit.play();
    // check where ball hit paddle
    let collidePoint = ball.x - (paddle.x + paddle.width/2);
    collidePoint = collidePoint / (paddle.width/2);
    // calculate angle
    let angle = collidePoint * Math.PI/3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = - ball.speed * Math.cos(angle);
  }
}

// create bricks
const brick = {
row: 2,
column: 13,
width: 55,
height: 20,
offSetLeft: 20,
offSetTop: 20,
marginTop: 40,
fillColor: "#394867",
strokeColor: "#14274e"
}

let bricks = [];
function createBricks(){
  for(let r = 0; r < brick.row; r++){
      bricks[r] = [];
      for(let c = 0; c < brick.column; c++){
          bricks[r][c] = {
              x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
              y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
              status : true
          }
      }
  }
}
createBricks();

//draw bricks
function drawBricks() {
  for(let r = 0; r < brick.row; r++) {
    for(let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      //if brick isnt broke
      if(b.status) {
        ctx.fillStyle = brick.fillColor;
        ctx.fillRect(b.x, b.y, brick.width, brick.height);
        ctx.strokeStyle = brick.strokeColor;
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

//brick collision
function ballbrickcollision() {
  for(let r = 0; r < brick.row; r++) {
    for(let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      //if brick isnt broke
      if(b.status) {
        if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {
          brickhit.play();
          ball.dy = - ball.dy;
          b.status = false // brick broke
          score += scoreunit;
        }
      }
    }
  }
}


// show game stats
function showgamestats(text, textX, textY){
  ctx.fillStyle = "#FFF";
  ctx.font = "25px Shadows Into Light";
  ctx.fillText(text, textX, textY);
}

// game over
function gameover() {
  if(life <= 0) {
    defeatsound.play();
    showyoulose();
    gameisover = true;
  }
}

//level up
function levelup() {
  let isleveldone = true;
  // check if all bricks are broken
  for(let r = 0; r < brick.row; r++) {
    for(let c = 0; c < brick.column; c++) {
      isleveldone = isleveldone && !bricks[r][c].status
    }
  }
  if(isleveldone) {
    if(level >= maxlevel) {
      winsound.play();
      showyouwin();
      gameisover = true;
      return;
    }
    levelupsound.play();
    brick.row++;
    createBricks();
    ball.speed += 1;
    resetball();
    level++;
  }
}

//switch game state to play
document.addEventListener("keypress", function(event) {
  if (event.keyCode === 13) {
    mode = 1;
    bgm.play();
  }
});

//switch game state to controls
document.addEventListener("keydown", function(event) {
  if (event.keyCode === 88 && mode == 0) {
    mode = 2;
  }
});

//switch game state to credits
document.addEventListener("keydown", function(event) {
  if (event.keyCode === 67 && mode == 0) {
    mode = 3;
  }
});

//switch game state to title
document.addEventListener("keydown", function(event) {
  if(event.keyCode === 27) {
    mode = 0;
    bgm.pause();
    bgm.currentTime = 0;
  }
})


function text(text, textx, texty) {
  ctx.fillText(text, textx, texty)
} 
// draw function
  function draw() {
    if (mode == 0) {
      ctx.fillStyle = "#FFF";
      ctx.font = "75px Shadows Into Light";
      text("Star Breakout", 300, 225);
      ctx.font = "25px Shadows Into Light";
      text("Press Enter to Start", 400, 325);
      text("Press X for Controls", 410, 425);
      text("Press C for Credits", 410, 525);
      text("Made by Andrew Liu", 10, 30);
    }
    if (mode == 2) {
      ctx.font = "25px Shadows Into Light";
      text("LEFT ARROW to move left", 390, 225);
      text("RIGHT ARROW to move right", 380, 325);
      text("P to pause", 460, 425);
      ctx.font = "20px Shadows Into Light";
      text("Escape to Go Back", 830, 620);
    }
    if (mode == 3) {
      ctx.font = "75px Shadows Into Light";
      text("Special Thanks:", 300, 125);
      ctx.font = "25px Shadows Into Light";
      text("Aaron Liu", 460, 225);
      text("Feuzaed", 470, 325);
      text("Kirin", 490, 425);
      text("Made by Andrew Liu", 420, 525);
      ctx.font = "20px Shadows Into Light";
      text("Escape to Go Back", 830, 620);
    }
    if (mode == 1) {
    drawPaddle();
    drawBall();
    drawBricks();
    // show stats
    showgamestats(life, 50, 35);
    showgamestats(level, canvas.width/2, 35);
    showgamestats(score, canvas.width - 50, 35);
    // stat images
    ctx.drawImage(lifeimg, 20, 17, 20, 20);
    ctx.drawImage(scoreimg, canvas.width - 80, 17, 20, 20);
    }
  }


// update game function
function update () {
  movePaddle();
  moveball();
  ballwallcollision();
  ballpaddlecollision();
  ballbrickcollision();
  gameover();
  levelup();
}

// game loop
function looop () {
  ctx.drawImage(bgimg, 0, 0);
  draw();
  if (!paused && mode == 1) {
  update();
  }
  if(!gameisover) {
    requestAnimationFrame(looop);
  }

}
looop();

//get sound element
const soundElement  = document.getElementById("sound");
soundElement.addEventListener("click", audioManager);
function audioManager(){
    // change sound image
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/soundon.png" ? "img/soundoff.png" : "img/soundon.png";
    soundElement.setAttribute("src", SOUND_IMG);
    
    //mute sounds
    paddlehit.muted = paddlehit.muted ? false : true;
    brickhit.muted = brickhit.muted ? false : true;
    levelupsound.muted = levelupsound.muted ? false : true;
    winsound.muted = winsound.muted ? false : true;
    defeatsound.muted = defeatsound.muted ? false : true;
    bgm.muted = bgm.muted ? false : true;
    loselife.muted = loselife.muted ? false : true;
}

// show game over
//select elements
const game_over = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");
const pause = document.getElementById("pause");

//click on play again
restart.addEventListener("click", function() {
  location.reload();

})

function showyouwin() {
  game_over.style.display = "block";
  youwin.style.display = "block";
}

function showyoulose() {
  game_over.style.display = "block";
  youlose.style.display = "block";
}

//pause the game
function togglePause()
{
    if (!paused)
    {
        paused = true;
    } else if (paused)
    {
       paused= false;
    }

}
window.addEventListener('keydown', function (e) {
  if (e.keyCode === 80)// p key
  {
      togglePause();
      togglePlay();
  }
  });


// pause audio
if (paused) {
  bgm.pause();
}
function togglePlay() {
  bgmisplaying ? bgm.pause() : bgm.play();
};
bgm.onplaying = function() {
  bgmisplaying = true;
};
bgm.onpause = function() {
  bgmisplaying = false;
};