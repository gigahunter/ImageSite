import consts from '../components/ImageEditor/consts';
import { updateProp } from '../utils/values';
import { isNumber } from 'tui-code-snippet';
import config from '../config';
import { toDocParam } from '../utils/helper';
import { saveImage } from '../services/operate';
import { Resize, GrayScale, BlackWhite, AutoEffect, RemoveDirty } from '../services/image';

const { UNDO_STACK_CHANGED, REDO_STACK_CHANGED } = consts.eventNames;

const min = 1;
const max = 100;
const avg = (max - min + 1) / 2.0;

let Editor = null;

function getResizeOption(resize) {
  const exif = Editor.getExif();
  if (exif) {
    let dpcX = exif.xDensity || 200;
    let dpcY = exif.yDensity || 200;
    if (exif.densityUnits === 1) {
      dpcX /= 2.54;
      dpcY /= 2.54;
    }

    resize.width = exif.width / dpcX;
    resize.height = exif.height / dpcY;
  }
}

function getFilterValue(type) {
  if (!Editor) return avg;

  const opt = Editor.getFilterOptions(type);
  if (!opt) return avg;
  const v = opt[type];
  if (!v) return avg;

  return v * avg + avg;
}

function updateRatio(state) {
  let ratio = Editor.getRatio();
  if (!ratio) ratio = 100;
  else ratio = Math.round(ratio * 100);

  state.imageRatio = ratio;
}

function updateUnRedo(state) {
  state.canUndo = !Editor.isEmptyUndoStack();
  state.canRedo = !Editor.isEmptyRedoStack();

  return state;
}

function updateEditorInfo(state) {
  state.Editor = Editor;

  state.brightness = getFilterValue('brightness');
  state.contrast = getFilterValue('contrast');
  state.rotation = Editor.getAngle();
  updateRatio(state);

  return updateUnRedo(state);
}

function initState(state) {
  const resize = state.resize;
  getResizeOption(resize);
  resize.widthP = 100;
  resize.heightP = 100;
  resize.LockAspectRatio = true;

  state.brightness = 50;
  state.contrast = 50;
  state.canUndo = false;
  state.canRedo = false;
  state.isCrop = false;
  state.isDraw = false;

  updateRatio(state);
}

function getBurshColor(v) {
  return v !== 'white' ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)';
}

