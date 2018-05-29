import { Component, PureComponent } from "preact";
import { emitter } from "./events";
import { Card } from "./card";
import Placeholder from "./placeholder";
import { withBoundingClientRect } from "./bounding_client_rect";
import { arrayToMap, createLog, isPositionValid, POSITION_NULL } from "./util";
import { withDragAndDrop } from "./with_dnd";

const log = createLog("CardTable", true);

const DnDCard = withDragAndDrop(Card, {
  parentContainerClass: "card-table",
  dropTargetClass: "placeholder"
});

class CardTableComponent extends Component {
  /**
   *
   */
  _onCardDragEnd = ({ position, sourceId, targetId }) => {
    // given the final position of the card, plus the target to which it should return

    emitter.emit("/card/update", sourceId, {
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

    emitter.emit("/card/update", cardId, {
      position: POSITION_NULL,
      transitionPosition: POSITION_NULL
    });
  };

  /**
   *
   */
  _updatePlaceholder = (placeholder, boundingClientRect) => {
    const placeholderId = placeholder.props.id;

    let { placeholders } = this.state;
    let existing = placeholders[placeholderId];

    let update = { ...existing, boundingClientRect };
    log("_updatePlaceholder", "updating", placeholderId, update);

    this.setState({
      placeholders: { ...placeholders, [placeholderId]: update }
    });
  };

  /**
   *
   */
  _onPlaceholderClick = (phId, evt) => {
    log("_onPlaceholderClick", phId);
  };

  constructor(props) {
    super(props);

    // build state from incoming props
    this.state = { placeholders: arrayToMap(this.props.placeholders) };
  }

  /**
   *
   */
  _renderCards() {
    const { cards } = this.props;
    const { placeholders } = this.state;

    return Object.values(cards).map(c => {
      let placeholder = placeholders[c.placeholder];
      if (!placeholder || !placeholder.boundingClientRect) {
        log(
          "_renderCards",
          "no placeholder for",
          c.id,
          c.placeholder,
          placeholders
        );
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
      log("_renderCards", "rendering to", c.id, c);
      return <DnDCard {...cardProps} />;
    });
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

  render(props) {
    const { placeholders } = this.props;
    let cardElements = this._renderCards();
    log("render", this.props);

    let placeholderElements = Object.values(placeholders).map(ph => {
      let phProps = {
        ...ph,
        onClick: this._onPlaceholderClick,
        // listen to changes in position/dimensions - mostly down to the window resizing
        onBoundingClientRectUpdate: this._updatePlaceholder
      };
      return <Placeholder {...phProps} />;
    });

    return (
      <div class="card-table" onMouseDown={this.onMouseDown}>
        {cardElements}
        {placeholderElements}
      </div>
    );
  }
}

export const CardTable = withBoundingClientRect(CardTableComponent);
