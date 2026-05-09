const screens = {
  title:    document.getElementById('screen-title'),
  game:     document.getElementById('screen-game'),
  pause:    document.getElementById('screen-pause'),
  gameover: document.getElementById('screen-gameover'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ===== ゲーム状態 =====
let board, scoreManager, bag, currentPiece, nextPiece, input;
let difficulty = 'normal';
let rafId = null;
let lastTime = 0;
let dropAccum = 0;
let paused = false;
let softDropping = false;

// ===== 初期化 =====
function initGame(diff) {
  difficulty = diff;
  board = new Board();
  scoreManager = new ScoreManager(difficulty);
  bag = new PieceBag();
  currentPiece = bag.next();
  nextPiece = bag.next();
  paused = false;
  softDropping = false;
  dropAccum = 0;
  lastTime = 0;

  document.getElementById('mode-label').textContent = DIFFICULTIES[difficulty].label;
  scoreManager.updateDOM();
  board.renderNext(nextPiece);

  if (input) input.destroy();
  input = new InputHandler({
    moveLeft:  () => move(-1, 0),
    moveRight: () => move(1, 0),
    softDrop:  () => { softDropping = true; move(0, 1); },
    hardDrop:  hardDrop,
    rotate:    rotatePiece,
    pause:     togglePause,
  });
  input.enable();

  showScreen('game');
  rafId = requestAnimationFrame(loop);
}

// ===== ゲームループ =====
function loop(timestamp) {
  if (paused) return;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  const cfg = DIFFICULTIES[difficulty];
  const interval = softDropping
    ? scoreManager.dropInterval() / cfg.softDropMultiplier
    : scoreManager.dropInterval();

  dropAccum += delta;
  if (dropAccum >= interval) {
    dropAccum = 0;
    autoDown();
  }

  board.render(currentPiece);
  softDropping = false;
  rafId = requestAnimationFrame(loop);
}

// ===== ピース操作 =====
function move(dx, dy) {
  const moved = currentPiece.clone();
  moved.x += dx;
  moved.y += dy;
  if (board.isValid(moved)) {
    currentPiece.x = moved.x;
    currentPiece.y = moved.y;
    board.render(currentPiece);
  }
}

function rotatePiece() {
  const rotated = currentPiece.clone();
  rotated.rotate();
  // wall kick: 左右にずらして試みる
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    rotated.x = currentPiece.x + kick;
    if (board.isValid(rotated)) {
      currentPiece.shape = rotated.shape;
      currentPiece.x = rotated.x;
      board.render(currentPiece);
      return;
    }
  }
}

function hardDrop() {
  currentPiece.y = board.ghostY(currentPiece);
  lockAndNext();
}

function autoDown() {
  const dropped = currentPiece.clone();
  dropped.y += 1;
  if (board.isValid(dropped)) {
    currentPiece.y++;
  } else {
    lockAndNext();
  }
}

function lockAndNext() {
  const overflow = board.lock(currentPiece);
  if (overflow) { gameOver(); return; }

  const cleared = board.clearLines();
  scoreManager.addLines(cleared);

  currentPiece = nextPiece;
  nextPiece = bag.next();
  board.renderNext(nextPiece);

  if (!board.isValid(currentPiece)) { gameOver(); return; }
  board.render(currentPiece);
}

// ===== ポーズ =====
function togglePause() {
  paused = !paused;
  if (paused) {
    input.disable();
    showScreen('pause');
  } else {
    input.enable();
    showScreen('game');
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }
}

// ===== ゲームオーバー =====
function gameOver() {
  cancelAnimationFrame(rafId);
  input.disable();
  board.render(null);

  const rank = scoreManager.saveScore();
  document.getElementById('final-score').textContent = scoreManager.score;

  const rankMsg = document.getElementById('rank-message');
  rankMsg.textContent = rank >= 0 ? `TOP ${rank + 1} IN (${DIFFICULTIES[difficulty].label})` : '';

  const list = scoreManager.getHighScoreList();
  const goHi = document.getElementById('gameover-highscores');
  goHi.innerHTML = `<div style="margin-bottom:4px;color:#aaa">— ${DIFFICULTIES[difficulty].label} BEST —</div>` +
    list.map((e, i) => `${i + 1}. ${e.score.toLocaleString()} (Lv${e.level})`).join('<br>');

  showScreen('gameover');
}

// ===== UI イベント =====
document.querySelectorAll('[data-difficulty]').forEach(btn => {
  btn.addEventListener('click', () => initGame(btn.dataset.difficulty));
});

document.getElementById('btn-pause').addEventListener('click', togglePause);

document.getElementById('btn-resume').addEventListener('click', () => {
  if (paused) togglePause();
});

document.getElementById('btn-quit-pause').addEventListener('click', () => {
  cancelAnimationFrame(rafId);
  input.disable();
  paused = false;
  showTitleWithScores();
});

document.getElementById('btn-retry').addEventListener('click', () => initGame(difficulty));

document.getElementById('btn-title').addEventListener('click', () => {
  showTitleWithScores();
});

function showTitleWithScores() {
  const container = document.getElementById('title-highscores');
  const diffs = ['easy', 'normal', 'hard'];
  container.innerHTML = diffs.map(d => {
    const key = HIGH_SCORE_KEY_PREFIX + d;
    let list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch {}
    const top = list.length ? list[0].score.toLocaleString() : '-';
    return `${DIFFICULTIES[d].label}: ${top}`;
  }).join('　');
  showScreen('title');
}

// ===== 起動 =====
showTitleWithScores();
