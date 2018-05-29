import "./style";
import { Component, render } from "preact";

import { CardTable } from "./card_table";
import { emitter } from "./events";
import { arrayToMap, createLog, isPositionValid, POSITION_NULL } from "./util";
import { withDragAndDrop } from "./with_dnd";

const log = createLog("App", true);

log(">--");

export default class App extends Component {
  _onCardUpdate = (cardId, state) => {
    let { cards } = this.state;
    let card = cards[cardId];

    let update = { ...card, ...state };

    this.setState({ cards: { ...cards, [cardId]: update } });
  };

  state = {
    cards: arrayToMap([{ id: "c1", placeholder: "ph2" }]),
    placeholders: [{ id: "ph1" }, { id: "ph2" }, { id: "ph3" }]
  };

  /**
   *
   */
  componentDidMount() {
    emitter.on("/card/update", this._onCardUpdate);
  }

  /**
   *
   */
  componentWillUnmount() {
    emitter.off("/card/update", this._onCardUpdate);
  }

  /**
   *
   */
  render(props) {
    // we don't use ref on the placeholders to obtain the clientRect, as it
    // returns before it is able to obtain said clientRect.

    return (
      <div>
        <h1>Card DND</h1>
        <CardTable
          cards={this.state.cards}
          placeholders={this.state.placeholders}
        />
      </div>
    );
  }
}

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
