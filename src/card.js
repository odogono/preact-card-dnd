import { Component } from "preact";
import { withBoundingClientRect } from "./bounding_client_rect";

export const CARD_WIDTH = 90;
export const CARD_HEIGHT = 125;
export const CARD_HALF_WIDTH = CARD_WIDTH / 2;
export const CARD_HALF_HEIGHT = CARD_HEIGHT / 2;

class CardComponent extends Component {
  componentDidUpdate(previousProps) {}

  render() {
    const { onClick } = this.props;

    const scale = this.props.scale || 1.0;
    // let position = this.props.position || [0, 0];

    const width = CARD_WIDTH * scale;
    const height = CARD_HEIGHT * scale;

    // // to ensure the origin is around the center
    // position[0] = position[0] - width / 2 + CARD_HALF_WIDTH;
    // position[1] = position[1] - height / 2 + CARD_HALF_HEIGHT;

    let position = _mapPosition(this.props.position, this.props.scale);

    // console.log("[Card][render]", position);

    const style = {
      width,
      height,
      left: 0,
      top: 0,
      WebkitTransform: `translate3d(${position[0]}px, ${position[1]}px, 0)`,
      transform: `translate3d(${position[0]}px, ${position[1]}px, 0)`
    };

    const viewBox = [0, 0, 90, 125];

    return (
      <div
        {...this.props}
        className="card"
        style={{ ...style, cursor: "move" }}
        onClick={evt => (onClick ? onClick.call(onClick, this, evt) : null)}
      >
        <PureCard viewBox={viewBox} />
      </div>
    );
  }
}

