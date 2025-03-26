import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import ItemTypes from './ItemTypes';
import CardContent from './CardContent';

const cardSource = {
  beginDrag(props) {
    const { id, url } = props.data;
    const draggedCard = { id, url };
    let cards;
    if (props.selectedCards.find(card => card.id === props.id)) {
      cards = props.selectedCards;
    } else {
      cards = [draggedCard];
    }
    const otherCards = cards.concat();
    otherCards.splice(cards.findIndex(c => c.id === props.id), 1);
    const cardsDragStack = [draggedCard, ...otherCards];
    return { cards, cardsDragStack, draggedCard };
  },

  endDrag(props, monitor) {
    props.onDragComplete(monitor.getItem());
  },
};

const cardTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem();
    const pointerOffset = monitor.getClientOffset();
    const hoverId = props.id;
    props.onMove(item, hoverId, pointerOffset);
  },
};

class Card extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    item: PropTypes.object,
    data: PropTypes.object,
    id: PropTypes.string.isRequired,
    onMove: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragComplete: PropTypes.func.isRequired,
    selectedCards: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    //console.log('componentWillReceiveProps', nextProps);
    if (!this.props.isDragging && nextProps.isDragging) {
      this.props.onDragStart(nextProps.item);
    }
  }

  onClick(e) {
    this.props.onSelectionChange(this.props.id, e.ctrlKey || e.metaKey, e.shiftKey);
  }

  render() {
    /*
        if (this.renderCache) {
            return this.renderCache;
        }
        */

    const { data, connectDragSource, connectDropTarget } = this.props;
    const { url, title } = data;

    this.renderCache = connectDragSource(
      connectDropTarget(
        <div ref={node => (this.node = node)} className="card" onClick={this.onClick}>
          <CardContent url={url} title={title} />
        </div>
      )
    );

    return this.renderCache;
  }
}

export default DropTarget(ItemTypes.CARD, cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
  }))(Card)
);
