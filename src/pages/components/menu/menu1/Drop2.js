import { connect } from 'dva';
import { Checkbox, Icon, Radio } from 'antd';

import styles from '../Menu.less';

function getUrl(pre, text, desc) {
  return `${pre}pBarcode.html?a=${encodeURI(text)}&b=${encodeURI(desc)}`;
}

export function printBarcode(text, desc) {
  let url = window.location.href;
  let ind = url.indexOf('/?') + 1;
  if (ind <= 0) {
    ind = url.indexOf('index.html?');
    if (ind < 0) {
      ind = url.length;
    }
  }

  url = getUrl(url.substr(0, ind), text, desc);
  var win = window.open(url, '_blank');
  win.focus();
}

function Drop2({ dispatch, Recognition }) {
  function onChange(v) {
    const barcode = v.target.value === 1;
    const noBarcode = v.target.value === 3;
    let split = false;
    let attach = false;
    let splitBarcode = false;
    if (barcode === false && noBarcode === false) {
      split = true;
      attach = true;
      splitBarcode = true;
    }

    dispatch({
      type: 'scanSettings/setRecognition',
      payload: {
        Barcode: barcode,
        Split: split,
        Attach: attach,
        SplitBarcode: splitBarcode,
        NoBarcode: noBarcode,
      },
    });
  }

  let value = 2;
  if (Recognition.Barcode) value = 1;
  else if (Recognition.NoBarcode) value = 3;

  return (
    <div className={styles.drop1M1}>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value={1}>文號辨識</Radio>
        <Radio value={2}>
          隔頁紙辨識
          <div style={{ marginLeft: '20px' }}>
            <Checkbox
              checked={Recognition.Split}
              onChange={e => {
                dispatch({
                  type: 'scanSettings/setRecognition',
                  payload: { Split: e.target.checked },
                });
              }}
            >
              公文隔頁紙
            </Checkbox>
            <Icon
              type="printer"
              theme="outlined"
              onClick={e => printBarcode(Recognition.SplitText, '公文隔頁紙')}
            />
            <br />
            <Checkbox
              checked={Recognition.Attach}
              onChange={e => {
                dispatch({
                  type: 'scanSettings/setRecognition',
                  payload: { Attach: e.target.checked },
                });
              }}
            >
              附件隔頁紙
            </Checkbox>
            <Icon
              type="printer"
              theme="outlined"
              onClick={e => printBarcode(Recognition.AttachText, '附件隔頁紙')}
            />
            <br />
            <Checkbox
              checked={Recognition.SplitBarcode}
              onChange={e => {
                dispatch({
                  type: 'scanSettings/setRecognition',
                  payload: { SplitBarcode: e.target.checked },
                });
              }}
            >
              辨識首頁條碼
            </Checkbox>
          </div>
        </Radio>
        <Radio value={3}>不辨識</Radio>
      </Radio.Group>
      <Checkbox
        checked={Recognition.OCRisEnglish}
        onChange={e => {
          dispatch({
            type: 'scanSettings/setRecognition',
            payload: { OCRisEnglish: e.target.checked },
          });
        }}
      >
        OCR辨識(英文為主)
      </Checkbox>
    </div>
  );
}

export default connect(state => {
  const settings = state.scanSettings.scanSettings;
  return { Recognition: settings.Recognition };
})(Drop2);
