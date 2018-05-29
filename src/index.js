import "./style";
import { Component, render } from "preact";
import { Card } from "./card";
import Placeholder from "./placeholder";
import { CardTable } from "./card_table";
import { emitter } from "./events";
import { arrayToMap, createLog, isPositionValid, POSITION_NULL } from "./util";
import { withDragAndDrop } from "./with_dnd";

const log = createLog("App", true);

const DnDCard = withDragAndDrop(Card, {
  parentContainerClass: "card-table",
  dropTargetClass: "placeholder"
});

log(">--");

export default class App extends Component {
  /**
   *
   */
  _onCardTableMouseDown = evt => {
    // const box = evt.target.getBoundingClientRect();
    // let cursor = [evt.pageX - box.left, evt.pageY - box.top];
  };

  /**
   *
   */
  _onPlaceholderClick = (phId, evt) => {
    log("_onPlaceholderClick", phId);
  };

  /**
   *
   */
  _onCardDragEnd = ({ position, sourceId, targetId }) => {
    // given the final position of the card, plus the target to which it should return

    // let { placeholders } = this.state;
    // let placeholder = placeholders[targetId];

    this._updateCard(sourceId, {
      placeholder: targetId,
      // this is the 'from'
      transitionPosition: position
      // ... and this is the 'to' - which we don't need to set, because in the abscence of
      // a valid position, the placeholder position is used
      // position: placeholder.boundingClientRect
    });
  };

  _onCardTransitionEnd = (cardId, card) => {
    log("_onCardTransitionEnd", "card", cardId);

    this._updateCard(cardId, {
      position: POSITION_NULL,
      transitionPosition: POSITION_NULL
    });
  };

  _updateCard = (cardId, values) => {
    let { cards } = this.state;
    let card = cards[cardId];

    let update = { ...card, ...values };

    this.setState({ cards: { ...cards, [cardId]: update } });
  };

  /**
   *
   */
  _updateCardTable = cardTable => {
    this.cardTableRect = cardTable.boundingClientRect;
  };

  /**
   *
   */
  _updatePlaceholder = (placeholder, boundingClientRect) => {
    const placeholderId = placeholder.props.id;
    let { placeholders } = this.state;

    let model = placeholders[placeholderId];
    model = { ...model, boundingClientRect };
    placeholders = { ...placeholders, [placeholderId]: model };

    log("_updatePlaceholder", placeholderId, boundingClientRect);

    this.setState({ placeholders });
  };

  state = {
    cards: arrayToMap([
      { id: "c1", placeholder: "ph2", position: POSITION_NULL }
    ]),
    placeholders: arrayToMap([{ id: "ph1" }, { id: "ph2" }, { id: "ph3" }])
  };

  constructor(props) {
    super(props);

    log("constructor", "state", this.state);
  }

  /**
   *
   */
  componentDidMount() {
    emitter.on("/dnd/end", this._onCardDragEnd);

    emitter.on("/dnd/enter", element => {
      log("/dnd/enter", element.id);
    });

    emitter.on("/dnd/leave", element => {
      log("/dnd/leave", element.id);
    });
  }

  /**
   *
   */
  componentWillUnmount() {
    emitter.off("/dnd/enter");
    emitter.off("/dnd/leave");
    emitter.off("/dnd/end");
  }

  /**
   *
   */
  render(props) {
    const { placeholders } = this.state;
    let cardElements = this._renderCards();

    let placeholderElements = Object.values(placeholders).map(ph => {
      let phProps = {
        ...ph,
        onClick: this._onPlaceholderClick,
        // listen to changes in position/dimensions - mostly down to the window resizing
        onBoundingClientRectUpdate: this._updatePlaceholder
      };
      return <Placeholder {...phProps} />;
    });

    // we don't use ref on the placeholders to obtain the clientRect, as it
    // returns before it is able to obtain said clientRect.

    return (
      <div>
        <h1>Card DND</h1>
        <CardTable
          onMouseDown={this._onCardTableMouseDown}
          onBoundingClientRectUpdate={this._updateCardTable}
        >
          {cardElements}
          {placeholderElements}
        </CardTable>
      </div>
    );
  }

  _renderCards() {
    const { cards, placeholders } = this.state;

    return Object.values(cards).map(c => {
      let placeholder = placeholders[c.placeholder];
      if (!placeholder || !placeholder.boundingClientRect) {
        return null;
      }

      let position = c.position;

      if (!isPositionValid(position)) {
        position = placeholder.boundingClientRect;
      }

      let cardProps = {
        ...c,
        position,
        onTransitionEnd: this._onCardTransitionEnd
      };

      // let position = placeholder.boundingClientRect;
      // log("_renderCards", "rendering to", c.id, c);
      return <DnDCard {...cardProps} />;
    });
  }
}

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
