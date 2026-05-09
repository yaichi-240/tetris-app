class ScoreManager {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this._hiKey = HIGH_SCORE_KEY_PREFIX + difficulty;
  }

  addLines(count) {
    if (!count) return;
    const base = SCORE_TABLE[count] || 0;
    this.score += base * this.level;
    this.lines += count;
    this.level = Math.floor(this.lines / LEVEL_UP_LINES) + 1;
    this._updateDOM();
  }

  dropInterval() {
    const cfg = DIFFICULTIES[this.difficulty];
    const interval = cfg.dropInterval - (this.level - 1) * cfg.speedIncrease;
    return Math.max(interval, MIN_INTERVAL);
  }

  updateDOM() { this._updateDOM(); }

  _updateDOM() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
    document.getElementById('lines').textContent = this.lines;
    document.getElementById('hiscore').textContent = this.getTopScore();
  }

  getTopScore() {
    const list = this._loadList();
    return list.length ? list[0].score : 0;
  }

  saveScore() {
    const list = this._loadList();
    list.push({ score: this.score, level: this.level, lines: this.lines });
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, HIGH_SCORE_COUNT);
    localStorage.setItem(this._hiKey, JSON.stringify(trimmed));
    const rank = trimmed.findIndex(e => e.score === this.score && e.level === this.level && e.lines === this.lines);
    return rank;
  }

  _loadList() {
    try { return JSON.parse(localStorage.getItem(this._hiKey)) || []; }
    catch { return []; }
  }

  getHighScoreList() { return this._loadList(); }
}
