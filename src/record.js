'use strict';

import panda from '../libs/panda';
// import Compress from './compress';
import Ajax from './ajax';

// var compress = new Compress();

export default class Record {
  constructor(_record, _mouseData, _keyData, _timeout, _apiUrl, _clickIsTrusted) {
    this._record = _record || {};
    this._timeout = _timeout || 700;
    this._clickIsTrusted = _clickIsTrusted || true;
    this._apiUrl = _apiUrl || 'https://api.westopbots.com';
  }

  set record(val) {
    if (val) {
      this._record = val;
    }
  }

  get record() {
    return this._record;
  }

  set timeout(val) {
    if (val) {
      this._timeout = val;
    }
  }

  get timeout() {
    return this._timeout;
  }

  get apiUrl() {
    return this._apiUrl;
  }

  set apiUrl(val) {
    if (val) {
      this._apiUrl = val;
    }
  }

  get clickIsTrusted() {
    return this._clickIsTrusted;
  }

  set clickIsTrusted(val) {
    if (val) {
      this._clickIsTrusted = val;
    }
  }

  static b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  }

  getIP(domain) {
    Ajax.get('https://dash.e-dna.co/secure/ip/' + Record.b64EncodeUnicode(domain)).then((result)=> {
      // use JSON.parse(res);
      this.record.ip = JSON.parse(result);
    }).catch((err)=>{
      console.error('error', err);
    });
  }

  takeScreenShot() {
    window.renderer = new panda.Renderer();
    let walker = new panda.Walker();

    walker.onnode = function (node) {
      renderer.renderNode(node).then(function () {
        this.walk();
      }, this);
    };
    walker.onend = function () {
      this.record.screenShot = renderer.canvas.toDataURL();
    };
    walker.walk();
  }

  addPoint(e, type, rts) {
    let timestamp = (new Date()).getTime() - rts;
    let data = {ts: timestamp, x: e.pageX, y: e.pageY, t: type, isTrusted: e.isTrusted};

    this.record.p.push(data);
    if (!e.isTrusted) {
      this.clickIsTrusted = e.isTrusted;
    }
  }

  addKey(e, type, rts) {
    let timestamp = (new Date()).getTime() - rts;
    let data = {
      ts: timestamp,
      keycode: e.keyCode,
      target: e.target.localName,
      srcElement: e.srcElement.nodeName,
      t: type
    };

    this.record.k.push(data);
  }

  getPublicKey() {
  }

  save(record, callback) {
    // let compressMouseData = compress.compressData(record.p, 'mouse');
    // let compresskeyData = compress.compressData(record.k, 'key');
    let state;

    // compress the data
    // record.p = compressMouseData;
    // record.k = compresskeyData;

    record.p = [0, 0];
    record.k = [0, 0];

    record.publicKey = window['edna_publicKey'];
    Ajax.post(this.apiUrl + '/secure/behavior',
      // JSON.stringify(record)
      {
        json: [JSON.stringify(record)]
      }, {}, this._timeout, true
    ).then((res)=> {
      // use JSON.parse(res);
      // console.log(JSON.parse(res));
    }).catch((err)=>{
      console.error(err);
    });
    return state;
  }
}
