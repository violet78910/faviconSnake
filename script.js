function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function updateTitle() {
  let title = 'Favicon Snake - ';
  let instructions = '';

  switch(game.state) {
    case 'end':
      title += 'Game Over';
      instructions = 'Press Space to restart';
      break;
    case 'win':
      title += 'You Win!';
      instructions = 'Press Space to play again';
      break;
    case 'pause':
      title += 'Paused';
      instructions = 'Press Escape to resume';
      break;
    default:
      title = 'Favicon Snake';
  }

  ui.instructions.textContent = instructions;
  document.title = title;
  ui.title.textContent = title;
}

const init = async () => {
  // Create Canvas Element
  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
  ui = {
    title: document.querySelector('#title'),
    instructions: document.querySelector('#instructions'),
    score: document.querySelector('#score'),
    hsTxt: document.querySelector('#hsTxt'),
    highScore: document.querySelector('#highScore')
  };

  game = {
    fps: 8,
    size: 16,
    _state: 'start',
    previousState: 'start',
    get state() {
      return this._state;
    },
    set state(newState) {
      if (
        this._state !== 'pause' &&
        this._state !== 'outOfFocus' &&
        this._state !== 'end' &&
        this._state !== 'win'
      ) this.previousState = this._state;
  
      this._state = newState;
      updateTitle();
    },
    static: false,
    lastFrameStatic: false,
    showOnBody: false,
    _score: 0,
    highScore: 0,
    get score() {
      return this._score;
    },
    set score(score) {
      this._score = score;
      ui.score.textContent = score;
      updateTitle();
    }
  };

  updateHighScore();

  // Set Canvas Size
  canvas.width = game.size;
  canvas.height = game.size;

  // Load Images
  [favicon, logo, win, numbers] = await Promise.all([
    loadImage('assets/favicon.svg'),
    loadImage('assets/logo.png'),
    loadImage('assets/win.png'),
    loadImage('assets/numbers.png')
  ]);

  faviconLink = document.querySelector('link[rel="shortcut icon"]');

  previousFrame = '';

  snake = {
    fill: '#17ee17',
    direction: 'right',
    directionQueue: [],
    length: 0,
    head: [0, 0],
    tail: []
  };

  apple = {
    fill: '#ee1717',
    pos: [0, 0]
  };

  setupInputs();
  startGame();
  setInterval(gameLoop, 1000 / game.fps);

}; // End of Init

const setupInputs = () => {

  // Keyboard Control Listeners
  document.addEventListener('keydown', (e) => {

    if (game.state === 'playing' || game.state === 'start') {

      // Up
      if (e.key === 'ArrowUp' || e.key === 'w') setSnakeDirection('up');
      // Down
      if (e.key === 'ArrowDown' || e.key === 's') setSnakeDirection('down');
      // Left
      if (e.key === 'ArrowLeft' || e.key === 'a') setSnakeDirection('left');
      // Right
      if (e.key === 'ArrowRight' || e.key === 'd') setSnakeDirection('right');
      // Start Game if haven't
      if (snake.directionQueue.length > 0 && (game.state === 'start')) {
        game.state = 'playing';
      }

    }

    // Pause Menu via Escape Key
    if (e.key === 'Escape' && game.state !== 'end' && game.state !== 'win' && game.state !== 'outOfFocus') {

      if (game.state === 'pause') {
        game.state = game.previousState;
      } else {
        game.state = 'pause';
      }

    }

    // Restart Game via Space Key
    if (e.code === 'Space' && (game.state === 'end' || game.state === 'win')) {
      startGame();
    }

  });

  // Set Snake Direction Function
  function setSnakeDirection(newDirection) {
    const lastDir = snake.directionQueue.at(-1) || snake.direction;
    const opposite = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    if (lastDir !== opposite[newDirection] && lastDir !== newDirection) {
      snake.directionQueue.push(newDirection);
    }
  }

};

function updateHighScore() {
  const stored = localStorage.getItem('highScore');
  let localHS = stored ? parseInt(stored) : 0;
  localHS = isNaN(localHS) ? 0 : localHS;

  // Determine new high score
  const isNew = game.score > Math.max(game.highScore, localHS);
  game.highScore = Math.max(game.score, game.highScore, localHS);

  // Save
  localStorage.setItem('highScore', game.highScore);

  // UI
  if (isNew) {
    ui.hsTxt.textContent = 'New High Score: ';
    ui.hsTxt.classList.add('newHS');
    ui.highScore.classList.add('newHS');
  } else {
    ui.hsTxt.textContent = 'High Score: ';
    ui.hsTxt.classList.remove('newHS');
    ui.highScore.classList.remove('newHS');
  }

  ui.highScore.textContent = game.highScore;
}

function randNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function startGame() {
  game.state = 'start';

  snake.direction = 'right';
  snake.directionQueue = [];
  game.score = 0;
  ui.hsTxt.textContent = 'High Score: ';
  ui.hsTxt.classList.remove('newHS');
  ui.highScore.classList.remove('newHS');
  snake.head = [
    randNum(0, game.size / 2), 
    randNum(game.size / 2, game.size - 2)
  ];
  snake.tail = [[]];

  apple.pos = [
    randNum(2, game.size - 2), 
    randNum(game.size / 2, game.size - 2)
  ];

  if (snake.head[1] === apple.pos[1]) apple.pos[1] -= 1;

}

