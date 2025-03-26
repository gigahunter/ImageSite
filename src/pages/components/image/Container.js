import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import CardWrapper from './CardWrapper';
import CardDragLayer from './CardDragLayer';
import Card from './Card';

import styles from './Image.less';

const getNodeClientBounds = node => {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) {
    return null;
  }
  return el.getBoundingClientRect();
};

class Container extends PureComponent {
  fid2Img = {};

  constructor(props) {
    super(props);

    let cards = [];
    if (props.images) cards = props.images;

    this.state = {
      selectedCards: [],
      selectedCardsIds: [],
      draggedCardsIds: [],
      insertIndex: -1,
      cards: cards,
      activeCardId: props.selectedId,
    };

    this.onCardMove = this.onCardMove.bind(this);
    this.onCardDragStart = this.onCardDragStart.bind(this);
    this.onCardDragComplete = this.onCardDragComplete.bind(this);
    this.onCardSelectionChange = this.onCardSelectionChange.bind(this);
  }

  update(images, selectedId) {
    this.setState({
      selectedCards: [],
      selectedCardsIds: [],
      draggedCardsIds: [],
      insertIndex: -1,
      cards: images,
      activeCardId: selectedId,
    });
  }

  scrollTo(fid) {
    const elm = ReactDOM.findDOMNode(this.fid2Img[fid]);
    if (elm) elm.scrollIntoView();
  }

  getSelectedIds() {
    let ret = this.state.selectedCardsIds;
    if (ret === null || ret.length === 0) ret = [this.state.activeCardId];

    return ret;
  }

  onCardDragStart(dragItem) {
    if (this.props.readonly) return;

    const cards = this.state.cards.slice();

    Array.from(this.container.childNodes).map((child, i) => {
      cards[i].bounds = getNodeClientBounds(child);
      return child;
    });

    this.setState({
      cards,
      selectedCards: dragItem.cards,
      selectedCardsIds: dragItem.cards.map(c => c.id),
      draggedCardsIds: dragItem.cards.map(c => c.id),
      hoveredCardId: dragItem.draggedCard.id,
      activeCardId: dragItem.draggedCard.id,
    });
  }

  onCardMove(dragItem, hoverId, pointerOffset) {
    if (this.props.readonly) return;

    const dragId = dragItem.draggedCard.id;

    const cards = this.state.cards.slice();

    // const dragIndex = cards.findIndex(el => el.id === dragId);
    const hoverIndex = cards.findIndex(el => el.id === hoverId);
    // const dragCard = cards[dragIndex];
    const hoverCard = cards[hoverIndex];

    const midX = hoverCard.bounds.left + (hoverCard.bounds.right - hoverCard.bounds.left) / 2;
    const insertIndex = pointerOffset.x < midX ? hoverIndex : hoverIndex + 1;

    if (
      this.previousDragId === dragId &&
      this.previousHoverId === hoverId &&
      this.previousInsertIndex === insertIndex
    ) {
      return;
    }
    this.previousDragId = dragId;
    this.previousHoverId = hoverId;
    this.previousInsertIndex = insertIndex;

    this.setState({
      insertIndex,
      hoveredCardIndex: hoverIndex,
      hoveredCardId: hoverId,
    });
  }

  onCardDragComplete(dragItem) {
    if (this.props.readonly) return;

    const changes = {
      draggedCardsIds: [],
      insertIndex: -1,
      hoveredCardId: null,
      hoveredCardIndex: -1,
    };
    if (dragItem) {
      let cards = this.state.cards.slice();
      const draggedCards = dragItem.cards;
      const remainingCards = cards.filter(c => !draggedCards.find(dc => dc.id === c.id));
      let insertIndex = -1;
      if (this.state.insertIndex < cards.length && this.state.insertIndex >= 0) {
        let index = this.state.insertIndex;
        do {
          const cardIdAtInsertIndex = cards[index].id;
          insertIndex = remainingCards.findIndex(c => c.id === cardIdAtInsertIndex);
          index += 1;
        } while (insertIndex < 0 && index < cards.length);
      }
      if (insertIndex < 0) {
        insertIndex = remainingCards.length;
      }

      const reorder = this.props.reorder;
      if (reorder) {
        const idAry = draggedCards.map(it => it.id);
        const ind = insertIndex - 1;
        let after = null;
        let ccc = true;
        if (ind >= 0 && remainingCards.length > ind) {
          after = remainingCards[ind].id;
          if (idAry.length === 1 && cards.length > insertIndex){
            // ccc = cards[insertIndex].id !== idAry[0]; //not refresh so not do this
          }
        }
        if (ccc) reorder(after, idAry);
      }

      remainingCards.splice(insertIndex, 0, ...draggedCards);
      changes.cards = remainingCards;
    }
    this.setState(changes);
  }

