console.log('hello from game.js');

const walls = [
  [ 16, 24, 224, 2 ],
  [ 16, 24, 2, 56 ],
  [ 16, 80, 44, 2 ],
  [ 58, 80, 2, 24 ],
  [ 16, 104, 44, 2 ],
  [ 16, 122, 44, 2 ],
  [ 58, 122, 2, 24 ],
  [ 16, 144, 44, 2 ],
  [ 16, 144, 2, 80 ],
  [ 16, 224, 224, 2 ],

  // edge extrusions
  [ 125, 24, 6, 28 ],
  [ 16, 193, 18, 6 ],

  // inner blocks
  [ 32, 38, 28, 10 ],
  [ 74, 38, 36, 10 ],

  // Upper T
  [ 92, 62, 36, 4 ],
  [ 125, 62, 6, 28 ],

  [ 32, 62, 27, 4 ],
  [ 74, 62, 4, 42 ],
  [ 74, 80, 26, 4 ],



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
