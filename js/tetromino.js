function rotateCW(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = matrix[r][c];
  return result;
}

function randomBag() {
  const keys = Object.keys(TETROMINOES);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

class Tetromino {
  constructor(type) {
    this.type = type;
    this.color = TETROMINOES[type].color;
    this.shape = TETROMINOES[type].shape.map(r => [...r]);
    this.x = Math.floor((BOARD_COLS - this.shape[0].length) / 2);
    this.y = 0;
  }

  rotate() {
    this.shape = rotateCW(this.shape);
  }

  clone() {
    const t = new Tetromino(this.type);
    t.shape = this.shape.map(r => [...r]);
    t.x = this.x;
    t.y = this.y;
    return t;
  }
}

class PieceBag {
  constructor() {
    this._bag = [];
  }

  next() {
    if (this._bag.length === 0) this._bag = randomBag();
    return new Tetromino(this._bag.shift());
  }
}
