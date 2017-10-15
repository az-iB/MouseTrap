'use strict';

const lzjb = require('lzjb');

export default class compress {
  constructor(_data) {
    this._data = [];
  }

  ConvertToCSV(objArray, type) {
    let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;

    let str = 'ts,x,y,t,isTrusted' + '\r\n';

    if (type === 'key') {
      str = 'ts,keycode,target,srcElement,t' + '\r\n';
    }

    for (let i = 0; i < array.length; i++) {
      let line = '';

      for (let index in array[i]) {
        if (line !== '') line += ',';

        line += array[i][index];
      }

      str += line + '\r\n';
    }

    return str;
  }
  compressData(uncompressedData, type) {
    try {
      let csvData = this.ConvertToCSV(uncompressedData, type);

      let data = new Buffer(csvData, 'utf8');

      let compressed = lzjb.compressFile(data);

      return compressed;
    } catch (e) {
      console.error(e);
    } finally {

    }
  }

  uncompressData(compressedData) {
    try {
      let uncompressed = lzjb.decompressFile(compressedData);

      let data2 = new Buffer(uncompressed).toString('utf8');

      return data2;
    } catch (e) {
      console.error(e);
    } finally {

    }
  }
}
