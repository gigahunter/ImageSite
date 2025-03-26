import { Component } from "react";
import { Input, Row, Col, Button } from "antd";
import PropTypes from "prop-types";
// import { connect } from "dva";

import styles from "./Content.less";

class GoPage extends Component {
  inputValue = 1;

  setInputValue = e => {
    this.inputValue = parseInt(e.target.value, 10);
  };

  goPage = e => {
    if (this.props.onPage) {
      this.props.onPage(this.inputValue);
    }
  };

  render() {
    return (
      <Row className={styles.goPage}>
        <Col span={20}>
          <Input
            placeholder="頁碼"
            defaultValue={this.inputValue}
            addonBefore="第"
            addonAfter="頁"
            onChange={this.setInputValue}
          />
        </Col>
        <Col span={4}>
          <Button onClick={this.goPage}>GO</Button>
        </Col>
      </Row>
    );
  }
}

/*
function mapStateToProps(state) {
  const { selectedItems } = state.imgData;
  return { selectedItems };
}

export default connect(mapStateToProps)(GoPage);
*/

GoPage.propTypes = {
  onPage: PropTypes.func
};

export default GoPage;
