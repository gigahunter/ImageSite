import { message } from 'antd';
import { getScannedResults, getDownloadResults } from '../services/scan';
import {
  remove as removeDoc,
  rotate as sRotate,
  split,
  change,
  reorder as sReorder,
  reorders as sReorders,
  deleteFid,
  deleteByFids,
  removeBlank,
} from '../services/operate';
import {
  exportZIP,
  importToFinish,
  downFromServer,
  uploadTickedItmesToServer,
  uploadTickedItmesCheck,
  uploadToServer,
  uploadCheck,
  viewFromServer,
  viewPdf,
} from '../services/export';

import { toDocParam, generateDeleteByFidsOutputObj } from '../utils/helper';

/**
 * 檢查 onItems 的 result 有無 searchItem
 * @param onItems format: [{result: T, ...}, ...]
 * @param searchItem format: T
 */
function isPresence(onItems, searchItem) {
  let isPresence = false;
  onItems.forEach(item => {
    if (item.result === searchItem) {
      isPresence = true;
      return;
    }
  });
  return isPresence;
}

/**
 * 清除勾選的項目
 * @param items format: [{isTicked: Bool, ...}, ...]
 */
function clearTicked(items) {
  items.forEach(item => {
    item.isTicked = false;
  });
}

/**
 * @param bool format: Boolean
 * @param items format: [{DocId: String, isTicked: Bool, ...}, ...]
 * @param docId format: String
 */
function setIsTicked(bool, inItems, docId) {
  inItems.forEach(doc => {
    if (doc.DocId === docId) {
      doc.isTicked = bool;
    }
  });
}

/**
 * 取得勾選的項目
 * @param inItmes format: [{DocType: String, DocId: String, ...}, ...]
 * @param toContainer format: []
 * @returns format: [{docType: String, docId: String}, ...]
 */
function getTickedItems(inItmes, toContainer) {
  inItmes.forEach(doc => {
    if (doc.isTicked) {
      const docItem = { docType: doc.DocType, docId: doc.DocId };
      toContainer.push(docItem);
    }
  });
  return toContainer;
}

/**
 * 生成需要 Checked 的項目
 * @param inItems format: [{docType: String, docId: String}, ...]
 * @returns format: [{docId: String}, ...]
 */
function generateCheckedTickedItems(inItems) {
  let checkedItems = inItems
    .map(docItem => {
      return { docId: docItem.docId };
    })
    .filter(item => item.docId != undefined);
  return checkedItems;
}

function setSelected(state, result) {
  if (state.selected === result) return;

  state.selected = result;
  const ary = result.Items;
  state.selectedItems = ary;
  if (ary && ary.length > 0) {
    state.selectedItem = ary[0];
    state.multipleSelectedItem = null;
    state.attachKey = null;
  }
}

function setSelectedByItemId(state, items, id) {
  if (!items) return false;
  const cnt = items.length;
  if (cnt === 0) return false;

  // if (state.selectedItem && state.selectedItem.Id === id) return true;
  const old = state.selectedItems;
  if (state.selectedItems !== items) state.selectedItems = items;

  for (let i = 0; i < cnt; i++) {
    const item = items[i];
    if (item.FileId === id) {
      state.selectedItem = item;
      return true;
    }
  }

  state.selectedItems = old;
  return false;
}

function checkItems(items, id, image) {
  if (!items) return false;
  const cnt = items.length;
  if (cnt === 0) return false;

  for (let i = 0; i < cnt; i++) {
    const item = items[i];
    if (item.FileId === id) {
      if (item.checked) item.checked = false;
      else item.checked = true;

      if (image) image.resetCheck(item.checked);
      return true;
    }
  }

  return false;
}

function findResult(items, key) {
  return items.find(function(item) {
    return item.DocId === key;
  });
}

/*
function findResultIndex(items, key) {
  if (!items) return -1;
  for (let i = 0, iC = items.length; i < iC; i++) {
    if (items[i].DocId === key) return i;
  }

  return -1;
}
*/