function moveApple() {
  let freeCells = [];

  // Create Set of Occupied Cells
  const OccupiedCells = new Set(
    snake.tail.map(([x, y]) => `${x},${y}`)
  );

  // Add head to occupied cells
  const headKey = `${snake.head[0]},${snake.head[1]}`;
  OccupiedCells.add(headKey);

  // Build list of free cells
  for (let x = 0; x < game.size; x++) {
    for (let y = 0; y < game.size; y++) {
      const key = `${x},${y}`;
      if (!OccupiedCells.has(key)) {
        freeCells.push([x, y]);
      }
    }
  }

  // Check if Win (no free space left)
  if (freeCells.length === 0) {
    game.state = 'win';
    updateHighScore();
    return;
  }

  // Pick a random free cell
  const newPos = Math.floor(Math.random() * freeCells.length);
  apple.pos = freeCells[newPos];

}

let gameLoop = () => {

  if (
    (!document.hasFocus() || document.hidden) &&
    game.state !== 'pause' &&
    game.state !== 'end' &&
    game.state !== 'win'
  ) {
    game.state = 'outOfFocus';
  } else if (game.state === 'outOfFocus') {
    game.state = game.previousState;
  } else if (game.state === 'start' || game.state === 'playing') {

    // If no queue, add direction
    if (snake.directionQueue.length === 0) {
      snake.directionQueue.push(snake.direction);
    }

    // Move Snake Based on Queue
    switch(snake.directionQueue[0]) {
      case 'up':
        snake.head[1] -= 1;
        break;
      case 'down':
        snake.head[1] += 1;
        break;
      case 'left':
        snake.head[0] -= 1;
        break;
      case 'right':
        snake.head[0] += 1;
        break;
    }

    snake.direction = snake.directionQueue[0];
    snake.directionQueue.shift();

    // Keep Snake in Bounds
    if (snake.head[0] >= game.size) {
      snake.head[0] = 0;
    } else if (snake.head[0] < 0) {
      snake.head[0] = game.size - 1;
    } else if (snake.head[1] >= game.size) {
      snake.head[1] = 0;
    } else if (snake.head[1] < 0) {
      snake.head[1] = game.size - 1;
    }

    // Check if Snake intersects apple
    if (
      snake.head[0] === apple.pos[0] &&
      snake.head[1] === apple.pos[1]
    ) {
      game.score += 1;
      moveApple();
    }

    // Create Tail
    // Add Snake X/Y to start of x/y array
    snake.tail.unshift([snake.head[0], snake.head[1]]);

    // Set Array to only be the length of the Snake
    snake.tail.length = game.score + 1;

    // Check for tail collision
    for (let i = 1; i < snake.tail.length; i++) {
      if (
        snake.head[0] === snake.tail[i][0]&& 
        snake.head[1] === snake.tail[i][1]
      ) {
        game.state = 'end';
        updateHighScore();
      }
    }

  }

  drawCanvas();

};

function drawCell(x, y, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, 1, 1);
}

function drawNumber(num, x, w = 6) {
  let sourceW = 6;
  let sourceX = num * sourceW;
  
  if ((num === 1 || num === 2) && w <= 4) {
    sourceX = num === 1 ? 60 : 64;
    sourceW = 4;
  }
  ctx.drawImage(
    numbers,     // Source Image
    sourceX, 0,  // Source X, Y
    sourceW, 14, // Source Width, Height
    x, 1, // Destination X, Y
    w, 14 // Destination Width, Height
  );
}

function drawCanvas() {

  // Clear Canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (
    game.state === 'outOfFocus' ||
    !document.hasFocus() ||
    document.hidden
  ) {
    ctx.drawImage(
      favicon, 
      0, 0, 
      16, 16
    );
    game.static = true;
    updateFavicon();
    return;
  } else if (game.state === 'end' || game.state === 'pause') {
    if (game.score >= 100) {
      drawNumber(Math.floor(game.score / 100), 0, 4);
      drawNumber(Math.floor((game.score % 100) / 10), 5, 5);
      drawNumber(game.score % 10, 11, 5);
    } else if (game.score >= 10) {
      drawNumber(Math.floor(game.score / 10), 1);
      drawNumber(game.score % 10, 9);
    } else {
      drawNumber(game.score, 5);
    }
    game.static = true;
    updateFavicon(true);
    return;
  } else if (game.state === 'win') {
    ctx.drawImage(
      win, 
      0, 0, 
      16, 16
    );
    game.static = true;
    updateFavicon();
    return;
  } else if (game.state === 'start') {
    ctx.drawImage(
      logo, 
      1, 1, 
      14, 5);
  }
  // Draw Apple
  drawCell(apple.pos[0], apple.pos[1], apple.fill);

  // Draw Snake
  for (let i = 0; i < game.score + 1; i++) {
    drawCell(snake.tail[i][0], snake.tail[i][1], snake.fill);
  }
  game.static = false;
  updateFavicon();
}

function updateFavicon(onlyWB = false) {

  if (game.static === game.lastFrameStatic && game.static) return;
  game.lastFrameStatic = false;
  
  // If onlyWB is true, convert canvas to black and white pixels (no gray)
  if (onlyWB) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

      const color = brightness > 96 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = color;
    }

    ctx.putImageData(imageData, 0, 0);

  }

  // Create DataURL
  const dataURL = canvas.toDataURL('image/png');

  // Compare to Previous Frame DataURL, if same, don't update
  if (dataURL === previousFrame) return;
  previousFrame = dataURL;

  // Update Favicon link
  faviconLink.href = dataURL;

}

// Show Scaled Canvas if h1 is Clicked
document.querySelector('h1').addEventListener('click', () => {
  if (game.showOnBody) {
    document.body.removeChild(canvas);
    game.showOnBody = false;
  } else {
    document.body.appendChild(canvas);
    game.showOnBody = true;
  }
});

window.onload = init;
