'use strict';

class XHR {
  static Obj() {
    if (typeof XMLHttpRequest !== 'undefined') {
      return new XMLHttpRequest();
    }

    let versions = [
      'MSXML2.XmlHttp.6.0',
      'MSXML2.XmlHttp.5.0',
      'MSXML2.XmlHttp.4.0',
      'MSXML2.XmlHttp.3.0',
      'MSXML2.XmlHttp.2.0',
      'Microsoft.XmlHttp'
    ];

    let xhr;

    for (let i = 0; i < versions.length; i++) {
      try {
        xhr = new ActiveXObject(versions[i]);
        break;
      } catch (e) {
      }
    }

    return xhr;
  }

  static send(url, method, data, headers, timeout, async) {
    if (async === undefined) {
      async = true;
    }

    return (new Promise((resolve, reject) => {
      let xhr = XHR.Obj();

      xhr.timeout = timeout; // 3s timeout

      xhr.open(method, url, async);

      if (headers) {
        for (let key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }
      }

      if (method === 'POST') {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      }

      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };

      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };

      xhr.ontimeout = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      console.log(xhr.lenght);
      xhr.send(data);
    }));
  }
}

export default class Ajax {
  static get(url, data, headers, async) {
    let query = [];

    for (let key in data) {
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return XHR.send(url + (query.length ? '?' + query.join('&') : ''), 'GET', null, headers, async);
  }

  static post(url, data, headers, timeout, async) {
    let params = typeof data === 'string' ? data : Object.keys(data).map((k) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');

    return XHR.send(url, 'POST', params, headers, timeout, async);
  }
}
