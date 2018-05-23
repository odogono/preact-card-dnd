import { Component, PureComponent } from "preact";
import { connect } from "unistore/preact";
import { actions } from "./state";
import { withBoundingClientRect } from "./bounding_client_rect";

class CardTableComponent extends Component {
  onMouseDown = evt => {
    if (this.props.onMouseDown) {
      this.props.onMouseDown(evt);
    }
    evt.preventDefault();
    let { x, y, width, height } = this.base.getBoundingClientRect();
    const body = document.body;
    const box = this.base.getBoundingClientRect();
    const parentRect = this.base.parentNode.getBoundingClientRect();

    this.relX = evt.pageX - box.left;
    this.relY = evt.pageY - box.top;

    // console.log(
    //   "[CardTable][onMouseDown]",
    //   { x, y, width, height },
    //   this.relX,
    //   this.relY
    // );
  };

  render(props) {
    return (
      <div class="card-table" onMouseDown={this.onMouseDown}>
        {props.children}
      </div>
    );
  }
}

export const CardTable = connect(["tableDims", "isVisible"], actions)(
  withBoundingClientRect(CardTableComponent)
);
