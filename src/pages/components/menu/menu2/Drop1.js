import React, { Component } from "react";
import { connect } from "dva";
import { Button, Input, Row, Col } from "antd";

import styles from "../Menu.less";

class Drop1 extends Component {
  state = {
    value: ""
  };

  changed = e => {
    this.setState({
      value: e.target.value
    });
  };

  submit = e => {
    const { dispatch } = this.props;
    dispatch({
      type: "imgData/change",
      payload: this.state.value
    });
    this.reset();
    dispatch({
      type: "UI/setValue",
      payload: {
        key: "Menu2Drop1",
        value: false
      }
    });
  }

  reset() {
    this.setState({
      value: ""
    });
  }

  render() {
    const { dispatch } = this.props;
    const { value } = this.state;

    return (
      <div className={styles.drop1}>
        <Row>
          <Col span={18}>
            <Input
              placeholder="請輸入文號"
              onChange={this.changed}
              value={value}
              onPressEnter={this.submit}
            />
          </Col>
          <Col span={6}>
            <Button
              onClick={this.submit}
            >
              確定
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect(state => {
  // const settings = state.scanSettings.scanSettings;
  return {};
})(Drop1);
