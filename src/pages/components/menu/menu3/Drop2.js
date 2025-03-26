import { connect } from 'dva';
import { Row, Col } from 'antd';
import Counter from '../../../../components/Counter';

import styles from '../Menu.less';

function Drop2({ dispatch, rotation }) {
  const size1 = 4;
  const size2 = 20;

  const changed = (v, type) => {
    const payload = {
      name: type,
      value: v,
    };

    dispatch({
      type: 'imgEditor/set',
      payload,
    });
  };

  return (
    <div className={styles.drop2M3}>
      <Row
        onClick={() => dispatch({ type: 'imgEditor/rotate', payload: 90 })}
        className={styles.canClick}
      >
        <Col span={size1} />
        <Col span={size2}>向右旋轉90度</Col>
      </Row>
      <Row
        onClick={() => dispatch({ type: 'imgEditor/rotate', payload: 270 })}
        className={styles.canClick}
      >
        <Col span={size1} />
        <Col span={size2}>向左旋轉90度</Col>
      </Row>
      <Row
        onClick={() => dispatch({ type: 'imgEditor/flip', payload: 'flipY' })}
        className={styles.canClick}
      >
        <Col span={size1} />
        <Col span={size2}>垂直翻轉</Col>
      </Row>
      <Row
        onClick={() => dispatch({ type: 'imgEditor/flip', payload: 'flipX' })}
        className={styles.canClick}
      >
        <Col span={size1} />
        <Col span={size2}>水平翻轉</Col>
      </Row>
      <Row>
        <Col span={size1}>旋轉</Col>
        <Col span={size2}>
          <Counter
            value={rotation}
            step={1}
            postfix="度"
            maxValue={360}
            minValue={0}
            onChange={(o, v) => changed(v, 'rotation')}
          />
        </Col>
      </Row>
    </div>
  );
}

export default connect(state => {
  const { rotation } = state.imgEditor;
  return { rotation };
})(Drop2);
