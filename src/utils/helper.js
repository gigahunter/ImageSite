export function toDocParam(state) {
  const { selected } = state;

  if (selected === null) return null;

  const docParam = {
    DocType: selected.DocType,
    DocId: selected.DocId,
    AttKey: state.attachKey,
    FileId: state.selectedItem.FileId
  };

  return docParam;
}

/**
 * 生成 API DeletByFids Output 物件
 * @param {*} state 
 */
export function generateDeleteByFidsOutputObj(state) {
  const { selected, selectedItem, multipleSelectedItem } = state;

  if (selected === null) return null;

  const docParam = {
    DocType: selected.DocType,
    DocId: selected.DocId,
    AttKey: state.attachKey,
  };
  
  var fidsTo = [];
  if (multipleSelectedItem != null) {
    multipleSelectedItem.forEach( item => {
      fidsTo.push(item.FileId);
    });
  }

  if (fidsTo != null && fidsTo.length > 0) {
    docParam.FileId = "";
    docParam.FileIds = fidsTo;
  } else {
    docParam.FileId = selectedItem.FileId;
  }
  // console.log(docParam);
  return docParam;
}