import { Component } from "preact";
import { mapPosition } from "./card";
import rafSchedule from "raf-schd";

const INTERSECTION_FPS = 10;

export function withDragAndDrop(WrappedComponent, options = {}) {
  let { dropTargetClass, parentContainerClass } = options;

  return class extends Component {
    onMouseDown = evt => {
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);

      log("onMouseDown", "props are", this.props);

      const box = this.base.getBoundingClientRect();
      const parentRect = this.base.parentNode.getBoundingClientRect();
      const { pageX, pageY } = evt;

      // capture the point at which we touched
      this.offX = pageX - box.x;
      this.offY = pageY - box.y;
      let parentX = 0; //parentRect.left - 3;
      let parentY = 0; //parentRect.top - 3;

      this.relX = pageX - parentX - this.offX;
      this.relY = pageY - parentY - this.offY;

      this.dragPosition = [this.relX, this.relY];

      this.scheduleUpdate(this.base, this.relX, this.relY);
      evt.preventDefault();

      let { homeElement, dropTargets } = initialiseDropTargets(
        this.base,
        parentContainerClass,
        dropTargetClass
      );

      this.cancelIntersectionCheck = runIntersectionCheck(
        this.base,
        dropTargets,
        this
      ).cancel;
    };

    onMouseUp = evt => {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);

      console.log(
        "onMouseDown",
        "cancelling intersection check"
        // this.intersectionCheckId
      );
      cancelAnimationFrame(this.cancelIntersectionCheck());
    };

    onMouseMove = evt => {
      const { pageX, pageY } = evt;
      const parentRect = this.base.parentNode.getBoundingClientRect();
      let parentX = 0; //parentRect.left - 3;
      let parentY = 0; //parentRect.top -3 ;
      let tx = pageX - parentX - this.offX;
      let ty = pageY - parentY - this.offY;

      // this.base.dataset.pos = [tx, ty];
      this.dragPosition = [tx, ty];
      this.scheduleUpdate(this.base, tx, ty);
    };

    constructor(props) {
      super(props);
    }

    componentDidMount() {
      this.scheduleUpdate = rafSchedule(updateNodeTransform);
    }

    componentWillUnmount() {
      this.scheduleUpdate.cancel();
    }

    render() {
      // log("render", this);
      const props = {
        onMouseDown: this.onMouseDown
      };

      return <WrappedComponent {...props} {...this.props} />;
    }
  };
}

function runIntersectionCheck(dragElement, dropElements, drag) {
  let frameId = 0;
  let then = performance.now();
  const interval = 1000 / INTERSECTION_FPS;
  const tolerance = 0.1;
  let intersectingElement;

  const loop = now => {
    frameId = requestAnimationFrame(loop);
    const delta = now - then;

    if (delta >= interval - tolerance) {
      then = now - delta % interval;

      if (intersectingElement) {
        removeClass(intersectingElement, "highlight");
      }

      intersectingElement = findIntersecting(
        dragElement,
        dropElements,
        drag.dragPosition
      );

      if (intersectingElement) {
        addClass(intersectingElement, "highlight");
        console.log(
          "runIntersectionCheck",
          drag.dragPosition,
          // dragElement,
          intersectingElement
        );
      }
    }
  };

  const cancel = () => {
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  frameId = requestAnimationFrame(loop);

  return { frameId, cancel };
}

/**
 * Determines which is our 'home' element and which are the targets we
 * are interested in dropping to
 */
function initialiseDropTargets(element, parentClass, dropClass) {
  // find the parent which contains our drop targets
  const parent = findParentWithClass(element, parentClass);
  log("initialiseDropTargets", parent);
  // determine where the drop targets are
  const dropElements = parent.getElementsByClassName(dropClass);

  // determine which of those dropTargets we already intersect - this
  // becomes our 'home' to which we return when the drop is cancelled
  let homeElement = findIntersecting(element, dropElements);

  // set our targets as everything except the home - this also
  // converts the HTMLElement array into a regular array
  let dropTargets = Array.prototype.filter.call(
    dropElements,
    t => t !== homeElement
  );

  return { homeElement, dropTargets };
}

/**
 *
 */
function findIntersecting(element, candidates, position) {
  let elRect = getBoundClientRectFromAttribute(element);
  if (position) {
    elRect[0] = position[0];
    elRect[1] = position[1];
  }

  let intersections = Array.prototype.reduce.call(
    candidates,
    (result, ca) => {
      let rect = getBoundClientRectFromAttribute(ca);

      if (doesOverlap(elRect, rect)) {
        // log(
        //   "findIntersecting",
        //   "overlap",
        //   elRect,
        //   rect,
        //   doesOverlap(elRect, rect, true)
        // );
        result.push(ca);
      }
      return result;
    },
    []
  );

  return intersections.length ? intersections[0] : null;
}

/**
 * https://stackoverflow.com/a/306379
 */
function doesOverlap(rectA, rectB, debug = false) {
  const aLeft = rectA[0];
  const bLeft = rectB[0];
  const aRight = aLeft + rectA[2];
  const bRight = bLeft + rectB[2];
  const aTop = rectA[1];
  const bTop = rectB[1];
  const aBottom = aTop + rectA[3];
  const bBottom = bTop + rectB[3];

  const xOverlap =
    valueInRange(aLeft, bLeft, bRight) || valueInRange(bLeft, aLeft, aRight);

  const yOverlap =
    valueInRange(aTop, bTop, bBottom) || valueInRange(bTop, aTop, aBottom);

  if (debug) log("doesOverlap", { xOverlap, yOverlap });
  return xOverlap && yOverlap;
}

function valueInRange(value, min, max) {
  return value >= min && value <= max;
}

function getBoundClientRectFromAttribute(element) {
  let attr = element.getAttribute("boundingClientRect");
  return attr.split(",").map(n => parseFloat(n));
}

/**
 * https://stackoverflow.com/a/22119674/2377677
 */
function findParentWithClass(element, parentClass) {
  while (
    (element = element.parentElement) &&
    !element.classList.contains(parentClass)
  );
  return element;
}

function updateNodeTransform(node, x, y) {
  node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function addClass(element, className) {
  element.classList.add(className);
}

function removeClass(element, className) {
  element.classList.remove(className);
}

function log(tag, ...args) {
  console.log(`[withDragAndDrop][${tag}]`, ...args);
}
