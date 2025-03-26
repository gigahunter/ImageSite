import { connect } from 'dva';
import { Button } from 'antd';

import { printBarcode } from '../menu1/Drop2';
import styles from '../Menu.less';

function Drop2({ dispatch, Recognition }) {
  return (
    <div className={styles.drop2M2}>
      <Button
        className={styles.buttonW}
        onClick={e =>
          dispatch({
            type: 'imgData/split',
            payload: 'doc',
          })
        }
      >
        本文
      </Button>
      <br />
      <Button
        className={styles.buttonW}
        onClick={e =>
          dispatch({
            type: 'imgData/split',
            payload: 'attach',
          })
        }
      >
        附件
      </Button>
    </div>
  );
}

export default connect(state => {
  const settings = state.scanSettings.scanSettings;
  return { Recognition: settings.Recognition };
})(Drop2);
