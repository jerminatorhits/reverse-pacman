console.log('hello from game.js');

const walls = [
  [ 16, 24, 224, 2 ],
  [ 16, 24, 2, 56 ],
  [ 16, 80, 44, 2 ],
  [ 58, 80, 2, 24 ],
  [ 16, 102, 44, 2 ],
  [ 16, 122, 44, 2 ],
  [ 58, 122, 2, 24 ],
  [ 16, 144, 44, 2 ],
  [ 16, 144, 2, 80 ],
  [ 16, 224, 224, 2 ],

  // edge extrusions
  [ 125, 24, 6, 24 ],
  [ 16, 182, 20, 4 ],

  // inner blocks
  [ 32, 38, 28, 10 ],
  [ 76, 38, 32, 10 ],

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
  { x: 22, y: 114, vx: 1, vy: 0 }
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
  context.fillStyle = "#FF0";
  pacmans.forEach(pacman => {
    context.beginPath();
    context.arc(pacman.x, pacman.y, 6, Math.PI/4, Math.PI * 2 - Math.PI/4);
    context.lineTo(pacman.x, pacman.y);
    context.fill();
  })

  // Draw the ghost (boo!)
  context.fillStyle = "#F00";
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
}

function physics() {
  [ ...pacmans, ghost ].forEach(entity => {
    entity.x += entity.vx;
    entity.y += entity.vy;
  })
}

draw(context);

function run() {
  physics();
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

canvas.addEventListener('click', event => {
  const x = Math.floor((event.offsetX) / 600 * 256);
  const y = Math.floor((event.offsetY) / 600 * 256);
  console.log(x, y);
});
