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
  [ 32, 40, 48, 8 ],
  [ 96, 40, 14, 8 ],

  // Upper T
  [ 96, 62, 28, 4 ],
  [ 125, 62, 6, 22 ],

  // Sideways upper left T
  [ 32, 62, 27, 4 ],
  [ 76, 40, 4, 64 ],
  [ 76, 80, 26, 4 ],

  // Middle T
  [ 96, 142, 28, 4 ],
  [ 125, 142, 6, 24 ],

  // Lower T
  [ 96, 182, 28, 4 ],
  [ 125, 182, 6, 26 ],

  // Lower single walls
  [ 76, 122, 4, 24 ],
  [ 76, 162, 32, 4 ],

  // rotated L parts near the bottom
  [ 76, 162, 4, 24 ],
  [ 36, 162, 24, 4 ],

  // upside down kinda like T shapes
  [ 54, 182, 6, 24 ],
  [ 36, 202, 72, 6 ],

  // ghost box (boo!)
  [ 96, 104, 20, 18 ]
];

walls.slice().forEach(wall => {
  walls.push([ 256 - wall[0] - wall[2], wall[1], wall[2], wall[3] ]);
});

let dots = [];
const noDotZones = [
  [ 16, 80, 44, 64 ],
  [ 196, 80, 44, 64 ],
  [ 80, 80, 96, 64 ]
];
for (let x = 19; x < 230; x += 2) {
  for (let y = 27; y < 220; y += 2) {
    const box = [ x, y, 12, 12 ];
    if (!noDotZones.some(zone => collides(box, zone))) {
      if (!walls.some(otherBox => collides(box, otherBox))) {
        if (!dots.some(dot => collides(box, [...dot, 1, 1]))) {
          dots.push([ x + 6, y + 6 ]);
        }
      }
    }
  }
}

let pellets = [];
for (let i = 0; i < 4; i += 1) {
  const dot = dots[Math.floor(Math.random() * dots.length)];
  dots = dots.filter(d => d !== dot);
  pellets.push(dot);
}

const pacmans = [
  { x: 22, y: 114, vx: 1, vy: 0 },
  { x: 256 - 22, y: 114, vx: -1, vy: 0 }
];

const ghost = { x: 128, y: 112, vx: 0, vy: 0 };

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

  // Draw the dots and pellets
  context.fillStyle = "#FFF";
  dots.forEach(dot => {
    context.beginPath();
    context.arc(dot[0], dot[1], 1, 0, Math.PI * 2);
    context.fill();
  });
  pellets.forEach(dot => {
    context.beginPath();
    context.arc(dot[0], dot[1], 3, 0, Math.PI * 2);
    context.fill();
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
    if (pacman.power) {
      context.arc(pacman.x + pacman.vx, pacman.y + mouthRadius, mouthRadius, Math.PI, 0);
    } else {
      context.arc(pacman.x + pacman.vx, pacman.y, mouthRadius, 0, Math.PI);
    }
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
    context.fillStyle = pacman.power ? "#F00" : "#0F0";
    context.beginPath();
    context.arc(pacman.x - 2 + pacman.vx, pacman.y - 2 + pacman.vy, 1, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.beginPath();
    context.arc(pacman.x + 2 + pacman.vx, pacman.y - 2 + pacman.vy, 1, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
  })

  // Draw the ghost (boo!)
  if (!ghost.eaten) {
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
    // Countdown powerups
    if (pacman.power > 0) {
      pacman.power -= 1;
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

function consume() {
  const chompBoxes = pacmans.map(convertSpriteToBox);
  dots = dots.filter(dot => !chompBoxes.some(box => collides(box, [...dot, 1, 1 ])));
  chompBoxes.forEach((box, i) => {
    if (pellets.some(pellet => collides(box, [...pellet, 1, 1]))) {
      pacmans[i].power = 600;
    }
  });
  pellets = pellets.filter(dot => !chompBoxes.some(box => collides(box, [...dot, 1, 1 ])));
  // eats pacmen on ghost collision
  chompBoxes.forEach((chompBox, index) => {
    const ghostBox = convertSpriteToBox(ghost);
    if (collides(chompBox, ghostBox)) {
      if (pacmans[index].power || ghost.eaten) {
        ghost.eaten = true;
      } else {
        pacmans.splice(index, 1);
      }
    }
  });
}

draw(context);

function run() {
  think();
  consume();
  collisions();
  physics();
  portals();
  //draw(context);
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
    draw(context);
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