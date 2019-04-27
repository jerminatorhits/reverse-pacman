console.log('hello from game.js');

const walls = [
  [ 16, 24, 224, 2 ],
  [ 16, 24, 2, 56 ],
  [ 16, 80, 64, 2 ],
  [ 80, 80, 2, 32 ],
  [ 16, 112, 66, 2 ],
  [ 16, 134, 66, 2 ],
  [ 80, 134, 2, 32 ],
  [ 16, 166, 66, 2 ],
  [ 16, 166, 2, 60 ],
  [ 16, 224, 224, 2 ],

];

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

context.fillStyle = "#000";
context.fillRect(0, 0, 256, 256);

function drawBoard(context) {
  context.fillStyle = "#00F";
  walls.forEach(wall => {
    context.fillRect(wall[0], wall[1], wall[2], wall[3]);
  });
}
drawBoard(context);
