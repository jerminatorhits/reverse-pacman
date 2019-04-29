console.log('hello from game.js');

document.addEventListener('keydown',keyDownHandler, false);

// initializes fastclick
document.addEventListener('DOMContentLoaded', function() {
  FastClick.attach(document.body);
}, false);

function toggleKeyboard() {
  const controlsContainer = document.getElementById('controls-container');
  const gamepadIcon = document.getElementById('gamepad-icon');
  if (controlsContainer.style.display !== 'none') {
    controlsContainer.style.display = 'none';
    gamepadIcon.style.color = '#262626';
  }
  else {
    controlsContainer.style.display = 'inline';
    gamepadIcon.style.color = 'blue';
  }
}

function toggleSound() {
  const soundIcon = document.getElementById('music-icon');
  if (muted) {
    muted = false;
    soundIcon.style.color = 'blue';
  } else {
    muted = true;
    soundIcon.style.color = '#262626';
  }
  if (muteGain && audio) {
    muteGain.gain.setValueAtTime(muted ? 0 : 1, audio.currentTime);
  }
}

let audio, muted, muteGain;
function createEffect(type, shape) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  osc.type = type;
  gain.connect(muteGain);
  osc.start();
  return () => {
    if (muted) {
      return;
    }
    shape.forEach(part => {
      const time = part.time + audio.currentTime;
      gain.gain.linearRampToValueAtTime(part.gain, time);
      osc.frequency.linearRampToValueAtTime(part.freq, time);
    });
  };
}
const sfx = {};
function createEffects() {
  audio = audio || new AudioContext();
  muteGain = audio.createGain();
  muteGain.connect(audio.destination);
  muteGain.gain.setValueAtTime(muted ? 0 : 1, audio.currentTime);
  sfx.chomp = createEffect('triangle', [
    { freq: 110, gain: 0, time: 0 },
    { freq: 220, gain: 0.25, time: 0.125 },
    { freq: 110, gain: 0, time: 0.25 }
  ]);
  sfx.powerup = createEffect('sine', [
    { freq: 220*2, gain: 0, time: 0 },
    { freq: 440*2, gain: 0.25, time: 0.125/2 },
    { freq: 660*2, gain: 0.33, time: 0.25/2 },
    { freq: 550*2, gain: 0.33, time: 0.375/2 },
    { freq: 880*2, gain: 0.25, time: 0.5/2 },
    { freq: 660*2, gain: 0.33, time: 0.625/2 },
    { freq: 1320*2, gain: 0.33, time: 0.75/2 },
    { freq: 220*2, gain: 0, time: 1/2 }
  ]);
  sfx.powerdown = createEffect('sine', [
    { freq: 220*2, gain: 0, time: 0 },
    { freq: 1320*2, gain: 0.25, time: 0.125/2 },
    { freq: 660*2, gain: 0.33, time: 0.25/2 },
    { freq: 880*2, gain: 0.33, time: 0.375/2 },
    { freq: 550*2, gain: 0.25, time: 0.5/2 },
    { freq: 660*2, gain: 0.33, time: 0.625/2 },
    { freq: 440*2, gain: 0.33, time: 0.75/2 },
    { freq: 220*2, gain: 0, time: 1/2 }
  ]);
  sfx.life = createEffect('sawtooth', [
    { freq: 220, gain: 0, time: 0 },
    { freq: 1320, gain: 0.2, time: 0.125 },
    { freq: 1320 * 3, gain: 0.2, time: 0.175 },
    { freq: 440, gain: 0, time: 0.2 },
  ]);
  sfx.death = createEffect('square', [
    { freq: 110, gain: 0, time: 0 },
    { freq: 165, gain: 0.25, time: 0.125 },
    { freq: 55, gain: 0.125, time: 0.25 },
    { freq: 110, gain: 0, time: 0.5 }
  ]);
  sfx.goal = createEffect('sawtooth', [
    { freq: 220*5, gain: 0, time: 0 },
    { freq: 1320*5, gain: 0.25, time: 0.125 },
    { freq: 660*5, gain: 0.25, time: 0.4 },
    { freq: 220*2, gain: 0, time: 0.5 }
  ]);
}

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
let level = 0;

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

