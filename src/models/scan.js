import queryString from 'query-string';

import { getAllScanner, runScan, scanTo, supportScan2, localScan } from '../services/scan';
import { updateProp as setValue } from '../utils/values';

function getSettings() {
  const settings = window.localStorage.getItem('scanSettings');
  if (!settings) return null;

  return JSON.parse(settings);
}

function setSettings(scanSettings) {
  const json = JSON.stringify(scanSettings);
  window.localStorage.setItem('scanSettings', json);
}

const defaultSettings = {
  Duplex: true,
  DPI: 200,
  ColorType: 1, // Color = 1, Gray = 2, BlackWhite = 4
  PageSize: 0, // A4: 0, A3: 1, Letter, A5, B5, Auto: 0x100
  Orientation: 0x100, //PORTRAIT, LANDSCAPE, ROT180, ROT270, Auto:0x100
  Correction: {
    Brightness: true,
    Contrast: true,
    DarkEdge: true,
    Skew: false,
    Denoise: true,
    DelBlankPage: true,
    BlankPagePercentage: 99,
  },
  Recognition: {
    Barcode: false,
    Split: true,
    SplitText: 'SPLIT',
    Attach: true,
    AttachText: 'ATTACH',
    SplitBarcode: true,
    NoBarcode: false,
  },
};

export default {
  namespace: 'scanSettings',

  state: {
    scanSettings: defaultSettings,
    scannerList: null,
    selectedId: null,
    supportScan: false,
  },

  subscriptions: {
    setup({ dispatch }) {
      const parsed = queryString.parse(window.location.search);
      if (parsed.route !== 'documentBrowser') {
        dispatch({ type: 'supportScan' });
      }
    },
  },

  effects: {
    *setScanValue({ payload }, { put }) {
      yield put({ type: '_setScanValue', value: payload });
    },
    *clearScanValue({ payload }, { put }) {
      yield put({ type: '_setScanValue', value: defaultSettings });
    },
    *setRecognition({ payload }, { put }) {
      // if (payload && payload.Attach) payload.Split = true;

      yield put({ type: '_setRecognition', value: payload });
    },
    *setCorrection({ payload }, { put }) {
      yield put({ type: '_setCorrection', value: payload });
    },
    *setSelectId({ payload }, { put }) {
      yield put({ type: '_setSelectId', value: payload });
    },
    *queryScanners({ payload }, { call, put, select }) {
      const supportScan = yield select(s => s.scanSettings.supportScan);

      let list = { data: [] };
      if (supportScan) list = yield call(getAllScanner);
      yield put({ type: 'init', value: list.data });
    },
    *supportScan({ payload }, { call, put }) {
      let runQueryScanners = true;
      let result = yield call(supportScan2);
      if (result && result.success !== false) {
        const data = result.data;
        const supported = data.supportScan;
        const localScanPort = data.localScanPort;
        result = supported;
        if (localScanPort > 0) {
          window.localUrl = `http://127.0.0.1:${localScanPort}/ScanLocal`;

          const vvv = yield call(localScan);
          if (vvv && vvv.success !== false) {
            result = true;
            runQueryScanners = false;
            yield put({ type: 'init', value: vvv.data });
          }
        }
      } else result = false;

      yield put({ type: '_supportScan', value: result });
      if (runQueryScanners) yield put({ type: 'queryScanners' });
    },
    *scan({ payload }, { call, put, select }) {
      const settings = yield select(s => s.scanSettings.scanSettings);
      const scannerid = yield select(s => s.scanSettings.selectedId);

      const result = yield call(runScan, scannerid, settings);
      yield put({ type: 'imgData/addScan', value: result });
    },
    *scanTo({ payload }, { call, put, select }) {
      const imgData = yield select(s => s.imgData);
      const settings = yield select(s => s.scanSettings);
      const scannerid = yield select(s => s.scanSettings.selectedId);

      const param = {
        Settings: settings.scanSettings,
        Param: {
          DocId: imgData.selected.DocId,
          DocType: imgData.selected.DocType,
          AttKey: imgData.attachKey,
          FileId: imgData.selectedItem.FileId,
        },
      };

      const result = yield call(scanTo, scannerid, param);
      yield put({ type: 'imgData/_reloadDoc', doc: result.data });
    },
  },

  reducers: {
    _setScanValue(state, payload) {
      setValue(state.scanSettings, payload);
      setSettings(state.scanSettings);

      return state;
    },
    _setCorrection(state, payload) {
      setValue(state.scanSettings.Correction, payload);
      setSettings(state.scanSettings);

      return state;
    },
    _setRecognition(state, payload) {
      setValue(state.scanSettings.Recognition, payload);
      setSettings(state.scanSettings);

      return state;
    },
    _setSelectId(state, payload) {
      const id = payload.value;
      state.selectedId = id;

      return state;
    },
    init(state, payload) {
      const scanners = payload.value;

      state.scannerList = scanners;
      if (scanners && scanners.length > 0) {
        state.selectedId = scanners[0].Id;
      }

      const settings = getSettings();
      if (settings) {
        const v = { value: settings };
        setValue(state.scanSettings, v);
      }

      return state;
    },
    _supportScan(state, payload) {
      const value = payload.value;
      state.supportScan = value;

      return state;
    },
  },
};
