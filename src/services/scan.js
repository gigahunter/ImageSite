import queryString from 'query-string';

import request, { postJSON, soap } from '../utils/request';
import config from '../config';
const urlRoot = config.remote + '/api/scan/';

let supportLocalScan = false;

export function getAllScanner() {
  if (supportLocalScan) {
    return localScan();
  }

  return request(`${urlRoot}GetAllScanner`);
}

export function getScannedResults() {
  return request(`${urlRoot}GetScannedResults`);
}

export function getDownloadResults() {
  return request(`${urlRoot}GetDownloadResults`);
}

export function runScan(id, settings) {
  if (supportLocalScan) {
    return localRunScan(id, settings);
  }

  const url = `${urlRoot}Scan?deviceId=${encodeURI(id)}`;
  const ret = postJSON(url, settings);
  return ret;
}

export function scanTo(id, param) {
  if (supportLocalScan) {
    return localScanTo(id, param);
  }

  const url = `${urlRoot}ScanTo?deviceId=${encodeURI(id)}`;
  const ret = postJSON(url, param);
  return ret;
}

export function supportScan() {
  return request(`${urlRoot}SupportScan`);
}

export function supportScan2() {
  return request(`${urlRoot}SupportScan2`);
}

function elmValue(xmlDoc, elm) {
  if (elm) {
    if (elm.hasAttribute('href')) {
      return elmValue(xmlDoc, xmlDoc.querySelector(elm.attributes['href'].value));
    }

    return elm.innerHTML;
  }

  return null;
}

function xmlValue(xmlDoc, elm, name) {
  const eee = elm.querySelector(name);
  return elmValue(xmlDoc, eee);
}

function encodeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeXML(str) {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

function xmlResult(xml) {
  let ret = null;
  const result = xml.querySelector('return');
  if (result) {
    ret = JSON.parse(decodeXML(result.innerHTML));
  }
  return ret;
}

function localScanTo(id, arg) {
  const parsed = queryString.parse(window.location.search);
  const param = {
    SID: parsed.sid,
    DeviceID: id,
    Param: arg.Param,
    Settings: arg.Settings,
  };

  const soapMess = `<?xml version="1.0" encoding="utf-8"?>
  <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imag="http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageAPI.IScanLocal/ImageAPI">
  <soapenv:Header/>
  <soapenv:Body>
     <imag:ScanTo soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <json xsi:type="xsd:string">${encodeXML(JSON.stringify(param))}</json>
     </imag:ScanTo>
  </soapenv:Body>
</soapenv:Envelope>
  `;

  return soap(
    window.localUrl,
    soapMess,
    'http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer.ScanLocal/ImageServer#ScanTo',
    xml => xmlResult(xml)
  );
}

function localRunScan(id, settings) {
  const parsed = queryString.parse(window.location.search);
  const param = {
    SID: parsed.sid,
    DeviceID: id,
    Settings: settings,
  };

  const soapMess = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imag="http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageAPI.IScanLocal/ImageAPI">
  <soapenv:Header/>
  <soapenv:Body>
     <imag:Scan soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <json xsi:type="xsd:string">${encodeXML(JSON.stringify(param))}</json>
     </imag:Scan>
  </soapenv:Body>
</soapenv:Envelope>
  `;

  return soap(
    window.localUrl,
    soapMess,
    'http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer.ScanLocal/ImageServer#Scan',
    xml => xmlResult(xml)
  );
}

export function localScan() {
  const soapMess = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:imag="http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageAPI.IScanLocal/ImageAPI">
   <soapenv:Header/>
   <soapenv:Body>
      <imag:GetAllScanner soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
   </soapenv:Body>
</soapenv:Envelope>
  `;

  return soap(
    window.localUrl,
    soapMess,
    'http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer.ScanLocal/ImageServer#GetAllScanner',
    xml => {
      let ret = xmlResult(xml);
      if (ret && ret.success !== false) {
        supportLocalScan = true;
      }

      return ret;
    }
  );
}
