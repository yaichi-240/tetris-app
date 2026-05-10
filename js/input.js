class InputHandler {
  constructor(callbacks) {
    this._cb = callbacks;
    this._held = {};
    this._dasTimers = {};
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._active = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp   = this._onKeyUp.bind(this);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup',   this._onKeyUp);
    this._bindTouchButtons();
  }

  enable()  { this._active = true; }
  disable() { this._active = false; this._held = {}; this._clearDAS(); }

  _onKeyDown(e) {
    if (!this._active) return;
    const key = e.key;
    if (this._held[key]) return;
    this._held[key] = true;

    switch (key) {
      case 'ArrowLeft':  e.preventDefault(); this._cb.moveLeft();   this._startDAS('left',  this._cb.moveLeft);  break;
      case 'ArrowRight': e.preventDefault(); this._cb.moveRight();  this._startDAS('right', this._cb.moveRight); break;
      case 'ArrowDown':  e.preventDefault(); this._cb.softDrop();   this._startDAS('down',  this._cb.softDrop);  break;
      case 'ArrowUp':    e.preventDefault(); this._cb.rotate();     break;
      case ' ':          e.preventDefault(); this._cb.hardDrop();   break;
      case 'Shift':
      case 'c':
      case 'C':          e.preventDefault(); this._cb.hold();       break;
      case 'Escape':     this._cb.pause();   break;
    }
  }

  _onKeyUp(e) {
    this._held[e.key] = false;
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down' };
    if (map[e.key]) this._clearDAS(map[e.key]);
  }

  _startDAS(dir, fn) {
    this._clearDAS(dir);
    this._dasTimers[dir] = setTimeout(() => {
      this._dasTimers[dir] = setInterval(fn, DAS_REPEAT);
    }, DAS_DELAY);
  }

  _clearDAS(dir) {
    if (dir) {
      clearTimeout(this._dasTimers[dir]);
      clearInterval(this._dasTimers[dir]);
      delete this._dasTimers[dir];
    } else {
      Object.keys(this._dasTimers).forEach(d => this._clearDAS(d));
    }
  }

  _bindTouchButtons() {
    const map = {
      'btn-left':   () => this._active && this._cb.moveLeft(),
      'btn-right':  () => this._active && this._cb.moveRight(),
      'btn-rotate': () => this._active && this._cb.rotate(),
      'btn-hold':   () => this._active && this._cb.hold(),
      'btn-soft':   () => this._active && this._cb.softDrop(),
      'btn-hard':   () => this._active && this._cb.hardDrop(),
    };

    Object.entries(map).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (!el) return;

      let intervalId = null;
      const isRepeat = id === 'btn-left' || id === 'btn-right' || id === 'btn-soft';

      el.addEventListener('touchstart', e => {
        e.preventDefault();
        fn();
        if (isRepeat) {
          intervalId = setTimeout(() => {
            intervalId = setInterval(fn, DAS_REPEAT);
          }, DAS_DELAY);
        }
      }, { passive: false });

      const stop = () => {
        clearTimeout(intervalId);
        clearInterval(intervalId);
        intervalId = null;
      };
      el.addEventListener('touchend',    stop, { passive: true });
      el.addEventListener('touchcancel', stop, { passive: true });

      el.addEventListener('click', fn);
    });
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup',   this._onKeyUp);
    this._clearDAS();
  }
}
