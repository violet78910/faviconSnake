function randNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function noFocus() {
  return !document.hasFocus() || document.hidden;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function updateTitle() {
  const ui = game.ui;

  if (game.attributes.state === 'outOfFocus') return;

  let title = 'Favicon Snake - ';
  let instructions = '';

  switch(game.attributes.state) {
    case 'end':
      title += 'Game Over';
      instructions = 'Press Space to restart';
      break;
    case 'win':
      title += 'You Win!';
      instructions = 'Press Space to restart';
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

function updateHighScore() {

  // Get locally stored High Score
  const stored = localStorage.getItem('highScore');
  let localHS = stored ? parseInt(stored) : 0;
  localHS = isNaN(localHS) ? 0 : localHS;

  // Determine new high score
  const isNew = game.attributes.score > Math.max(game.attributes.highScore, localHS);
  game.attributes.highScore = Math.max(game.attributes.score, game.attributes.highScore, localHS);

  // Save
  localStorage.setItem('highScore', game.attributes.highScore);

  // UI
  if (isNew) {
    game.ui.hsTxt.textContent = 'New High Score: ';
    game.ui.hsTxt.classList.add('newHS');
    game.ui.highScore.classList.add('newHS');
  } else {
    game.ui.hsTxt.textContent = 'High Score: ';
    game.ui.hsTxt.classList.remove('newHS');
    game.ui.highScore.classList.remove('newHS');
  }

  game.ui.highScore.textContent = game.attributes.highScore;
}

// Show Scaled Canvas if h1 is Clicked
const canvasToggle = () => {
  document.querySelector('h1').addEventListener('click', () => {
    if (game.attributes.showOnBody) {
      document.body.removeChild(game.canvas);
      game.attributes.showOnBody = false;
    } else {
      document.body.appendChild(game.canvas);
      game.attributes.showOnBody = true;
    }
  });
};