function findResultA(items, key, state) {
  const ind = key.lastIndexOf('_');
  if (ind < 0) return false;
  const attachKey = key.substring(ind + 1);
  key = key.substring(0, ind);

  const r = items.find(function(item) {
    return item.DocId === key;
  });

  if (!r) return false;

  let ary = r.Attachs.find(function(item) {
    return item.Key === attachKey;
  });
  if (!ary) return false;
  ary = ary.Items;

  state.selected = r;
  state.selectedItems = ary;
  state.attachKey = attachKey;
  if (ary && ary.length > 0) {
    state.selectedItem = ary[0];
  }
  return true;
}

/**
 * return add
 * @param {*} values array of DocResult to add
 * @param {*} list list of DocResult
 * @returns added Items
 */
function addToItems(values, list) {
  const items = [];
  for (let i = 0, iC = list.length; i < iC; i++) {
    const result = list[i];
    const ary = result.Items;
    if (!ary || ary.length === 0) {
      continue;
    }

    items.push(result);

    var bFind = false;
    for (let j = 0, jC = values.length; j < jC; j++) {
      const v = values[j];
      if (v.DocId === result.DocId) {
        values[j] = result;
        bFind = true;
        break;
      }
    }

    if (bFind === false) values.push(result);
  }
  return items;
}

function reloadDoc(state, doc) {
  if (!doc) return state;

  let items = state.scanItems;
  if (doc.DocType !== 'SCAN') items = state.downItems;

  for (let i = 0, iC = items.length; i < iC; i++) {
    const item = items[i];
    if (item.DocId === doc.DocId) {
      items[i] = doc;
      break;
    }
  }

  if (state.selected && state.selected.DocId === doc.DocId) {
    state.selected = doc;
    if (!state.attachKey || state.attachKey === '') {
      setSelectedByItemId(state, doc.Items, state.selectedItem.FileId);
    } else {
      let found = false;
      const attachs = doc.Attachs;

      if (attachs && attachs.length > 0) {
        for (let i = 0, iC = attachs.length; i < iC; i++) {
          const att = attachs[i];
          if (att.Key === state.attachKey) {
            setSelectedByItemId(state, att.Items, state.selectedItem.FileId);
            found = true;
          }
        }
      }
      if (found === false) {
        state.attachKey = '';
        setSelected(state, doc);
      }
    }
  }
}

function* updateQueryList(data, put, call) {
  const selected = data.selected;
  if (!selected) return;

  const docType = selected.DocType;
  let list;

  if (docType === 'SCAN') {
    list = yield call(getScannedResults);
    list = list.data;
    yield put({ type: '_queryScanned', value: list });
    if (list && list.length > 0) {
      return;
    }

    list = yield call(getDownloadResults);
    list = list.data;
    yield put({ type: '_queryDownload', value: list });
  } else {
    list = yield call(getDownloadResults);
    list = list.data;
    yield put({ type: '_queryDownload', value: list });
    if (list && list.length > 0) {
      return;
    }

    list = yield call(getScannedResults);
    list = list.data;
    yield put({ type: '_queryScanned', value: list });
  }
}