  // cmdKeyActive [Ctrl 是否按住] Bool
  // shiftKeyActive [Shift 是否按住] Bool
  onCardSelectionChange(cardId, cmdKeyActive, shiftKeyActive) {
    let selectedCardsIds = [];
    let activeCardId;

    const cards = this.state.cards.slice();
    let previousSelectedCardsIds = this.state.selectedCardsIds.slice();
    let previousActiveCardId = this.state.activeCardId;

    if (cmdKeyActive) {
      if (previousSelectedCardsIds.indexOf(cardId) > -1 && cardId !== previousActiveCardId) {
        selectedCardsIds = previousSelectedCardsIds.filter(id => id !== cardId);
      } else {
        selectedCardsIds = [...previousSelectedCardsIds, cardId];
      }
      const selectedCard = this.props.onSelectedCard;
      if (selectedCard) selectedCard(selectedCardsIds);
    } else if (shiftKeyActive && cardId !== previousActiveCardId) {
      const activeCardIndex = cards.findIndex(c => c.id === previousActiveCardId);
      const cardIndex = cards.findIndex(c => c.id === cardId);
      const lowerIndex = Math.min(activeCardIndex, cardIndex);
      const upperIndex = Math.max(activeCardIndex, cardIndex);
      selectedCardsIds = cards.slice(lowerIndex, upperIndex + 1).map(c => c.id);
      const selectedCard = this.props.onSelectedCard;
      if (selectedCard) selectedCard(selectedCardsIds);
    } else {
      selectedCardsIds = [cardId];
      activeCardId = cardId;

      const click = this.props.onClick;
      if (click) click(activeCardId);
    }

    const selectedCards = cards.filter(c => selectedCardsIds.includes(c.id));

    const changes = {
      selectedCards,
      selectedCardsIds,
    };
    if (activeCardId) {
      changes.activeCardId = activeCardId;
    }
    this.setState(changes);
  }

  render() {
    const {
      cards,
      draggedCardsIds,
      selectedCards,
      selectedCardsIds,
      activeCardId,
      hoveredCardId,
      hoveredCardIndex,
      insertIndex,
    } = this.state;

    const { readonly } = this.props;

    const total = cards.length;
    return (
      <div
        tabIndex={0}
        onKeyPress={e => {
          debugger;
          console.log(e);
        }}
      >
        {!readonly && <CardDragLayer />}
        <div
          className="container"
          ref={el => {
            this.container = el;
          }}
        >
          {cards.map((card, i) => {
            const prevCard = i > 0 ? cards[i - 1] : null;
            const nextCard = i < cards.length ? cards[i + 1] : null;

            const isDragging = draggedCardsIds.includes(card.id);
            const isDraggingPrevCard = !!prevCard && draggedCardsIds.includes(prevCard.id);
            const isDraggingNextCard = !!nextCard && draggedCardsIds.includes(nextCard.id);

            const shouldInsertLineOnLeft =
              !isDragging && !isDraggingPrevCard && hoveredCardIndex === i && insertIndex === i;
            const shouldInsertLineOnRight =
              !isDragging && !isDraggingNextCard && hoveredCardIndex === i && insertIndex === i + 1;

            const shouldInsertLineOnRightOfPrevCard =
              !!prevCard && !isDraggingPrevCard && hoveredCardIndex === i - 1 && insertIndex === i;
            const shouldInsertLineOnLeftOfNextCard =
              !!nextCard &&
              !isDraggingNextCard &&
              hoveredCardIndex === i + 1 &&
              insertIndex === i + 1;

            const isHovered =
              hoveredCardId === card.id ||
              shouldInsertLineOnRightOfPrevCard ||
              shouldInsertLineOnLeftOfNextCard;

            return (
              <div key={'card-div-' + card.id} style={{ position: 'relative' }}>
                {shouldInsertLineOnLeft && <div className="insert-line-left" />}
                <CardWrapper
                  key={'card-wrapper-' + card.id}
                  isDragging={isDragging}
                  isActive={activeCardId === card.id}
                  isHovered={isHovered}
                  isSelected={selectedCardsIds.includes(card.id)}
                >
                  <Card
                    key={card.id}
                    id={card.id}
                    data={card}
                    selectedCards={selectedCards}
                    onMove={this.onCardMove}
                    onDragStart={this.onCardDragStart}
                    onDragComplete={this.onCardDragComplete}
                    onSelectionChange={this.onCardSelectionChange}
                    ref={ref => {
                      this.fid2Img[card.id] = ref;
                    }}
                  />
                  <div className={styles.pager}>
                    ({i + 1}/{total})
                  </div>
                </CardWrapper>
                {shouldInsertLineOnRight && <div className="insert-line-right" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

Container.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.string,
  reorder: PropTypes.func,
  onClick: PropTypes.func,
};

export default DragDropContext(HTML5Backend)(Container);
