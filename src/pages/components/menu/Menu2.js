import { connect } from 'dva';
import { Button, Popconfirm } from 'antd';

import config from '../../../config';
import FileUpload from '../FileUpload';
import FileUpload2 from '../FileUpload2';
import Drop2M from './menu1/Drop2';
import ButtonInput from '../ButtonInput';

import styles from './Menu.less';

function Menu2({ supportScan, Menu2Drop1, dispatch }) {
  const propDrop1 = {};
  if (Menu2Drop1 === true) propDrop1.visible = true;
  if (Menu2Drop1 === false) propDrop1.visible = false;

  function defaultBehEnable() {
    dispatch({
      type: 'UI/setValue',
      payload: { key: 'defaultBeh', value: true },
    });
  }

  return (
    <div>
      <div className={styles.padding1}>
        {supportScan && (
          <Button
            onClick={e =>
              dispatch({
                type: 'scanSettings/scan',
              })
            }
          >
            啟動掃描
          </Button>
        )}
        <Button
          onClick={e =>
            dispatch({
              type: 'imgData/removeBlank',
            })
          }
        >
          移除空白頁
        </Button>
      </div>
      <div className={styles.padding1}>
        <Button
          onClick={e => {
            defaultBehEnable();
            dispatch({
              type: 'imgData/uploadTickedItems',
            });
          }}
        >
          上傳主機
        </Button>
      </div>
      {!config.NoDownload && (
        <div className={styles.padding1}>
          <ButtonInput
            title="文號下載"
            onClick={v =>
              dispatch({
                type: 'imgData/download',
                payload: v,
              })
            }
          />
        </div>
      )}
      <div className={styles.padding1}>
        <div className="ant-btn" style={{ paddingTop: '3pt' }}>
          <FileUpload />
        </div>
      </div>
      <div className={styles.padding1}>
        <Button
          onClick={e =>
            dispatch({
              type: 'imgData/export',
            })
          }
        >
          匯出本機
        </Button>
      </div>
      <div className={styles.padding1}>
        <Popconfirm
          placement="bottom"
          title={'確定移除?'}
          onConfirm={() => {
            defaultBehEnable();

            dispatch({
              type: 'imgData/removeSelected',
            });
          }}
          okText="確定"
          cancelText="取消"
        >
          <Button>移除公文</Button>
        </Popconfirm>
      </div>
      <div className={styles.padding1}>
        <Popconfirm
          placement="bottom"
          title={'確定刪除頁面?'}
          onConfirm={() =>
            dispatch({
              type: 'imgData/deletePage',
            })
          }
          okText="確定"
          cancelText="取消"
        >
          <Button>刪除頁面</Button>
        </Popconfirm>
      </div>
      {supportScan && (
        <div className={styles.padding1}>
          <Button
            onClick={e =>
              dispatch({
                type: 'scanSettings/scanTo',
              })
            }
          >
            掃描器插入新頁
          </Button>
        </div>
      )}
      <div className={styles.padding1}>
        <div className="ant-btn" style={{ paddingTop: '3pt' }}>
          <FileUpload2 />
        </div>
      </div>
      <div className={styles.padding1}>
        <Button
          onClick={e =>
            dispatch({
              type: 'imgData/split',
              payload: 'doc',
            })
          }
        >
          分割成本文
        </Button>
      </div>
      <div className={styles.padding1}>
        <Button
          onClick={e =>
            dispatch({
              type: 'imgData/split',
              payload: 'attach',
            })
          }
        >
          分割成附件
        </Button>
      </div>
      <div className={styles.padding1}>
        <ButtonInput
          title="變更文號"
          onClick={v =>
            dispatch({
              type: 'imgData/change',
              payload: v,
            })
          }
        />
      </div>
      <div className={styles.padding}>
        <span className={styles.title}>條碼辨識</span>
        <Drop2M />
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { imageRatio } = state.imgEditor;
  const { selected, attachKey } = state.imgData;
  const { Menu2Drop1 } = state.UI;
  return { imageRatio, Menu2Drop1, selected, attachKey };
}

export default connect(mapStateToProps)(Menu2);