export default {
  namespace: 'imgEditor',

  state: {
    resize: {
      width: 10.85,
      height: 16.31,
      widthP: 100,
      heightP: 100,
      LockAspectRatio: true,
    },
    brush: {
      width: 30,
      color: 'white',
    },
    Editor: null,
    isCrop: false,
    isDraw: false,
    drawSettings: {},
    brightness: 50,
    contrast: 50,
    rotation: 0,
    canUndo: false,
    canRedo: false,
    imageRatio: 100,
    min,
    max,
  },

  effects: {
    *set({ payload }, { put }) {
      const name = payload.name;
      const value = payload.value;

      yield put({ type: 'setValue', name, value });

      if (name === 'brightness' || name === 'contrast') {
        const options = {};
        options[name] = (value - avg) / avg;
        Editor.applyFilter(name, options).then(value => {
          put({ type: '_updateInfo' });
          return value;
        });
      } else if (name === 'rotation') {
        Editor.setAngle(value).then(value => {
          put({ type: '_updateInfo' });
          return value;
        });
      }
    },
    *applyFilter({ payload }, { put }) {
      const { name, options } = payload;
      Editor.applyFilter(name, options).then(value => {
        put({ type: '_updateInfo' });
        return value;
      });

      yield put({ type: '_updateInfo' });
    },
    *rotate({ payload }, { put }) {
      Editor.setAngle(payload);
      yield put({ type: '_updateInfo' });
    },
    *flip({ payload }, { put }) {
      Editor.flip(payload);
      yield put({ type: '_updateInfo' });
    },
    *setResize({ payload }, { put }) {
      yield put({ type: '_setResize', value: payload });
    },
    *doResize({ payload }, { put, select, call }) {
      const resize = yield select(s => s.imgEditor.resize);
      var exif = Editor.getExif();
      var data = yield call(
        Resize,
        resize.widthP,
        resize.heightP,
        exif.xDensity,
        Editor.toDataURL()
      );
      if (data.data) {
        Editor.loadImageFromURL(data.data, 'Resize');
        yield put({ type: '_updateInfo' });
      }
    }, //GrayScale, BlackWhite, AutoEffect, RemoveDirty
    *grayScale({ payload }, { call, put }) {
      var exif = Editor.getExif();
      var data = yield call(GrayScale, exif.xDensity, Editor.toDataURL());
      if (data.data) {
        Editor.loadImageFromURL(data.data, 'GrayScale');
        yield put({ type: '_updateInfo' });
      }
    },
    *blackWhite({ payload }, { call, put }) {
      var exif = Editor.getExif();
      var data = yield call(BlackWhite, exif.xDensity, Editor.toDataURL());
      if (data.data) {
        Editor.loadImageFromURL(data.data, 'BlackWhite');
        yield put({ type: '_updateInfo' });
      }
    },
    *autoEffect({ payload }, { call, put }) {
      var exif = Editor.getExif();
      var data = yield call(AutoEffect, exif.xDensity, Editor.toDataURL());
      if (data.data) {
        Editor.loadImageFromURL(data.data, 'AutoEffect');
        yield put({ type: '_updateInfo' });
      }
    },
    *removeDirty({ payload }, { call, put }) {
      var exif = Editor.getExif();
      var data = yield call(RemoveDirty, exif.xDensity, Editor.toDataURL());
      if (data.data) {
        Editor.loadImageFromURL(data.data, 'RemoveDirty');
        yield put({ type: '_updateInfo' });
      }
    },
    *setDraw({ payload }, { put, select }) {
      Editor.stopDrawingMode();
      const { brush } = yield select(s => s.imgEditor);

      const settings = {
        color: getBurshColor(brush.color),
        width: brush.width,
      };

      Editor.startDrawingMode('FREE_DRAWING', settings);
      yield put({ type: '_setDraw', value: payload });
    },
    *setBrushColor({ payload }, { put }) {
      yield put({ type: '_setBrushColor', value: payload });
    },
    *setBrushWidth({ payload }, { put }) {
      yield put({ type: '_setBrushWidth', value: payload });
    },
    *setEditor({ payload }, { put }) {
      const { editor, unRedoCheck } = payload;
      if (editor !== Editor) {
        if (Editor) {
          Editor.off(UNDO_STACK_CHANGED, unRedoCheck);
          Editor.off(REDO_STACK_CHANGED, unRedoCheck);
        }

        Editor = payload.editor;
      }

      yield put({ type: '_updateInfo' });
    },
    *loadImage({ payload }, { put, select }) {
      let url = null;
      let name = null;
      if (payload) {
        url = payload.url;
        name = payload.name;
      }

      if (Editor) {
        const imgData = yield select(s => s.imgData);

        if (!url) {
          const item = imgData.selectedItem;
          if (item) {
            url = item.FileUrl;
            name = item.FileId;
          }
        }

        if (Editor._imageUrl === url) return;
        if (url) url = config.remote + url.substring(1, url.length);
        Editor._imageUrl = url;

        Editor.loadImage(url, name).then(obj => {
          if (Editor) {
            Editor.clearUndoStack();
            if (payload && payload.dispatch) {
              payload.dispatch({ type: 'imgEditor/initState' });
              if (obj && obj.newHeight > obj.newWidth)
                payload.dispatch({ type: 'imgEditor/setRatio', payload: 'h' });
              else payload.dispatch({ type: 'imgEditor/setRatio', payload: 'w' });
            }
          }
        });
      }
    },
    *redo({ payload }, { put }) {
      Editor.redo();
      yield put({ type: '_updateInfo' });
    },
    *undo({ payload }, { put }) {
      Editor.undo();
      yield put({ type: '_updateInfo' });
    },
    *crop({ payload }, { put }) {
      Editor.startDrawingMode('CROPPER');
      yield put({ type: '_setCrop', value: true });
    },
    *cropApply({ payload }, { put, apply }) {
      var rect = Editor.getCropzoneRect();
      Editor.stopDrawingMode();

      yield apply(Editor, Editor.crop, [rect]);
      yield put({ type: '_setCrop', value: false });
      yield put({ type: '_updateInfo' });
    },
    *cropCancel({ payload }, { put }) {
      Editor.stopDrawingMode();
      yield put({ type: '_setCrop', value: false });
    },
    *stopMode({ payload }, { put }) {
      Editor.stopDrawingMode();
      yield put({ type: '_stopMode' });
    },
    *save({ payload }, { put, select, call }) {
      const base64 = Editor.saveImage();
      let dpi = 200;
      const exif = Editor.getExif();
      if (exif) {
        dpi = exif.xDensity;
        if (!dpi) dpi = 200;
      }

      const data = yield select(s => s.imgData);
      const scan = yield select(s => s.scanSettings.scanSettings);
      const dpiNew = scan.DPI;
      const doc = yield call(saveImage, toDocParam(data), base64, dpi, dpiNew);
      const result = doc.data;
      if (result.SelectedFileId) {
        yield put({ type: 'imgData/selectByItemId', payload: { key: result.SelectedFileId } });
      }

      yield put({ type: 'imgData/_reloadDoc', doc: result });
    },
    *updateInfo({ payload }, { put }) {
      if (!payload) return;
      yield put({ type: '_updateInfo' });
    },
    *setRatio({ payload }, { put }) {
      if (!payload) return;
      let value = payload;
      if (isNumber(value)) value = value / 100;
      yield put({ type: '_setRatio', value });
    },
    *initState({ payload }, { put }) {
      Editor.stopDrawingMode();
      yield put({ type: '_initState' });
    },
  },

  reducers: {
    setValue(state, payload) {
      const name = payload.name;
      const value = payload.value;
      if (state[name] === value) return state;

      state[name] = value;
      return state;
    },
    _initState(state, payload) {
      initState(state);
      return state;
    },
    _setResize(state, payload) {
      updateProp(state.resize, payload);
      return state;
    },
    _setCrop(state, payload) {
      state.isDraw = false;
      state.isCrop = payload.value;
      return state;
    },
    _setDraw(state, payload) {
      state.isCrop = false;
      state.isDraw = payload.value;
      return state;
    },
    _stopMode(state, payload) {
      state.isCrop = false;
      state.isDraw = false;
      return state;
    },
    _updateInfo(state, payload) {
      if (!Editor) return state;

      return updateEditorInfo(state);
    },
    _setRatio(state, payload) {
      if (!Editor) return state;
      const { value } = payload;
      Editor.setRatio(value);
      updateRatio(state);
      return state;
    },
    _setBrushColor(state, payload) {
      const { value } = payload;
      Editor.setBrush({ color: getBurshColor(value) });
      state.brush.color = value;
      return state;
    },
    _setBrushWidth(state, payload) {
      const { value } = payload;
      Editor.setBrush({ width: parseInt(value, 10) });
      state.brush.width = value;
      return state;
    },
  },
};