function initialize() {
  createEffects();
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
  if (mouthRadius > 3.9 && pacmans.length > 0) {
    if (sfx.chomp) sfx.chomp();
  }

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
      if (pacman.power === 0) {
        if (sfx.powerdown) sfx.powerdown();
      }
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
  if (counter % 600 === 0 && pacmans.length < 256) {
    if (Math.random() > 0.5) {
      const vx = Math.random() > 0.5 ? -1 : 1;
      pacmans.push({ x: 0, y: 114, vx, vy: 0, power: 600 });
      pacmans.push({ x: 0, y: 114, vx: -vx, vy: 0, power: Math.random() > 0.5 ? 600 : 0 });
    } else {
      pacmans.push({ x: 0, y: 114, vx: Math.random() > 0.5 ? -1 : 1, vy: 0, power: Math.random() > 0.5 ? 600 : 0 });
    }
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
  const hadDots = dots.length > 0;
  dots = dots.filter(dot => !chompBoxes.some(box => collides(box, [...dot, 1, 1 ])));
  if (hadDots && !dots.length && sfx.death) sfx.death();
  chompBoxes.forEach((box, i) => {
    if (pellets.some(pellet => collides(box, [...pellet, 1, 1]))) {
      pacmans[i].power = 600;
      if (sfx.powerup) sfx.powerup();
    }
  });
  pellets = pellets.filter(dot => !chompBoxes.some(box => collides(box, [...dot, 1, 1 ])));
  // eats pacmen on ghost collision
  for (let index = chompBoxes.length - 1; index >= 0; index -= 1) {
    const chompBox = chompBoxes[index];
    const ghostBox = convertSpriteToBox(ghost);
    if (collides(chompBox, ghostBox)) {
      if (pacmans[index].power || ghost.eaten) {
        if (sfx.death && !ghost.eaten) sfx.death();
        ghost.eaten = true;
      } else {
        pacmans.splice(index, 1);
        wallet++;
        if (sfx.life) sfx.life();
      }
    }
  }
  ghost.eaten = ghost.eaten || !dots.length;
}

function exit() {
  if (wallet >= level) {
    const box = convertSpriteToBox(ghost);
    if (collides(box, [124, 108, 8, 8])) {
      wallet -= level;
      level += 1;
      if (sfx.goal) sfx.goal();
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


function runTitle() {
  counter += 1;
}

function drawTitle(context) {
  // Clear the screen
  context.fillStyle = "#000";
  context.fillRect(0, 0, 256, 256);

  const gx = counter < 380 ? (320 - counter) : (counter - 380 - 120);
  const gy = counter < 380 ? 112 : 140;
  const ghost = { x: gx, y: gy + Math.sin(counter / 10) * 2 };
  const px = counter < 380 ? gx + 32 : gx - 32;
  const py = gy;
  const movingPacman = { x: counter < 380 ? px : Math.min(px, 96), y: py, vx: Math.sign(gx - px), vy: 0, power: true };
  const mouthRadius = (counter < 380 || px < 96) ? ((Math.sin(Date.now() / 100) + 1) / 2) * 4 : 4; // chomp chomp
  const ex = (gx > 160) ? 1 : (gx < 100) ? -1 : 0;
  const ey = gy < 128 ? -1 : 0;
  let souls = 3;
  
  if (gy < 128 || gx < 128) {
    context.fillStyle = "#FF0";
    context.beginPath();
    context.arc(128, 140, 6, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#FFF";
    context.beginPath();
    context.arc(128 - 2, 140 - 1, 2, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(128 + 2, 140 - 1, 2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#F0F";
    context.beginPath();
    context.arc(128 - 2 + ex, 140 - 1 + ey, 1, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(128 + 2 + ex, 140 - 1 + ey, 1, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(128, 142, 2, 0, Math.PI);
    context.fill();
    context.beginPath();
    context.arc(128, 134, 1.5, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(124, 132);
    context.lineTo(132, 136);
    context.lineTo(132, 132);
    context.lineTo(124, 136);
    context.fill();
    souls--;
  }
  [-11, 13].filter(cx => gy < 128 || gx < 128 + cx).forEach((cx, i) => {
    const wiggle = Math.floor((counter / (i ? 60 : 44))) % 3 > 1 ? Math.abs(Math.sin(counter / (i ? 25 : 18))) : 0;
    context.fillStyle = "#FF0";
    context.beginPath();
    context.arc(128 + cx, 143 - wiggle, 3, 0, Math.PI * 2);
    context.fill();    
    souls--;
  });
  [-11, 0, 13].forEach(x => {
    if (gy > 128 && ghost.x === (x + 128) && sfx.life) sfx.life();
  });
  
  const menuPacman = { x: 16, y: 240, vx: 0, vy: 0, static: true };
  context.fillStyle = "#FFF";
  context.fillText(`${souls}`, 26, 244);
  if (counter > 900) {
    context.fillText('SOUL TOLL', 102, 64);
  }
  if (counter > 1000) {
    context.fillStyle = "#BBB";
    context.fillText('a video game', 99, 80);
  }
  
  [movingPacman, menuPacman].forEach(pacman => {
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
  if (mouthRadius > 3.9 && movingPacman.x > -6 && movingPacman.x < 255) {
    if (sfx.chomp) sfx.chomp();
  }

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

let lastTime;
function nextLoop() {
  requestAnimationFrame(timestamp => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    const frames = Math.min(Math.floor(120 * delta / 1000), 60);
    if (frames > 0) {
      lastTime = timestamp;
    }
    for (let i = 0; i < frames; i += 1) {
      (level > 0 ? run : runTitle)();
    }
    (level > 0 ? draw : drawTitle)(context);
    nextLoop();
  });
}

initialize();
nextLoop();

const mapMoveFromKeyCode = {
  13: nextGame,
  32: nextGame,
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
}

function nextGame() {
  if (ghost.eaten || level === 0) {
    level = level === 0 ? 1 : 0;
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
