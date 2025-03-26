import { Select, Avatar, Checkbox, Popover, Icon, Button, Radio } from 'antd';
import { connect } from 'dva';

import CheckRadio from './menu1/CheckRadio';
import Drop1 from './menu1/Drop1';

import styles from './Menu.less';

const Option = Select.Option;
const RadioGroup = Radio.Group;

function Menu1({ dispatch, scanners, selectedId, scanSettings }) {
  if (!scanners) return 'ImageTray 尚未啟動，請執行之…';

  var sss = [];
  var selectProps = {};
  if (scanners) {
    scanners.forEach(s => {
      sss.push(
        <Option value={s.Id} key={s.Id}>
          <Avatar src="./img/scanner.png" />
          {s.Name}
        </Option>
      );
    });

    if (selectedId) {
      selectProps.defaultValue = selectedId;
    }
  }

  return (
    <div>
      <div className={styles.padding}>
        <span className={styles.title}>掃描器</span>
        <Select
          className={styles.select}
          {...selectProps}
          onChange={v =>
            dispatch({
              type: 'scanSettings/setSelectId',
              payload: v,
            })
          }
        >
          {sss}
        </Select>
      </div>
      <div className={styles.padding}>
        <span className={styles.title}>紙張大小</span>
        <Select
          className={styles.select}
          defaultValue={scanSettings.PageSize}
          onChange={v =>
            dispatch({
              type: 'scanSettings/setScanValue',
              payload: { PageSize: v },
            })
          }
        >
          <Option value={0x100}>自動</Option>
          <Option value={0}>A4</Option>
          <Option value={1}>A3</Option>
        </Select>
      </div>
      <div className={styles.padding}>
        <Checkbox
          checked={scanSettings.Duplex}
          onChange={e =>
            dispatch({
              type: 'scanSettings/setScanValue',
              payload: { Duplex: e.target.checked },
            })
          }
        >
          雙面掃描
        </Checkbox>
      </div>
      <div className={styles.padding}>
        <CheckRadio />
      </div>
      <div className={styles.padding}>
        <span className={styles.title}>色彩</span>
        <RadioGroup
          onChange={e => {
            dispatch({
              type: 'scanSettings/setScanValue',
              payload: { ColorType: e.target.value },
            });
          }}
          value={scanSettings.ColorType}
          className={styles.padding1}
        >
          <Radio className={styles.checkRadio} value={4}>
            黑白
          </Radio>
          <Radio className={styles.checkRadio} value={2}>
            灰階
          </Radio>
          <Radio className={styles.checkRadio} value={1}>
            彩色
          </Radio>
        </RadioGroup>
      </div>
      <div className={styles.padding}>
        <span className={styles.title}>解析度</span>
        <br />
        <RadioGroup
          onChange={e => {
            dispatch({
              type: 'scanSettings/setScanValue',
              payload: { DPI: e.target.value },
            });
          }}
          value={scanSettings.DPI}
          className={styles.padding1}
        >
          <Radio className={styles.checkRadio} value={300}>
            300dpi
          </Radio>
          <Radio className={styles.checkRadio} value={200}>
            200dpi
          </Radio>
        </RadioGroup>
      </div>
      <div className={styles.padding}>
        <span className={styles.title}>自動校正</span>
        <Drop1 />
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const settings = state.scanSettings;
  return {
    scanSettings: settings.scanSettings,
    scanners: settings.scannerList,
    selectedId: settings.selectedId,
  };
}

export default connect(mapStateToProps)(Menu1);
