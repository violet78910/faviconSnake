function drawCanvas() {
  const onlyBW = (game.states.showScore.includes(game.attributes.state)) && !noFocus();

  // Clear Canvas
  game.ctx.fillStyle = '#000';
  game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  // Call appropriate draw function based on game state
  if (game.states.inactive.includes(game.attributes.state) || noFocus()) {
    drawStaticStates();
  } else {
    drawActiveStates();
  }
  
  updateFavicon(onlyBW);

} // End of drawCanvas

function drawStaticStates() {

  // If out of focus, show favicon
  if (game.attributes.state === 'outOfFocus') {
    drawFullScreenImg(game.assets.favicon);
    // Pause / End Screens => Show Score
  } else if (game.states.showScore.includes(game.attributes.state)) {
    drawScore(game.attributes.score);
    // Win Screen
  } else if (game.attributes.state === 'win') {
    drawFullScreenImg(game.assets.win);
  }

} // End of drawStaticStates

function drawFullScreenImg(img) {
  game.ctx.drawImage(
    img, 
    0, 0, 
    16, 16
  );
}

function drawScore(score) {
  if (score >= 100) {
    drawNumber(Math.floor(score / 100), 0, 4);
    drawNumber(Math.floor((score % 100) / 10), 5, 5);
    drawNumber(score % 10, 11, 5);
  } else if (score >= 10) {
    drawNumber(Math.floor(score / 10), 1);
    drawNumber(score % 10, 9);
  } else {
    drawNumber(score, 5);
  }
}

function drawActiveStates() {

  game.attributes.static = false;

  // Draw Start Logo
  if (game.attributes.state === 'start') {
    game.ctx.drawImage(
      game.assets.logo, 
      1, 1, 
      14, 5
    );
  }

  // Draw Apple
  drawCell(game.apple.pos[0], game.apple.pos[1], game.apple.fill);

  // Draw Snake
  drawSnake();

} // End of drawActiveStates

function drawSnake() {
  for (let i = 0; i < game.attributes.score + 1; i++) {
    const tailSegment = game.snake.tail[i];
    if (!tailSegment) continue;
    
    drawCell(tailSegment[0], tailSegment[1], game.snake.fill);
  }
}

function drawCell(x, y, fill) {
  game.ctx.fillStyle = fill;
  game.ctx.fillRect(x, y, 1, 1);
}

function drawNumber(num, x, w = 6) {
  let sourceW = 6;
  let sourceX = num * sourceW;
  
  if ((num === 1 || num === 2) && w <= 4) {
    sourceX = num === 1 ? 60 : 64;
    sourceW = 4;
  }
  game.ctx.drawImage(
    game.assets.numbers, // Source Image
    sourceX, 0,  // Source X, Y
    sourceW, 14, // Source Width, Height
    x, 1, // Destination X, Y
    w, 14 // Destination Width, Height
  );
} // End of drawNumber

function newImageNotNeeded() {
  if (!game.attributes.static) return false;
  
  if (game.attributes.updateStatic) {
    game.attributes.updateStatic = false;
    return false;
  } else {
    return true;
  }

}

function updateFavicon(onlyBW) {

  if (newImageNotNeeded()) return;

  if (onlyBW) canvasToBW();

  // Create DataURL
  const dataURL = game.canvas.toDataURL('image/png');

  // Update Favicon link
  game.faviconLink.href = dataURL;

}

function canvasToBW() {

  // Convert canvas to black and white pixels (no gray)
  const imageData = game.ctx.getImageData(0, 0, game.canvas.width, game.canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

    const color = brightness > 96 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = color;
  }

  game.ctx.putImageData(imageData, 0, 0);
}
