console.log('hello from game.js');

document.addEventListener("keydown",keyDownHandler, false);

const walls = [
  [ 16, 24, 224, 2 ],
  [ 16, 24, 2, 56 ],
  [ 16, 80, 44, 2 ],
  [ 58, 80, 2, 24 ],
  [ 0, 102, 60, 2 ],
  [ 0, 122, 60, 2 ],
  [ 58, 122, 2, 24 ],
  [ 16, 144, 44, 2 ],
  [ 16, 144, 2, 80 ],
  [ 16, 224, 224, 2 ],

  // edge extrusions
  [ 125, 24, 6, 24 ],
  [ 16, 182, 20, 4 ],

  // inner blocks
  [ 32, 40, 28, 8 ],
  [ 76, 40, 32, 8 ],

  // Upper T
  [ 96, 62, 28, 4 ],
  [ 125, 62, 6, 22 ],

  // Sideways upper left T
  [ 32, 62, 27, 4 ],
  [ 76, 62, 4, 42 ],
  [ 76, 80, 26, 4 ],

  // Middle T
  [ 96, 142, 28, 4 ],
  [ 125, 142, 6, 24 ],

  // Lower T
  [ 96, 182, 28, 4 ],
  [ 125, 182, 6, 24 ],

  // Lower single walls
  [ 76, 122, 4, 24 ],
  [ 76, 162, 32, 4 ],

  // rotated L parts near the bottom
  [ 36, 162, 24, 4 ],
  [ 54, 162, 6, 24 ],

  // upside down kinda like T shapes
  [ 76, 182, 4, 24 ],
  [ 36, 202, 64, 4 ],

  // ghost box (boo!)
  [ 96, 104, 20, 18 ]
];

const pacmans = [
  { x: 22, y: 114, vx: 1, vy: 0 },
  { x: 256 - 22, y: 114, vx: -1, vy: 0 }
];

const ghost = { x: 128, y: 112, vx: 0, vy: 0 };

walls.slice().forEach(wall => {
  walls.push([ 256 - wall[0] - wall[2], wall[1], wall[2], wall[3] ]);
});

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');


