import fetch from 'dva/fetch';
import { message } from 'antd';

message.config({
  duration: 5,
});

function parseJSON(response) {
  return response.json();
}

function throwError(msg) {
  message.error(msg);
  const error = new Error(msg);
  throw error;
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  let msg = response.statusText;
  return response
    .json()
    .then(err => {
      let errMsg = err.ExceptionMessage;
      if (errMsg && errMsg.length > 0) msg = errMsg;
      else {
        errMsg = err.Message;
        if (errMsg && errMsg.length > 0) msg = errMsg;
      }
      throw err;
    })
    .catch(err => throwError(msg));
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => {
      const ret = {
        err,
        success: false,
        error: err.message,
      };
      return ret;
    });
}

export function postJSON(url, json) {
  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
  };

  return request(url, options);
}

export function download(url, filename) {
  return fetch(url)
    .then(checkStatus)
    .then(res => {
      res.blob().then(blob => {
        filename = filename ? filename : 'download.zip';

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // for IE
          window.navigator.msSaveOrOpenBlob(blob, filename);
          return;
        }

        var a = document.createElement('a');
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
    })
    .catch(err => {
      return { err };
    });
}

export function arrayBuffer(url, callback) {
  return fetch(url)
    .then(checkStatus)
    .then(res => {
      res.arrayBuffer().then(blob => {
        callback(blob);
      });
    })
    .catch(err => callback(null));
}

function checkStatusSoap(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  let msg = response.statusText;
  return response
    .text()
    .then(xml => {
      const err = new window.DOMParser().parseFromString(xml, 'text/xml');
      const message = err.querySelector('message');
      if (message) {
        let errMsg = message.innerHTML;
        if (errMsg && errMsg.length > 0) {
          const idx = errMsg.indexOf('****');
          if (idx >= 0) {
            errMsg = errMsg.substring(idx + 4);
          }

          msg = errMsg.trim();
        }
      }

      throw err;
    })
    .catch(err => throwError(msg));
}

export function soap(url, soapMess, soapAction, xmlResult) {
  const options = {
    method: 'POST',
    headers: {
      SOAPAction: soapAction,
      'Content-Type': 'text/xml; charset=utf-8',
    },
    body: soapMess,
  };

  return fetch(url, options)
    .then(checkStatusSoap)
    .then(response => response.text())
    .then(xml => {
      let ret = new window.DOMParser().parseFromString(xml, 'text/xml');
      if (xmlResult) ret = xmlResult(ret);
      return { data: ret };
    })
    .catch(err => {
      // 1. not connect => not to run checkStatusSoap
      // 2. error => run checkStatusSoap
      const ret = {
        err,
        success: false,
        error: err.message,
      };
      return ret;
    });
}
