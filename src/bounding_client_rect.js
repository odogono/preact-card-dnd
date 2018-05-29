import { Component } from "preact";
import { createLog } from "./util";

const log = createLog("BoundingClientRectComponent");

export function withBoundingClientRect(WrappedComponent) {
  return class extends Component {
    _updateDimensions = () => {
      // getBoundingClientRect does not take margin or borders into account
      // in other words, it uses the 'content-box'
      // in order to get a true value, use box-sizing: border-box on
      // elements
      let { x, y, width, height } = this.base.getBoundingClientRect();
      // sometimes invalid dimensions will get passed through
      if (x === 0 && y === 0 && width === 0 && height === 0) {
        return;
      }

      let boundingClientRect = [x, y, width, height];

      this.setState({ boundingClientRect });

      if (this.props.onBoundingClientRectUpdate) {
        this.props.onBoundingClientRectUpdate(this, boundingClientRect);
      }
    };

    componentDidMount() {
      window.addEventListener("resize", this._updateDimensions);
      this._updateDimensions();
    }

    componentWillUnmount() {
      window.removeEventListener("resize", this._updateDimensions);
    }

    render() {
      // in certain circumstances, for example when a child is positioned absolutely
      // the wrapping span ref will not return the correct dimensions.
      // we use the refCallback rather than the ref on a wrapped span so that
      // the child component can choose which element is dimensioned.

      // console.log("[BoundingClientRectComponent]", "[render]");
      return (
        <WrappedComponent {...this.props} {...this.state}>
          {this.props.children}
        </WrappedComponent>
      );
    }
  };
}
