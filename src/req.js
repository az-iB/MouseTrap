'use strict';

export default class Ajax {
  get(url, callback) {
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }

    try {
      xhr.open('GET', url, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState > 3 && xhr.status === 200) {
          callback(JSON.parse(xhr.responseText));
        }
      };
      // xhr.setRequestHeader('Access-Control-Allow-Headers', 'Origin', 'X-Requested-With', 'XMLHttpRequest');
      // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.send();

      return xhr;
    } catch (e) {
      console.log('error', e);
    } finally {

    }
  }

  getJSON(url, callback) {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // JSON.parse does not evaluate the attacker's scripts.
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
    return xhr;
  }

  post(url, data, callback) {
    try {
      let params = typeof data === 'string' ? data : Object.keys(data).map((k) => {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
      }).join('&');

      let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      }

      if (xhr !== 'undefined') {
        xhr.open('POST', url);
        xhr.onreadystatechange = () => {
          if (xhr.readyState > 3 && xhr.status === 200) {
            callback(xhr.responseText);
          }
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/jsonrequest');
        xhr.send(params);
      }
      return xhr;
    } catch (e) {
      console.log('error', e);
    } finally {

    }
  }
}
