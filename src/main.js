
import RecordData from './record';
import Mouse from './mouse';
import Detect from './detect';
const Fingerprint2 = require('fingerprintjs2');

// var fingerprint = new Fingerprint2();

var record = new RecordData();

var mouse = new Mouse();

var optionsFingerprint = {excludeJsFonts: true, excludePlugins: true, excludeIEPlugins: true, excludeWebGL: true, excludeCanvas: true};

const pause = 4;

var stripTrailingSlash = (str) => {
  if (str) {
    if (str.endsWith('/')) {
      return str.slice(0, -1);
    }
    return str;
  }

};

var takeScreenShot = () => {
  setTimeout(function () {
    record.takeScreenShot(mouse.id, mouse.rts);
  }, 250);
};

var MouseMoveTrackFired = (e) => {
  record.addPoint(e, 'move', mouse.rts);
  window.onMouseTrackerRecord = null;
};

var MouseMoveTrack = (e) => {
  if (!window.onMouseTrackerRecord) {
    window.onMouseTrackerRecord = setTimeout(() => {
      MouseMoveTrackFired(e);
    }, pause);
  }
};

var MouseClickTrack = (e) => {
  record.addPoint(e, 'click', mouse.rts);
  takeScreenShot();
};

var MouseRightClickTrack = (e) => {
  record.addPoint(e, 'rightClick', mouse.rts);
};

var MouseDblClickTrack = (e) => {
  record.addPoint(e, 'dblClick', mouse.rts);
};

var MouseDownTrack = (e) => {
  record.addPoint(e, 'down', mouse.rts);
};

var MouseUpTrack = (e) => {
  record.addPoint(e, 'up', mouse.rts);
};

var KeyPressTrack = (e) => {
  record.addKey(e, 'press', mouse.rts);
};

var KeyDownTrack = (e) => {
  record.addKey(e, 'down', mouse.rts);
};

var KeyUpTrack = (e) => {
  record.addKey(e, 'up', mouse.rts);
};

var stop = () => {
  record.save(record.record);
  window.onmousemove = null;
  window.onclick = null;
  window.ondblclick = null;
  window.onmousedown = null;
  window.onmouseup = null;
  window.onkeypress = null;
  window.onkeydown = null;
  window.onkeyup = null;
  mouse.rtse = (new Date()).getTime();
};

var BeforeunLoad = (e) => {
  if (record.record.domain !== window.location.host) {
    stop();
    document.body.onunload = '';
    document.body.onbeforeunload = '';
  }

};

function edna() {
  return {
    start: (options) => {
      new Fingerprint2(optionsFingerprint).get((result, components) => {
        mouse.id = mouse.genId();
        mouse.rts = (new Date()).getTime();
        record.timeout = options.timeout;
        record.apiUrl = stripTrailingSlash(options.apiUrl);
        if (window.location.host) {
          record.domain = window.location.host;
        }
        record.record = {
          id: mouse.id,
          deviceFingerprint: result,
          ts: mouse.rts,
          p: [],
          k: [],
          sw: document.documentElement.clientWidth,
          sh: document.documentElement.clientHeight,
          fingerprint: components,
          cookieEnabled: navigator.cookieEnabled
        };
        // record.takeScreenShot();
        window.onmousemove = MouseMoveTrack;
        window.onclick = MouseClickTrack;
        window.oncontextmenu = MouseRightClickTrack;
        window.ondblclick = MouseDblClickTrack;
        window.onmousedown = MouseDownTrack;
        window.onmouseup = MouseUpTrack;
        window.onkeypress = KeyPressTrack;
        window.onkeydown = KeyDownTrack;
        window.onkeyup = KeyUpTrack;
        window.onbeforeunload = BeforeunLoad;
        Detect.test(Object.keys(window)).then((result)=> {
          record.record.isHeadless = result;
        }).catch((err)=>{
          console.error(err);
        });
        // record.getIP(record.domain);
      });

    },
    stop: () => {
      record.save(record.record, function (res) {
        window.onmousemove = null;
        window.onclick = null;
        window.ondblclick = null;
        window.onmousedown = null;
        window.onmouseup = null;
        window.onkeypress = null;
        window.onkeydown = null;
        window.onkeyup = null;
        mouse.rtse = (new Date()).getTime();
      });
    },
    name: () => {
      return mouse.name;
    },
    record: () => {
      return record.domain;
    }
  };
}

module.exports = edna();
