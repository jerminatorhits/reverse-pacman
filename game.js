console.log('hello from game.js');

document.addEventListener("keydown",keyDownHandler, false);

const walls = [
  [ 18, 24, 110.5, 2 ],
  [ 16, 24, 2, 56 ],
  [ 16, 80, 40, 2 ],
  [ 56, 80, 2, 26 ],
  [ 0, 104, 56, 2 ],
  [ 0, 120, 56, 2 ],
  [ 56, 120, 2, 24 ],
  [ 18, 144, 40, 2 ],
  [ 16, 144, 2, 80 ],
  [ 16, 224, 112.5, 2 ],

  // edge extrusions
  [ 120, 26, 18, 24 ],
  [ 18, 176, 16, 10 ],

  // inner blocks
  [ 32, 40, 74, 10 ],

  // Upper T
  [ 120, 64, 9, 18 ],
  [ 72, 64, 34, 2 ],

  // Sideways upper left T
  [ 72, 66, 2, 40 ],
  [ 32, 64, 26, 2 ],

  // small inner block
  [ 88, 80, 18, 2 ],

  // Middle T
  [ 88, 144, 40.5, 2 ],
  [ 128, 145, 1, 17 ],

  // Lower T
  [ 96, 176, 32.5, 10 ],
  [ 128, 183, 1, 27 ],

  // Lower single walls
  [ 72, 120, 2, 26 ],
  [ 32, 160, 26, 2 ],

  // rotated L parts near the bottom
  [ 72, 160, 10, 26 ],
  [ 82, 160, 32, 2 ],

  // upside down kinda like T shapes
  [ 48, 176, 10, 26 ],
  [ 32, 200, 82, 10 ],

  // ghost box (boo!)
  [ 88, 96, 18, 34 ],
];

walls.slice().forEach(wall => {
  walls.push([ 258 - wall[0] - wall[2], wall[1], wall[2], wall[3] ]);
});
walls.forEach(wall => (wall[0]--));

let dots, pellets, pacmans, ghost;

let wallet = 0;
let level = 1;

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

function initialize() {
  counter = 0;

  ghost = { x: 128, y: 112, vx: 0, vy: 0 };

  dots = [];
  const noDotZones = [
    [ 16, 80, 42, 64 ],
    [ 204, 80, 42, 64 ],
    [ 76, 80, 104, 64 ]
  ];
  for (let x = 18; x < 230; x += 8) {
    for (let y = 27; y < 220; y += 8) {
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

  pellets = [];
  for (let i = 0; i < 3 + level; i += 1) {
    const dot = dots[Math.floor(Math.random() * dots.length)];
    dots = dots.filter(d => d !== dot);
    pellets.push(dot);
  }

  pacmans = [
    { x: 22, y: 114, vx: 1, vy: 0 },
    { x: 256 - 22, y: 114, vx: -1, vy: 0 }
  ];
}

function draw(context) {
  // Clear the screen
  context.fillStyle = "#000";
  context.fillRect(0, 0, 256, 256);
  
  // Draw the walls
  context.fillStyle = "#00F";
  context.strokeStyle = "#00F";
  walls.forEach(wall => {
    context.strokeRect(wall[0], wall[1], wall[2], wall[3]);
    context.fillRect(wall[0], wall[1], wall[2], wall[3]);
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

  // Draw the bottom menu
  const menuPacman = { x: 16, y: 240, vx: 0, vy: 0, static: true };
  context.fillText(`${wallet} / ${level}`, 26, 244);

  // Draw the pacmen
  const mouthRadius = ((Math.sin(Date.now() / 100) + 1) / 2) * 4; // chomp chomp
  [ ...pacmans, menuPacman ].forEach(pacman => {
    context.fillStyle = pacman.power ? "#F80" : "#FF0";
    context.beginPath();
    context.arc(pacman.x, pacman.y, 6, 0, Math.PI * 2);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
    context.fillStyle = "#000";
    context.beginPath();
    if (pacman.static) {
      context.arc(pacman.x, pacman.y, 4, 0, Math.PI);
    }
    else {
      if (pacman.power) {
        context.arc(pacman.x + pacman.vx, pacman.y + mouthRadius, mouthRadius, Math.PI, 0);
      } else {
        context.arc(pacman.x + pacman.vx, pacman.y, mouthRadius, 0, Math.PI);
      }
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
  });

  // Draw the exit
  if (wallet >= level) {
    const r = Math.floor((Math.sin(Date.now() / 50) / 2 + 0.5) * 16).toString(16);
    const g = Math.floor((Math.sin(Date.now() / 25) / 2 + 0.5) * 16).toString(16);
    const b = Math.floor((Math.sin(Date.now() / 75) / 2 + 0.5) * 16).toString(16);
    context.fillStyle = `#${r}${g}${b}`;
    context.beginPath();
    context.moveTo(128, 106);
    context.lineTo(132, 118);
    context.lineTo(122, 110);
    context.lineTo(134, 110);
    context.lineTo(124, 118);
    context.fill();
  }

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
  } else {
    context.fillStyle = "#FFF";
    context.fillText("GAME OVER", 98, 16);
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
  if (ghost.intent) {
    const box = convertSpriteToBox(ghost);
    box[0] += ghost.intent.vx * 3;
    box[1] += ghost.intent.vy * 3;
    if (!walls.some(wall => collides(wall, box))) {
      ghost.vx = ghost.intent.vx;
      ghost.vy = ghost.intent.vy;
      delete ghost.intent;
    }
  }
}

function spawn() {
  if (counter % 600 === 0) {
    pacmans.push({ x: 0, y: 114, vx: -1, vy: 0, power: 600 });
    pacmans.push({ x: 0, y: 114, vx: 1, vy: 0, power: 600 });
  }
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
        wallet++;
      }
    }
  });
  ghost.eaten = ghost.eaten || !dots.length;
}

function exit() {
  if (wallet >= level) {
    const box = convertSpriteToBox(ghost);
    if (collides(box, [124, 108, 8, 8])) {
      wallet -= level;
      level += 1;
      initialize();
    }
  }
}

let counter = 0;
function run() {
  counter += 1;
  spawn();
  think();
  consume();
  collisions();
  physics();
  portals();
  exit();
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

initialize();
nextLoop();

const mapMoveFromKeyCode = {
  37: moveLeft,
  38: moveUp,
  39: moveRight,
  40: moveDown,
}

function keyDownHandler(event) {
  if (mapMoveFromKeyCode[event.keyCode]) {
    mapMoveFromKeyCode[event.keyCode]();
    event.preventDefault();
  }
  else if (ghost.eaten && [13, 32].includes(event.keyCode)) {
    event.preventDefault();
    level = 1;
    wallet = 0;
    initialize();
  }
}

function moveUp() {
  ghost.intent = { vx: 0, vy: -1 };
}

function moveLeft() {
  ghost.intent = { vx: -1, vy: 0 };
}

function moveDown() {
  ghost.intent = { vx: 0, vy: 1 };
}

function moveRight() {
  ghost.intent = { vx: 1, vy: 0 };
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