class PureCard extends Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    let { viewBox } = this.props;
    viewBox = viewBox.join(" ");
    return (
      <svg viewBox={viewBox}>
        <path d="M4.156 4.693H85.15v116.275H4.155V4.693z" fill="#FFF" />
        <path d="M75.31 0H14.687C6.623 0 .227 6.535.227 14.46v96.08c0 8.064 6.535 14.46 14.46 14.46H75.31c8.065 0 14.46-6.535 14.46-14.46V14.46C89.91 6.536 83.376 0 75.31 0zm9.872 110.68c0 5.42-4.45 9.732-9.733 9.732H14.686c-5.422 0-9.733-4.45-9.733-9.733V14.46c0-5.422 4.45-9.733 9.733-9.733H75.31c5.423 0 9.733 4.45 9.733 9.734v96.22z" />
        <path
          stroke="#FEFEFE"
          d="M73.503 11.402H16.495c-2.92 0-5.423 2.363-5.423 5.422v91.77c0 2.92 2.364 5.422 5.423 5.422h57.008c2.92 0 5.422-2.364 5.422-5.423V16.685c-.14-2.92-2.502-5.283-5.422-5.283zm-57.008 1.25h57.008c.973 0 1.807.28 2.503.974L72.67 18.77l-3.895-6.117h-1.53l4.728 7.23-6.118 9.455-6.117-9.455 4.727-7.23h-1.53l-3.893 6.118-3.893-6.117h-1.53l4.727 7.23-6.118 9.455-6.12-9.455 4.73-7.23h-1.53l-3.894 6.118-4.588-6.117h-1.53l4.728 7.23-6.118 9.455-6.118-9.455 4.727-7.23h-1.53l-3.892 6.118-4.172-6.117h-1.53l4.728 7.23-6.117 9.455-6.118-9.455 4.728-7.23h-1.53L17.19 18.77l-3.198-5.005c.417-.695 1.39-1.112 2.503-1.112zm20.578 60.763l-6.117 9.455-6.118-9.455 6.118-9.455 6.117 9.455zM24.7 52.002l6.116-9.455 6.118 9.455-6.118 9.455-6.117-9.455zm6.95 10.707l6.12-9.456 6.117 9.455-5.98 9.593-6.256-9.594zM38.604 52l6.118-9.455 6.12 9.455-6.12 9.455-6.117-9.455zM44.86 63.96l6.118 9.455-6.118 9.455-6.118-9.455 6.118-9.455zm.695-1.25l6.118-9.456 6.118 9.455-5.978 9.593-6.257-9.594zm13.21 1.25l6.117 9.455-6.118 9.455-6.118-9.455 6.118-9.455zm-6.258-11.958l6.118-9.455 6.118 9.455-6.118 9.455-6.118-9.455zm0-21.412l6.118-9.455 6.118 9.455-6.118 9.454-6.118-9.454zm5.423 10.706l-6.118 9.455-6.118-9.454 6.118-9.455 6.118 9.456zm-13.07-1.112l-6.257-9.594 6.118-9.455 6.12 9.455-5.98 9.594zm-.834 1.112l-6.118 9.455-6.118-9.454 6.118-9.455 6.118 9.456zm-13.07-1.112L24.7 30.59l6.116-9.455 6.118 9.455-5.978 9.594zm-.835 1.112l-6.117 9.455-6.118-9.454 6.118-9.455 6.118 9.456zm0 21.413l-6.117 9.593-6.118-9.455 6.118-9.455 6.118 9.316zm0 21.41l-6.117 9.456-6.118-9.455 6.118-9.454 6.118 9.455zm.836 1.253l6.117 9.455-6.117 9.455-6.118-9.455 6.118-9.455zm.695-1.252l6.12-9.454 6.117 9.455-6.118 9.456-6.12-9.455zm13.21 1.253l6.118 9.455-6.118 9.455-6.118-9.455 6.118-9.455zm.695-1.252l6.118-9.454 6.118 9.455-6.117 9.456-6.118-9.455zm13.21 1.253l6.117 9.455-6.118 9.455-6.118-9.455 6.118-9.455zm.694-1.252l6.117-9.454 6.118 9.455-6.118 9.456-6.118-9.455zm0-21.41l6.117-9.456 6.118 9.455-5.98 9.593-6.256-9.594zm0-21.414l6.117-9.455 6.118 9.456-6.118 9.455-6.118-9.454zm-46.997-24.61c0-.696.14-1.252.417-1.808l3.337 5.144-3.754 5.7v-9.037zm0 11.4l4.588-6.95 6.12 9.454-6.12 9.454-4.587-6.952v-5.005zm0 7.51l3.754 5.7-3.754 5.7v-11.4zm0 13.903l4.588-6.953 6.12 9.455-6.12 9.455-4.587-6.952V49.5zm0 7.508l3.754 5.7-3.754 5.7v-11.4zm0 13.904l4.588-6.952 6.12 9.455-6.12 9.455-4.587-6.952v-5.006zm0 7.508l3.754 5.7-3.754 5.702V78.42zm0 13.905l4.588-6.952 6.12 9.455-6.12 9.455-4.587-6.953v-5.005zm0 16.13v-8.622l3.754 5.7-3.198 5.006c-.418-.696-.557-1.39-.557-2.086zm4.032 4.03c-.973 0-1.947-.416-2.642-.972l3.06-4.728 3.753 5.7h-4.17zm5.7 0l-4.45-6.95 6.12-9.456 6.117 9.454-4.45 6.952h-3.336zm5.006 0l3.756-5.7 3.754 5.7H27.2zm9.04 0l-4.45-6.95 6.118-9.456 6.118 9.454-4.45 6.952H36.24zm4.866 0l3.754-5.7 3.754 5.7h-7.508zm9.038 0l-4.45-6.95 6.118-9.456 6.118 9.454-4.45 6.952h-3.336zm4.866 0l3.754-5.7 3.754 5.7H55.01zm9.038 0l-4.45-6.95 6.118-9.456 6.118 9.454-4.45 6.952H64.05zm9.455 0h-4.59l3.756-5.7 3.197 4.867c-.696.556-1.53.834-2.364.834zm4.032-4.03c0 .833-.278 1.667-.695 2.363l-3.337-5.145 4.032-6.257v9.038zm0-11.542l-4.866 7.51-6.12-9.456 6.12-9.455 4.865 7.508v3.893zm0-6.396l-4.032-6.257 4.032-6.257v12.514zm0-15.016l-4.866 7.51-6.12-9.456 6.12-9.455 4.865 7.507V75.5zm0-6.395l-4.032-6.257 4.032-6.257v12.515zm0-15.017l-4.866 7.508-6.12-9.455 6.12-9.454 4.865 7.51v3.892zm0-6.396l-4.032-6.257 4.032-6.257v12.514zm0-15.017l-4.866 7.51-6.12-9.595 6.12-9.455 4.865 7.508v4.032zm0-6.396l-4.032-6.258L76.98 14.6c.416.556.555 1.39.555 2.085v9.594z"
        />
      </svg>
    );
  }
}

function _mapPosition(pos = [0, 0], scale = 1.0) {
  const width = CARD_WIDTH * scale;
  const height = CARD_HEIGHT * scale;

  return [
    pos[0] - width / 2 + CARD_HALF_WIDTH,
    pos[1] - height / 2 + CARD_HALF_HEIGHT
  ];
}

export const Card = withBoundingClientRect(CardComponent);