export default {
  namespace: 'imgData',

  state: {
    scanItems: [],
    downItems: [],
    selected: null, // selected doc
    selectedItems: null, // selected items (doc or attach) for selectedItem
    selectedItem: null, // selected jpg
    multipleSelectedItem: null, // multiple selected jpg
    attachKey: null, // attach key for attach
    loading: false,
  },

  subscriptions: {
    setup({ dispatch, history }) {
      // pathname is pages/... index.js folder path
      return history.listen(({ pathname, query }) => {
        if (query.route === 'documentBrowser') {
          if (query.docId === '') return;
          dispatch({ type: 'viewFromServer', payload: { docId: query.docId } });
        } else if (pathname === '/') {
          dispatch({ type: 'queryScanned' });
          dispatch({ type: 'queryDownload' });
        }
      });
    },
  },

  effects: {
    *viewFromServer({ payload }, { call, put }) {
      /* 靜態 docId (測試時 docId ID 取自於檔管) */
      // const docId = "1080000302"
      // const list = yield call(viewFromServer, docId)
      /* 動態取得 網址的 docId */
      const list = yield call(viewFromServer, payload.docId);
      yield put({ type: '_viewFromServer', value: list.data });
    },
    *queryScanned({ payload }, { call, put }) {
      const list = yield call(getScannedResults);
      yield put({ type: '_queryScanned', value: list.data });
    },
    *queryDownload({ payload }, { call, put }) {
      const list = yield call(getDownloadResults);
      yield put({ type: '_queryDownload', value: list.data });
      yield put({ type: 'UI/setValue', payload: { key: 'defaultBeh', value: true } });
    },
    *tickedById({ payload }, { put }) {
      yield put({ type: '_tickedById', keys: payload });
    },
    *selectById({ payload }, { put }) {
      yield put({ type: '_selectById', key: payload });
    },
    *selectByItemId({ payload }, { put, select }) {
      const { selectedItem } = yield select(s => s.imgData);
      const { Editor } = yield select(s => s.imgEditor);
      const { key } = payload;

      if (selectedItem && selectedItem.FileId === key) return;
      /*
      if (Editor && Editor.isEmptyUndoStack() === false) {
        if (!window.confirm("資料已修改，確定離開?")) return;
      }
      */
      yield put({ type: '_selectByItemId', key });
    },
    *multipleSelectedByItemId({ payload }, { put }) {
      const { keys } = payload;
      yield put({ type: '_multipleSelectedByItemId', keys });
    },
    *selectByIndex({ payload }, { put, select }) {
      const { index } = payload;
      const items = yield select(s => s.imgData.selectedItems);
      if (index < 0 || index >= items.length) return;
      const key = items[index].FileId;

      yield put({ type: '_selectByItemId', key });
    },
    *checkByItemId({ payload }, { put }) {
      const { key, items, image } = payload;
      yield put({ type: '_checkByItemId', key, items, image });
    },
    *reorder({ payload }, { put, call, select }) {
      const { after, fid } = payload;
      if (after === fid) return;

      const data = yield select(s => s.imgData);

      var doc = yield call(sReorder, toDocParam(data), after, fid);
      yield put({ type: '_reloadDoc', doc: doc.data });
    },
    *reorders({ payload }, { put, call, select }) {
      const { after, fidAry } = payload;
      const data = yield select(s => s.imgData);

      var doc = yield call(sReorders, toDocParam(data), after, fidAry);
      yield put({ type: '_reloadDoc', doc: doc.data });
    },
    *rotate({ payload }, { put, call, select }) {
      const { type, fidAry } = payload;

      if (!fidAry || fidAry.length === 0) return;

      const state = yield select(s => s.imgData);
      const param = toDocParam(state);
      param.Type = type;
      param.Fids = fidAry;

      var doc = yield call(sRotate, param);
      const result = doc.data;
      if (result.SelectedFileId) {
        yield put({ type: 'selectByItemId', payload: { key: result.SelectedFileId } });
      }

      yield put({ type: '_reloadDoc', doc: result });
    },
    *removeSelected({ payload }, { put, select, call }) {
      const state = yield select(s => s.imgData);

      let hasRm = false;
      for (let i = 0; i < state.downItems.length; i++) {
        // TMS: #0127423 支援多選移除
        const item = state.downItems[i];
        if (item.isTicked) {
          yield call(removeDoc, item);
          hasRm = true;
        }
      }

      for (let i = 0; i < state.scanItems.length; i++) {
        // TMS: #0127423 支援多選移除
        const item = state.scanItems[i];
        if (item.isTicked) {
          yield call(removeDoc, item);
          hasRm = true;
        }
      }

      if (hasRm === false) {
        yield call(removeDoc, toDocParam(state));
      }

      yield updateQueryList(state, put, call);
      yield put({ type: '_checkiItems' });
    },
    *removeBlank({ payload }, { put, select, call }) {
      const state = yield select(s => s.imgData);
      yield call(removeBlank, toDocParam(state));
      yield updateQueryList(state, put, call);
    },
    *split({ payload }, { put, call, select }) {
      const type = payload;
      const data = yield select(s => s.imgData);
      const docType = data.selected.DocType;

      yield call(split, {
        DocType: docType,
        DocId: data.selected.DocId,
        AttKey: data.attachKey,
        FileId: data.selectedItem.FileId,
        SplitType: type === 'doc' ? 0 : 1,
      });

      yield updateQueryList(data, put, call);
    },
    *change({ payload }, { put, call, select }) {
      const newId = payload;
      const data = yield select(s => s.imgData);
      const selected = data.selected;
      if (selected) {
        const result = yield call(uploadCheck, newId);
        if (result.data === 1) {
          const r = window.confirm('文號或檔號已存在掃描檔，是否仍要變更此文號或檔號?');
          if (r === false) return;
        } else if (result.data !== 0) {
          window.alert('查無此文號!');
          return;
        }

        yield call(change, selected.DocType, selected.DocId, newId);
        yield updateQueryList(data, put, call);
      }
    },
    *export({ payload }, { call, select }) {
      const selected = yield select(s => s.imgData.selected);
      if (selected) {
        let docType = selected.DocType;
        yield call(exportZIP, docType, selected.DocId);
        message.info('匯出完成!');
      }
    },
    *importTo({ payload }, { call, put, select }) {
      const data = yield select(s => s.imgData);
      const { tempId, fileList } = payload;
      const param = {
        Param: toDocParam(data),
        FidList: fileList,
      };

      var doc = yield call(importToFinish, tempId, param);
      yield put({ type: '_reloadDoc', doc: doc.data });
    },
    *download({ payload }, { put, call }) {
      let val = payload;
      if (!val || val.trim() === '') return;

      const down = yield call(downFromServer, val);
      if (!down.err) {
        if (down.data) {
          const list = yield call(getDownloadResults);
          const data = list.data;
          data.DocId = down.data.DocId;
          yield put({ type: '_queryDownload', value: data });
          message.info('下載完成!');
        } else message.error(`[${payload}] 下載失敗`);
      }
    },
    *downloadPdf({ payload }, { put, call }) {
      yield call(viewPdf, payload.docPath, payload.attachKey, payload.pdfName);
    },
    *uploadTickedItems({ payload }, { put, call, select }) {
      const data = yield select(s => s.imgData);
      let docItems = [];

      // 蒐集勾選的項目
      docItems = getTickedItems(data.scanItems, docItems);
      docItems = getTickedItems(data.downItems, docItems);

      // 如果沒勾選就...
      if (docItems.length <= 0) {
        let msgString = '請勾選項目才可上傳!';
        window.alert(msgString);
        return;
      }

      // 歸檔掃描
      const checkedItems = generateCheckedTickedItems(docItems);
      let result = yield call(uploadTickedItmesCheck, checkedItems);

      if (result && result.data && result.data.length > 0) {
        const exists = result.data.filter(ddd => ddd.result === 1);

        if (exists && exists.length > 0) {
          let msg = '以下文號已存在掃描檔，請確認是否覆蓋？';
          exists.forEach(eee => {
            msg += '\n' + eee.docId;
          });

          const r = window.confirm(msg);
          if (r === false) return;
        }
      }
      const settings = yield select(s => s.scanSettings.scanSettings);
      const isEnglish = settings.Recognition.OCRisEnglish === true;
      docItems.forEach(doc => {
        doc.isEnglish = isEnglish;
      });

      // 上傳至Server
      result = yield call(uploadTickedItmesToServer, docItems);

      let resultMsgs = result.data.map(item => {
        if (item.msg === '') {
          return `[${item.docId}] 上傳成功`;
        } else {
          return `[${item.msg}]`;
        }
      });

      let msgString = '';
      resultMsgs.forEach(msg => {
        const mmm = msg.replace('\\n', ' ');
        msgString += mmm + '\n';
      });
      window.alert(msgString);

      // 更新畫面
      yield updateQueryList(data, put, call);
      yield put({ type: '_checkiItems' });
    },
    *upload({ payload }, { put, call, select }) {
      const data = yield select(s => s.imgData);
      const selected = data.selected;
      if (selected) {
        let result = yield call(uploadCheck, selected.DocId);

        if (result.data === 1) {
          const r = window.confirm('文號或檔號已存在掃描檔，是否仍要上傳此文號或檔號?');
          if (r === false) return;
        } else if (result.data !== 0) {
          window.alert('查無此文號!');
          return;
        }

        result = yield call(uploadToServer, selected.DocType, selected.DocId);
        var err = result.data; //server return OK(200), but has error message
        if (err && err.length > 0) {
          message.error(err);
          return;
        }
        if (result.error) {
          //server return error, not 200
          return;
        }

        yield updateQueryList(data, put, call);
        yield put({ type: '_checkiItems' });

        window.alert(`[${selected.DocId}] 已上傳!`);
      }
    },
    *deletePage({ payload }, { call, put, select }) {
      const data = yield select(s => s.imgData);
      // let doc = yield call(deleteFid, toDocParam(data));
      let doc = yield call(deleteByFids, generateDeleteByFidsOutputObj(data));
      doc = doc.data;
      // console.log(doc);
      if (doc === null) {
        yield updateQueryList(data, put, call);
        yield put({ type: '_checkiItems' });
      } else yield put({ type: '_selectNext', doc: doc });
    },
  },

  reducers: {
    addScan(state, payload) {
      if (!payload.value) return state;
      const list = payload.value.data;
      if (!list) return state;

      const items = addToItems(state.scanItems, list);

      if (items.length > 0) {
        setSelected(state, items[0]);
      }

      return state;
    },
    _tickedById(state, payload) {
      let { keys } = payload;
      if (!keys) return state;

      clearTicked(state.scanItems);
      clearTicked(state.downItems);

      keys.forEach(key => {
        const index = key.indexOf('_');
        const isDoc = index != -1;
        let docType = '';
        let docId = '';
        if (isDoc) {
          docType = key.substring(0, index);
          docId = key.substring(index + 1);
        }

        if (docType === 'SCAN') {
          setIsTicked(true, state.scanItems, docId);
        } else if (docType === 'DOWN') {
          setIsTicked(true, state.downItems, docId);
        }
      });
    },
    _selectById(state, payload) {
      let { key } = payload;
      if (!key) return state;

      const isAttach = key.substring(key.length - 2) === '_A';

      const index = key.indexOf('_');
      let docType = 'SCAN';
      if (index > 0) {
        docType = key.substring(0, index);
        key = key.substring(index + 1);
      }

      if (isAttach) {
        key = key.substring(0, key.length - 2);

        if (docType === 'SCAN') {
          findResultA(state.scanItems, key, state);
        } else findResultA(state.downItems, key, state);

        return state;
      }

      if (docType === 'SCAN') {
        const found = findResult(state.scanItems, key);
        if (found) setSelected(state, found);
      } else {
        const found = findResult(state.downItems, key);
        if (found) setSelected(state, found);
      }

      return state;
    },
    _selectByItemId(state, payload) {
      const { key } = payload;
      if (!key) return state;
      const { selected } = state;

      state.multipleSelectedItem = null;

      if (setSelectedByItemId(state, selected.Items, key)) {
        state.attachKey = null;
        return state;
      }
      const ary = selected.Attachs;
      for (let i = 0, iC = ary.length; i < iC; i++) {
        var attach = ary[i];
        var items = attach.Items;

        if (setSelectedByItemId(state, items, key)) {
          state.attachKey = attach.Key;
          return state;
        }
      }
      return state;
    },
    _multipleSelectedByItemId(state, payload) {
      const { keys } = payload;
      const len = keys.length;
      if (!keys || len <= 0) return state;

      const { selectedItems } = state;

      // 驗證手否有存在於 selectedItems 內 避免他切換Doc時 會造成選取未清除的狀況
      var findSetItem = new Set();
      var findItems = [];

      // find selectItems by id return item
      keys.forEach(key => {
        const findItem = selectedItems.find(item => {
          return key === item.FileId;
        });
        findSetItem.add(findItem);
      });

      var someFunction = function(val1, val2, setItself) {
        findItems.push(val1);
      };

      findSetItem.forEach(someFunction);

      // set multipleSelectedItem
      if (findItems.length <= 0) {
        state.multipleSelectedItem = null;
      } else {
        state.multipleSelectedItem = findItems;
      }
      // console.log(...state.multipleSelectedItem.map(it => Object.values(it)[0])); // show ...multipleSelectedItem
      return state;
    },
    _checkByItemId(state, payload) {
      const { key, image } = payload;
      if (!key) return state;
      const { selectedItems } = state;

      if (!selectedItems) return state;

      checkItems(selectedItems, key, image);
      return state;
    },

    _viewFromServer(state, payload) {
      const list = payload.value;
      if (!list) return state;

      state.downItems = [list];
      setSelected(state, list);
      return state;
    },

    _queryScanned(state, payload) {
      const list = payload.value;
      if (!list) {
        state.loading = false;
        return state;
      }

      // 添加 isTicked 參數如果有舊值就設定舊值
      list.forEach(item => {
        item.isTicked = false;
        const findItem = state.scanItems.find(oldItem => oldItem.DocId === item.DocId);
        if (findItem != undefined) {
          item.isTicked = findItem.isTicked;
        }
      });

      state.scanItems = list;
      if ((state.selected === null || state.selected.DocType === 'SCAN') && list.length > 0) {
        setSelected(state, list[0]);
      }

      return state;
    },
    _queryDownload(state, payload) {
      let list = payload.value;
      if (!list) {
        state.loading = false;
        return state;
      }

      state.downItems = list;
      if (list.length > 0) {
        let selected = list[0];

        // 添加 isTicked 參數如果有舊值就設定舊值
        list.forEach(item => {
          item.isTicked = false;
          const findItem = state.downItems.find(oldItem => oldItem.DocId === item.DocId);
          if (!!findItem) {
            item.isTicked = findItem.isTicked;
          }

          if (item.DocId === list.DocId) {
            selected = item;
          }
        });

        setSelected(state, selected);
      }

      state.loading = false;
      return state;
    },
    _checkiItems(state, payload) {
      if (state.scanItems.length > 0) return state;
      if (state.downItems.length > 0) return state;

      state.selected = null;
      state.selectedItems = null;
      state.selectedItem = null;
      state.multipleSelectedItem = null;
      state.attachKey = null;

      return state;
    },
    _reloadDoc(state, payload) {
      const { doc } = payload;
      state.loading = false;
      return reloadDoc(state, doc);
    },
    /*
    // 暫無使用
    _selectNext(state, payload) {
      const { doc } = payload;
      const { selectedItems, selectedItem } = state;
      
      for (let i = 0, iC = selectedItems.length; i < iC; i++) {
        const item = selectedItems[i];
        if (item.FileId === selectedItem.FileId) {
          let ind = i;
          if (ind >= iC) ind = 0;
          state.selectedItem = selectedItems[ind];
          break;
        }
      }
      return reloadDoc(state, doc);
    },*/
    _selectNext(state, payload) {
      const { doc } = payload;
      const { selectedItems, selectedItem, multipleSelectedItem } = state;

      var selectedItemFileIdTemp = selectedItem.FileId;
      var selectedItemFileIdIndexTemp = 0;

      if (multipleSelectedItem != null && multipleSelectedItem.length > 0) {
        let mlen = multipleSelectedItem.length - 1;
        selectedItemFileIdTemp = multipleSelectedItem[mlen].FileId;
      }

      for (let i = 0, iC = selectedItems.length; i < iC; i++) {
        const item = selectedItems[i];
        if (item.FileId === selectedItemFileIdTemp) {
          selectedItemFileIdIndexTemp = i;
          break;
        }
      }

      while (true) {
        selectedItemFileIdIndexTemp += 1;
        selectedItemFileIdIndexTemp %= selectedItems.length;
        let selectedItemTemp = selectedItems[selectedItemFileIdIndexTemp];

        let isPresence = false;
        // ttosam01 20200908 multipleSelectedItem is null An error occurred
        if (multipleSelectedItem) {
          multipleSelectedItem.forEach(item => {
            if (item.FileId === selectedItemTemp.FileId) {
              isPresence = true;
              return;
            }
          });
        }

        // console.log(selectedItemTemp.FileId);
        if (isPresence) continue;

        state.selectedItem = selectedItemTemp;
        state.multipleSelectedItem = null;
        break;
      }
      return reloadDoc(state, doc);
    },
    setLoading(state, payload) {
      state.loading = !!payload.loading;
      return state;
    },
  },
};
