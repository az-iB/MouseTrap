'use strict';

class DTC {
  static containsAny(str, substrings) {
    for (let i = 0; i !== substrings.length; i++) {
      let substring = substrings[i];

      if (str.indexOf(substring) !== -1) {
        return substring;
      }
    }
    return null;
  }

  static indexOfString(a, b) {
    let la = a.length;
    let lb = b.length;

    outer:
      for (let i = 0; i <= la - lb; i++) {
        for (let j = 0; j < lb; j++) {
          if (b.charAt(j) !== a.charAt(i + j)) {
            continue outer;
          }
        }
        return i;
      }
    return -1;
  }

  static Obj(keys, async) {
    if (async === undefined) {
      async = true;
    }
    let selenuim = [
      '$cdc_',
      '$wdc_',
      '_Selenium_IDE_Recorder'
    ];

    let phantom = [
      '_phantom',
      'callPhantom'
    ];

    return (new Promise((resolve, reject) => {
      for (let i = 0; i < keys.length; i++) {
        if (DTC.containsAny(keys[i], selenuim)) {
          resolve('selenuim');
        }
      }
      for (let i = 0; i < keys.length; i++) {
        if (DTC.containsAny(keys[i], phantom)) {
          resolve('phantom');
        }
      }
      if (window.document.documentElement.getAttribute('webdriver')) {
        resolve('selenuim');
      }

      if ('_Selenium_IDE_Recorder' in window) {
        resolve(true);
      }

      if ('__webdriver_script_fn' in document) {
        resolve(true);
      }

      if (/PhantomJS/.test(window.navigator.userAgent)) {
        resolve('phantom');
      }

      if (!(navigator.plugins instanceof PluginArray) || navigator.plugins.length === 0) {
        resolve('phantom');
      }
      if (!Function.prototype.bind) {
        resolve('phantom');
      }
      if (Function.prototype.bind.toString().replace(/bind/g, 'Error') !== Error.toString()) {
        resolve('phantom');
      }
      if (Function.prototype.toString.toString().replace(/toString/g, 'Error') !== Error.toString()) {
        resolve('phantom');
      }

      let err;

      try {
        null[0]();
      } catch (e) {
        err = e;
      }
      if (DTC.indexOfString(err.stack, 'phantomjs') > -1) {
        resolve('phantom');
      }

    }));
  }
}

export default class Detect {
  static test(keys, async) {
    return DTC.Obj(keys, async);
  }
}
