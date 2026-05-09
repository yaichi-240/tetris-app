class Board {
  constructor() {
    this.grid = this._emptyGrid();
    this._cells = [];
    this._buildDOM();
  }

  _emptyGrid() {
    return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
  }

  _buildDOM() {
    const el = document.getElementById('board');
    el.innerHTML = '';
    this._cells = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      this._cells[r] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        el.appendChild(cell);
        this._cells[r][c] = cell;
      }
    }
  }

  reset() {
    this.grid = this._emptyGrid();
    this._buildDOM();
  }

  isValid(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const br = piece.y + r;
        const bc = piece.x + c;
        if (bc < 0 || bc >= BOARD_COLS || br >= BOARD_ROWS) return false;
        if (br >= 0 && this.grid[br][bc]) return false;
      }
    }
    return true;
  }

  lock(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const br = piece.y + r;
        const bc = piece.x + c;
        if (br < 0) return true; // ゲームオーバー
        this.grid[br][bc] = piece.color;
      }
    }
    return false;
  }

  clearLines() {
    let cleared = 0;
    for (let r = BOARD_ROWS - 1; r >= 0; r--) {
      if (this.grid[r].every(c => c !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(BOARD_COLS).fill(null));
        cleared++;
        r++;
      }
    }
    return cleared;
  }

  ghostY(piece) {
    let gy = piece.y;
    while (true) {
      const g = piece.clone();
      g.y = gy + 1;
      if (!this.isValid(g)) break;
      gy++;
    }
    return gy;
  }

  render(piece) {
    // 固定セル描画
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const color = this.grid[r][c];
        const cell = this._cells[r][c];
        cell.className = 'cell' + (color ? ` filled ${color}` : '');
      }
    }

    if (!piece) return;

    // ゴーストピース
    const gy = this.ghostY(piece);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const br = gy + r;
        const bc = piece.x + c;
        if (br >= 0 && br < BOARD_ROWS && !this.grid[br][bc]) {
          this._cells[br][bc].className = 'cell ghost';
        }
      }
    }

    // アクティブピース
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const br = piece.y + r;
        const bc = piece.x + c;
        if (br >= 0 && br < BOARD_ROWS) {
          this._cells[br][bc].className = `cell filled ${piece.color}`;
        }
      }
    }
  }

  renderNext(piece) {
    const el = document.getElementById('next-piece');
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    el.style.gridTemplateColumns = `repeat(${cols}, 16px)`;
    el.style.gridTemplateRows    = `repeat(${rows}, 16px)`;
    el.innerHTML = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'next-cell' + (piece.shape[r][c] ? ` ${piece.color}` : '');
        el.appendChild(cell);
      }
    }
  }
}
