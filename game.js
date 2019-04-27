console.log('hello from game.js');

const walls = [
  [ 16, 16, 224, 2 ],
  [ 16, 16, 2, 48 ],
  [ 16, 64, 64, 2 ],
  [ 80, 64, 2, 32 ],

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
