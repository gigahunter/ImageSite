import { connect } from "dva";
import { Checkbox, Radio } from "antd";

import styles from "../Menu.less";

const RadioGroup = Radio.Group;

function CheckRadio({ dispatch, Orientation }) {
  const checked = Orientation !== 0x100;
  const changed = e => {
    const target = e.target;
    let v = 0x100;
    if (target.checked === false) {
      v = 0x100;
    } else {
      if (target.value === undefined) {
        v = 1;
      } else {
        v = target.value;
      }
    }

    dispatch({
      type: "scanSettings/setScanValue",
      payload: { Orientation: v }
    });
  };

  return (
    <div>
      <Checkbox checked={checked} onChange={changed}>
        橫式旋轉
      </Checkbox>
      <RadioGroup
        onChange={changed}
        value={Orientation}
        disabled={!checked}
        className={styles.padding1}
      >
        <Radio className={styles.checkRadio} value={1}>
          向右
        </Radio>
        <Radio className={styles.checkRadio} value={4}>
          向左
        </Radio>
      </RadioGroup>
    </div>
  );
}

export default connect(state => {
  const settings = state.scanSettings.scanSettings;
  return { Orientation: settings.Orientation };
})(CheckRadio);
