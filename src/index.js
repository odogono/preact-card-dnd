import "./style";
import { Component, render } from "preact";
import { Card } from "./card";
import Placeholder from "./placeholder";
import { CardTable } from "./card_table";

import { withDragAndDrop } from "./with_dnd";

const DnDCard = withDragAndDrop(Card, {
  parentContainerClass: "card-table",
  dropTargetClass: "placeholder"
});

console.log(">--");

export default class App extends Component {
  _onCardTableMouseDown = evt => {
    const box = evt.target.getBoundingClientRect();
    let cursor = [evt.pageX - box.left, evt.pageY - box.top];

    // console.log("OCTMD", cursor, evt);
    // this.setState({ cursor });
  };

  constructor() {
    super();
    this._updatePlaceholder = this._updatePlaceholder.bind(this);
    this._updateCardTable = this._updateCardTable.bind(this);
    this._onPlaceholderClick = this._onPlaceholderClick.bind(this);

    this.state = {
      cursor: [0, 0],
      cards: [{ id: "c1", placeholder: "ph2" }],
      placeholders: [{ id: "ph1" }, { id: "ph2" }, { id: "ph3" }],
      placeholderRefs: {}
    };
  }

  _onPlaceholderClick(phId, evt) {
    console.log("[App][_onPlaceholderClick]", phId);
  }

  _updateCardTable(cardTable) {
    this.cardTableRect = cardTable.boundingClientRect;
  }

  _updatePlaceholder(placeholder) {
    let placeholderRefs = this.state.placeholderRefs;
    placeholderRefs[placeholder.props.id] = placeholder;
    this.setState({ placeholderRefs });
  }

  render(props) {
    let cards = this._renderCards();
    let placeholders = this.state.placeholders.map(ph => {
      let phProps = {
        ...ph,
        onClick: this._onPlaceholderClick,
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
          {cards}
          {placeholders}
        </CardTable>
      </div>
    );
  }

  _renderCards() {
    // console.log("[App][_renderCards]", "placeholders", this.placeholders);
    return this.state.cards.map(c => {
      let placeholder = this.state.placeholderRefs[c.placeholder];
      if (!placeholder || !placeholder.boundingClientRect) {
        return null;
      }

      let [x, y] = placeholder.boundingClientRect;
      return <DnDCard position={[x, y]} {...c} />;
    });
  }
}

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