function draw(context) {
  // Clear the screen
  context.fillStyle = "#000";
  context.fillRect(0, 0, 256, 256);
  
  // Draw the walls
  context.strokeStyle = "#00F";
  walls.forEach(wall => {
    context.strokeRect(wall[0], wall[1], wall[2], wall[3]);
  });

  // Draw the pacmen
  const mouthRadius = ((Math.sin(Date.now() / 100) + 1) / 2) * 4; // chomp chomp
  pacmans.forEach(pacman => {
    context.fillStyle = "#FF0";    
    context.beginPath();
    context.arc(pacman.x, pacman.y, 6, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.fillStyle = "#000";
    context.beginPath();
    context.arc(pacman.x, pacman.y, mouthRadius, 0, Math.PI);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.fillStyle = "#FFF";
    context.beginPath();
    context.arc(pacman.x + 2, pacman.y - 2, 2, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.fillStyle = "#FFF";
    context.beginPath();
    context.arc(pacman.x - 2, pacman.y - 2, 2, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.fillStyle = "#0F0";
    context.beginPath();
    context.arc(pacman.x - 2 + pacman.vx, pacman.y - 2 + pacman.vy, 1, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.fillStyle = "#0F0";
    context.beginPath();
    context.arc(pacman.x + 2 + pacman.vx, pacman.y - 2 + pacman.vy, 1, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
  })

  // Draw the ghost (boo!)
  context.fillStyle = "#666";
  context.beginPath();
  context.arc(ghost.x, ghost.y, 6, Math.PI, Math.PI * 2);
  context.lineTo(ghost.x + 6, ghost.y + 6);
  context.lineTo(ghost.x + 4, ghost.y + 4);
  context.lineTo(ghost.x + 2, ghost.y + 6);
  context.lineTo(ghost.x , ghost.y + 4);
  context.lineTo(ghost.x - 2, ghost.y + 6);
  context.lineTo(ghost.x - 4, ghost.y + 4);
  context.lineTo(ghost.x - 6, ghost.y + 6);
  context.fill();   
  context.fillStyle = "#BBB";
  context.beginPath();
  context.arc(ghost.x, ghost.y, 4, Math.PI, Math.PI * 2);
  context.lineTo(ghost.x + 3, ghost.y + 2);
  context.lineTo(ghost.x + 2, ghost.y + 4);
  context.lineTo(ghost.x , ghost.y + 2);
  context.lineTo(ghost.x - 2, ghost.y + 4);
  context.lineTo(ghost.x - 3, ghost.y + 2);
  context.fill();
  context.fillStyle = "#000";
  context.beginPath();
  context.arc(ghost.x + 2, ghost.y - 1, 1, 0, Math.PI * 2);
  context.lineTo(ghost.x, ghost.y);
  context.fill();
  context.fillStyle = "#000";
  context.beginPath();
  context.arc(ghost.x - 2, ghost.y - 1, 1, 0, Math.PI * 2);
  context.lineTo(ghost.x, ghost.y);
  context.fill();
}

function physics() {
  [ ...pacmans, ghost ].forEach(entity => {
    entity.x += entity.vx;
    entity.y += entity.vy;
  })
}

function collisions() {
  // Stop at walls
  [ ...pacmans, ghost ].forEach(entity => {
    const box = convertSpriteToBox(entity);
    box[0] += entity.vx * 2;
    box[1] += entity.vy * 2;
    if (walls.some(wall => collides(wall, box))) {
      entity.vx = 0;
      entity.vy = 0;
    }
  })
}

function collides(boxA, boxB) {
  return (boxA[0] < boxB[0] + boxB[2] &&
    boxA[0] + boxA[2] > boxB[0] &&
    boxA[1] < boxB[1] + boxB[3] &&
    boxA[3] + boxA[1] > boxB[1]);
}

  // [ 96, 142, 28, 4 ],
  // [  x,   y,  w, h ],

function think() {
  pacmans.forEach(pacman => {
    // Stopped at a wall
    if (pacman.vx === 0 && pacman.vy === 0) {
      const field = Math.random() > 0.5 ? 'vx' : 'vy';
      const value = Math.random() > 0.5 ? 1 : -1;
      pacman[field] = value;
    }
  });
}

function portals() {
  [ ...pacmans, ghost ].forEach(entity => {
    if (entity.x < 0) {
      entity.x += 256;
    } else if (entity.x > 256) {
      entity.x -= 256;
    }
  });
}

draw(context);

function run() {
  collisions();
  think();
  physics();
  portals();
  draw(context);
}

let lastTime;
function nextLoop() {
  requestAnimationFrame(timestamp => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    const frames = Math.floor(120 * delta / 1000);
    if (frames > 0) {
      lastTime = timestamp;
    }
    for (let i = 0; i < frames; i += 1) {
      run();
    }
    nextLoop();
  });
}

nextLoop();

function keyDownHandler(event) {
  if (event.keyCode == 38) {
    ghost.vy = -1;
    ghost.vx = 0;
    event.preventDefault();
	}
	else if (event.keyCode == 39) {	
		ghost.vy = 0;
    ghost.vx = 1;	
    event.preventDefault();
	}
	else if (event.keyCode == 40) {	
		ghost.vy = 1;
    ghost.vx = 0;	
    event.preventDefault();
	}
	else if (event.keyCode == 37) {	
		ghost.vy = 0;
    ghost.vx = -1;	
    event.preventDefault();
	}
}

canvas.addEventListener('click', event => {
  const x = Math.floor((event.offsetX) / 600 * 256);
  const y = Math.floor((event.offsetY) / 600 * 256);
  console.log(x, y);
});

// pure function
function convertSpriteToBox(sprite) {
  return [ sprite.x - 6, sprite.y - 6, 12, 12 ];
}