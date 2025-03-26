import { connect } from 'dva';
import { Popover, Button, Icon } from 'antd';

import Drop1 from './menu3/Drop1';
import Drop2 from './menu3/Drop2';
import Drop3 from './menu3/Drop3';
import Slider2 from './menu3/Slider2';

import styles from './Menu.less';

const ButtonGroup = Button.Group;

const content1 = <Drop1 />;
const content2 = <Drop2 />;
const content3 = <Drop3 />;

function Menu3({ dispatch, canUndo, canRedo }) {
  return (
    <div>
      <div className={styles.padding1}>
        <ButtonGroup>
          <Button
            disabled={!canUndo}
            className={styles.button}
            onClick={() => dispatch({ type: 'imgEditor/undo' })}
          >
            復原
          </Button>
          <Button
            disabled={!canRedo}
            className={styles.button}
            onClick={() => dispatch({ type: 'imgEditor/redo' })}
          >
            重做
          </Button>
        </ButtonGroup>
        <Button
          disabled={!canUndo}
          className={styles.button}
          onClick={() => dispatch({ type: 'imgEditor/save' })}
          style={{ marginLeft: '22px' }}
        >
          儲存
        </Button>
      </div>
      <div className={styles.padding1}>
        <Slider2 />
      </div>
      <div className={styles.padding1}>
        <ButtonGroup>
          <Button onClick={() => dispatch({ type: 'imgEditor/grayScale' })}>轉灰階</Button>
          <Button onClick={() => dispatch({ type: 'imgEditor/blackWhite' })}>轉黑白</Button>
        </ButtonGroup>
      </div>
      <div className={styles.padding1}>
        <span className={styles.title}>調整影像大小</span>
        <Drop1 />
      </div>
      <div
        className={styles.padding1}
        style={{ border: '2pt', borderStyle: 'dashed', margin: '3pt', paddingBottom: '2pt' }}
      >
        <Drop2 />
      </div>
      <div className={styles.padding1}>
        <Button onClick={() => dispatch({ type: 'imgEditor/crop' })}>裁剪</Button>
      </div>
      <div className={styles.padding1}>
        <Button onClick={() => dispatch({ type: 'imgEditor/setDraw', payload: true })}>
          去除髒污
        </Button>
      </div>
      <div className={styles.padding1}>
        <Button onClick={() => dispatch({ type: 'imgEditor/autoEffect' })}>自動校正</Button>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { canUndo, canRedo } = state.imgEditor;
  return {
    canUndo,
    canRedo,
  };
}

export default connect(mapStateToProps)(Menu3);
