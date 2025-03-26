import React, { PureComponent } from 'react';
import Container from './Container';
import { connect } from 'dva';
import config from '../../../config';

class ImageList extends PureComponent {
  scrollTo(fid) {
    const container = this.refImageList.getDecoratedComponentInstance();
    container.scrollTo(fid);
  }

  getSelectedIds() {
    const container = this.refImageList.getDecoratedComponentInstance();
    return container.getSelectedIds();
  }

  render() {
    const { dispatch, selectedItems, selectedItem, readonly } = this.props;
    if (!selectedItems || selectedItems.length === 0) return null;

    let images = null;
    if (selectedItems) {
      images = selectedItems.map(it => ({
        id: it.FileId,
        title: it.FileId,
        url: it.Thumbnail
          ? config.remote + it.Thumbnail.substring(1, it.Thumbnail.length)
          : it.Thumbnail, //it.Thumbnail
      }));
    } else return null;

    const imgPros = {};
    if (selectedItems) {
      imgPros.images = images;
      if (selectedItem) imgPros.selectedId = selectedItem.FileId;
      else if (selectedItems.length > 0) {
        imgPros.selectedId = selectedItems[0].FileId;
      }
    }

    if (this.refImageList) {
      const container = this.refImageList.getDecoratedComponentInstance();
      if (imgPros.images) {
        container.update(imgPros.images, imgPros.selectedId);
      } else {
        container.update([], null);
      }
    }

    if (readonly) imgPros.readonly = true;

    return (
      <Container
        ref={ref => {
          this.refImageList = ref;
        }}
        {...imgPros}
        onClick={id => {
          dispatch({
            type: 'imgData/selectByItemId',
            payload: { key: id },
          });
        }}
        onSelectedCard={ids => {
          dispatch({
            type: 'imgData/multipleSelectedByItemId',
            payload: { keys: ids },
          });
        }}
        reorder={(after, fidAry) => {
          dispatch({
            type: 'imgData/reorders',
            payload: { after, fidAry },
          });
        }}
      />
    );
  }
}

function mapStateToProps(state) {
  const { selectedItem, selectedItems } = state.imgData;
  return { selectedItem, selectedItems };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(ImageList);
