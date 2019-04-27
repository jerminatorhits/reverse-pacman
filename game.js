console.log('hello from game.js');

const walls = [
  [ 16, 15, 10, 10 ]
];

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

context.fillColor = "#000";
context.fillRect(0, 0, 256, 256);


function drawBoard(context) {
  context.fillColor = "#0000FF";

  walls.forEach(wall => {
    console.log(wall);
    context.fillRect(wall[0], wall[1], wall[2], wall[3]);
  });
}
drawBoard(context);
