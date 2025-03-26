import { connect } from 'dva';
import { Row, Col, Checkbox, InputNumber } from 'antd';

import styles from '../Menu.less';

const inputProps = {};

inputProps.formatter = v => `${v}%`;
inputProps.parser = v => v.replace('%', '');

function Drop1({ dispatch, Correction }) {
  const size1 = 4;
  const size2 = 20;

  return (
    <div className={styles.drop1M1}>
      <Row>
        <Col span={size1}>
          <Checkbox
            checked={Correction.Brightness}
            onChange={e => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { Brightness: e.target.checked },
              });
            }}
          />
        </Col>
        <Col span={size2}>自動調整亮度</Col>
      </Row>
      <Row>
        <Col span={size1}>
          <Checkbox
            checked={Correction.Contrast}
            onChange={e => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { Contrast: e.target.checked },
              });
            }}
          />
        </Col>
        <Col span={size2}>自動調整對比</Col>
      </Row>
      <Row>
        <Col span={size1}>
          <Checkbox
            checked={Correction.DarkEdge}
            onChange={e => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { DarkEdge: e.target.checked },
              });
            }}
          />
        </Col>
        <Col span={size2}>去黑邊</Col>
      </Row>
      <Row>
        <Col span={size1}>
          <Checkbox
            checked={Correction.Skew}
            onChange={e => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { Skew: e.target.checked },
              });
            }}
          />
        </Col>
        <Col span={size2}>歪斜校正</Col>
      </Row>
      <Row>
        <Col span={size1}>
          <Checkbox
            checked={Correction.Denoise}
            onChange={e => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { Denoise: e.target.checked },
              });
            }}
          />
        </Col>
        <Col span={size2}>去雜點</Col>
      </Row>
      <Row>
        <Col span={size1}>
          <Checkbox
            checked={Correction.DelBlankPage}
            onChange={e => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { DelBlankPage: e.target.checked },
              });
            }}
          />
        </Col>
        <Col span={size2}>刪除空白頁</Col>
      </Row>
      <Row>
        <Col span={size1} />
        <Col span={size2}>
          空白比
          <InputNumber
            {...inputProps}
            value={Correction.BlankPagePercentage}
            onChange={v => {
              dispatch({
                type: 'scanSettings/setCorrection',
                payload: { BlankPagePercentage: v },
              });
            }}
            step={1}
            max={100}
            min={50}
          />
        </Col>
      </Row>
    </div>
  );
}

export default connect(state => {
  const settings = state.scanSettings.scanSettings;
  return { Correction: settings.Correction };
})(Drop1);
