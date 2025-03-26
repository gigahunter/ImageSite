import { connect } from "dva";
import { Row, Col, Checkbox, Button } from "antd";
import Counter from "../../../../components/Counter";

import styles from "../Menu.less";

function adjustW(payload, resize, r) {
  payload.width = resize.width * r;
  payload.widthP = resize.widthP * r;
}

function adjustH(payload, resize, r) {
  payload.height = resize.height * r;
  payload.heightP = resize.heightP * r;
}

function Drop1({ dispatch, resize }) {
  const size1 = 6;
  const size2 = 18;

  const changed = (o, v, type) => {
    const r = v / o;

    const payload = {};
    if (type === 1) {
      payload.height = v;
      if (resize.LockAspectRatio) {
        adjustW(payload, resize, r);
      }
      payload.heightP = resize.heightP * r;
    } else if (type === 2) {
      payload.width = v;
      if (resize.LockAspectRatio) {
        adjustH(payload, resize, r);
      }
      payload.widthP = resize.widthP * r;
    } else if (type === 3) {
      payload.rotation = v;
    } else if (type === 4) {
      payload.heightP = v;
      if (resize.LockAspectRatio) {
        adjustW(payload, resize, r);
      }
      payload.height = resize.height * r;
    } else if (type === 5) {
      payload.widthP = v;
      if (resize.LockAspectRatio) {
        adjustH(payload, resize, r);
      }
      payload.width = resize.width * r;
    } else if (type === 6) {
      payload.LockAspectRatio = v;
    }

    dispatch({
      type: "imgEditor/setResize",
      payload
    });
  };

  return (
    <div className={styles.drop1}>
      <Row>
        <Col span={size1}>高度</Col>
        <Col span={size2}>
          <Counter
            value={resize.height}
            postfix="公分"
            step={0.1}
            precision={2}
            onChange={(o, v) => changed(o, v, 1)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={size1}>寬度</Col>
        <Col span={size2}>
          <Counter
            value={resize.width}
            postfix="公分"
            step={0.1}
            precision={2}
            onChange={(o, v) => changed(o, v, 2)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={size1}>調整高度</Col>
        <Col span={size2}>
          <Counter
            value={resize.heightP}
            postfix="%"
            step={1}
            maxValue={400}
            minValue={50}
            precision={1}
            onChange={(o, v) => changed(o, v, 4)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={size1}>調整寬度</Col>
        <Col span={size2}>
          <Counter
            value={resize.widthP}
            postfix="%"
            step={1}
            maxValue={400}
            minValue={50}
            precision={1}
            onChange={(o, v) => changed(o, v, 5)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Checkbox
            checked={resize.LockAspectRatio}
            onChange={e => changed(resize.LockAspectRatio, e.target.checked, 6)}
          >
            鎖定長寬比
          </Checkbox>
          <Button onClick={() => dispatch({ type: "imgEditor/doResize" })}>
            確定
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default connect(state => {
  const resize = state.imgEditor.resize;
  return { resize };
})(Drop1);
