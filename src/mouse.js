'use strict';

//  => pause  : 40MS pause provid a reasonable trade-off between data quantity
//  and granularity of the recorded events.
//  => rts    : elapsed time (in sec) since the start of the session as recorded
//  by the netork monitoring device
//  => ctt    : elapsed time (in sec) since the start of the session as recorded
//  by the RDP client
//  => button : the current condition of the mouse buttons
//  => state  : additional information about the current state of the mouse
//  => x      : the x coordinate of the cursor on the screen
//  => y      : the y coordinate of the cursor on the screen

export default class Mouse {
  constructor(_name, _id, _rts, _ctt, _button, _state, _x, _y) {
    this._name = _name || 'Edna';
    this._id = _id || Math.random();
    this._rts = _rts || null;
    this._ctt = _ctt || null;
    this._button = _button || 'condition undefined';
    this._state = _state || 'state undefined';
    this._x = _x || null;
    this._y = _y || null;
  }

  get name() {
    return this._name;
  }

  set id(val) {
    if (val) {
      this._id = val;
    }else {
      this._id = 'trapId' + Math.random();
    }
  }

  get id() {
    return this._id;
  }

  set rts(val) {
    if (val) {
      this._rts = val;
    } else {
      this._rts = null;
    }
  }

  get rts() {
    return this._rts;
  }

  set ctt(val) {
    if (val) {
      this._ctt = val;
    }else {
      this._ctt = null;
    }
  }

  get ctt() {
    return this._ctt;
  }

  set button(val) {
    if (val) {
      this._button = val;
    }else {
      this._button = 'unknown condition';
    }
  }

  get button() {
    return this._button;
  }

  set x(val) {
    if (val) {
      this._x = val;
    }else {
      this._x = null;
    }
  }

  get x() {
    return this._x;
  }

  set y(val) {
    if (val) {
      this._y = val;
    }else {
      this._y = null;
    }
  }

  get y() {
    return this._y;
  }

  genId() {
    let d = new Date().getTime();

    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;

      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
