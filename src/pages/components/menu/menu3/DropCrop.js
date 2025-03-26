import { connect } from "dva";
import { Row, Col, Button } from "antd";

import styles from "../Menu.less";

const ButtonGroup = Button.Group;

function DropCrop({ dispatch }) {
  return (
    <div className={styles.drop1M1}>
      <Row>
        <Col>
          <ButtonGroup>
            <Button
              className={styles.buttonH}
              onClick={() => dispatch({ type: "imgEditor/cropApply" })}
            >
              確定
            </Button>
            <Button
              className={styles.buttonH}
              onClick={() => dispatch({ type: "imgEditor/cropCancel" })}
            >
              取消
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
  );
}

export default connect(state => {
  return {};
})(DropCrop);
