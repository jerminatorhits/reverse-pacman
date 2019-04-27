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
  [ 16, 182, 16, 6 ],

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
  [ 96, 182, 28, 6 ],
  [ 125, 182, 6, 22 ],

  // Lower single walls
  [ 76, 122, 4, 24 ],
  [ 76, 162, 32, 4 ],

  [ 32, 162, 28, 4 ],
  [ 54, 162, 6, 26 ],

];

walls.slice().forEach(wall => {
  walls.push([ 256 - wall[0] - wall[2], wall[1], wall[2], wall[3] ]);
});

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

context.fillStyle = "#000";
context.fillRect(0, 0, 256, 256);

function drawBoard(context) {
  context.strokeStyle = "#00F";
  walls.forEach(wall => {
    context.strokeRect(wall[0], wall[1], wall[2], wall[3]);
  });
}
drawBoard(context);

canvas.addEventListener('click', event => {
  const x = Math.floor((event.offsetX) / 600 * 256);
  const y = Math.floor((event.offsetY) / 600 * 256);
  console.log(x, y);
});
