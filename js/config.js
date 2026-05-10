const BOARD_COLS = 10;
const BOARD_ROWS = 20;

const DIFFICULTIES = {
  easy:   { dropInterval: 800,  speedIncrease: 50,  softDropMultiplier: 5,  label: 'EASY' },
  normal: { dropInterval: 500,  speedIncrease: 30,  softDropMultiplier: 10, label: 'NORMAL' },
  hard:   { dropInterval: 200,  speedIncrease: 15,  softDropMultiplier: 20, label: 'HARD' },
};

const TETROMINOES = {
  I: { shape: [[1,1,1,1]], color: 'cyan' },
  O: { shape: [[1,1],[1,1]], color: 'yellow' },
  T: { shape: [[0,1,0],[1,1,1]], color: 'purple' },
  S: { shape: [[0,1,1],[1,1,0]], color: 'green' },
  Z: { shape: [[1,1,0],[0,1,1]], color: 'red' },
  J: { shape: [[1,0,0],[1,1,1]], color: 'blue' },
  L: { shape: [[0,0,1],[1,1,1]], color: 'orange' },
};

const SCORE_TABLE = { 1: 100, 2: 300, 3: 500, 4: 800 };
const SOFT_DROP_SCORE = 1;  // per cell
const HARD_DROP_SCORE = 2;  // per cell
const LEVEL_UP_LINES = 10;
const MIN_INTERVAL = 50;
const HIGH_SCORE_KEY_PREFIX = 'tetris_highscores_';
const HIGH_SCORE_COUNT = 5;

const DAS_DELAY = 150;
const DAS_REPEAT = 50;
