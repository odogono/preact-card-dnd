import { Component } from "preact";
import { mapPosition } from "./card";
import rafSchedule from "raf-schd";
import {
  addClass,
  createLog,
  findParentWithClass,
  removeClass,
  updateTransform,
  valueInRange
} from "./util";
import { emitter } from "./events";

const log = createLog("withDragAndDrop", false);

const INTERSECTION_FPS = 10;

export function withDragAndDrop(WrappedComponent, options = {}) {
  let { dropTargetClass, parentContainerClass } = options;

  return class extends Component {
    onMouseDown = evt => {
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);

      // log("onMouseDown", "props are", this.props);

      const box = this.base.getBoundingClientRect();
      const { pageX, pageY } = evt;

      // capture the point at which we touched
      this.offX = pageX - box.x;
      this.offY = pageY - box.y;

      this.relX = pageX - this.offX;
      this.relY = pageY - this.offY;

      this.dragPosition = [this.relX, this.relY];

      // this.scheduleUpdateTransform(this.base, this.relX, this.relY);

      evt.preventDefault();

      // determine the element we return to, and also viable drop targets
      let { homeElement, dropTargets } = initialiseDropTargets(
        this.base,
        parentContainerClass,
        dropTargetClass
      );

      this.homeElement = homeElement;

      log("onMouseDown", "home is", homeElement.id, homeElement);

      this.cancelIntersectionCheck = runIntersectionCheck(
        this.base,
        dropTargets,
        this
      ).cancel;
    };

    onMouseUp = evt => {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);

      cancelAnimationFrame(this.cancelIntersectionCheck());

      const target = this.intersection || this.homeElement;

      let payload = {
        position: this.dragPosition,
        target,
        sourceId: this.base.id,
        targetId: target.id
      };

      log("onMouseUp", payload);

      emitter.emit("/dnd/end", payload);
    };

    onMouseMove = evt => {
      const { pageX, pageY } = evt;
      let tx = pageX - this.offX;
      let ty = pageY - this.offY;

      this.dragPosition = [tx, ty];
      this.scheduleUpdateTransform(this.base, tx, ty);
    };

    componentDidMount() {
      // rafSchedule throttles calls to updateTransform
      this.scheduleUpdateTransform = rafSchedule(updateTransform);
    }

    componentWillUnmount() {
      this.scheduleUpdateTransform.cancel();
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

/**
 * Begins a rAF based loop to check for intersections between the
 * dragElement and the specified dropElements
 *
 * @param {Object} dragElement - the element being dragged
 * @param {Object} dropElements
 * @param {Object} dndObj - object which contains a reference to the current position
 */
function runIntersectionCheck(dragElement, dropElements, dndObj) {
  let frameId = 0;
  let then = performance.now();
  const interval = 1000 / INTERSECTION_FPS;
  const tolerance = 0.1;
  let intersectingElement;

  log("runIntersectionCheck", dragElement);

  const loop = now => {
    frameId = requestAnimationFrame(loop);
    const delta = now - then;

    if (delta < interval - tolerance) {
      return;
    }

    then = now - delta % interval;

    let newIntersectingElement = findIntersecting(
      dragElement,
      dropElements,
      dndObj.dragPosition
    );

    // deal with previous intersection
    if (intersectingElement) {
      if (!newIntersectingElement) {
        emitter.emit("/dnd/leave", dragElement, intersectingElement);
        removeClass(intersectingElement, "highlight");
        dndObj.intersection = intersectingElement = null;
      } else if (intersectingElement === newIntersectingElement) {
        // still intersecting with the same element
        return;
      }
    }

    // TODO: replace this with a event dispatch
    if (newIntersectingElement) {
      dndObj.intersection = intersectingElement = newIntersectingElement;
      emitter.emit("/dnd/enter", dragElement, intersectingElement);
      addClass(intersectingElement, "highlight");
    }
  };

  const cancel = () => {
    removeClass(intersectingElement, "highlight");
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  frameId = requestAnimationFrame(loop);

  return { frameId, cancel };
}

/**
 * Determines which is our 'home' element and which are the targets we
 * are interested in dropping to
 *
 * @returns {Object}
 */
function initialiseDropTargets(element, parentClass, dropClass) {
  // find the parent which contains our drop targets
  const parent = findParentWithClass(element, parentClass);

  // log("initialiseDropTargets", parent);
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
 * @param {Object} element -
 * @param {Object[]} candidates - an array of elements to intersect against
 * @param {Object} position - an override for the elements position
 * @return {Object} - the 'candidates' element that intersects 'element'
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

function getBoundClientRectFromAttribute(element) {
  // let attr = element.getAttribute("boundingClientRect");
  // let result = attr.split(",").map(n => parseFloat(n));
  // log(
  //   "getBoundClientRectFromAttribute",
  //   result,
  //   element.getBoundingClientRect()
  // );
  // return result;
  let { x, y, width, height } = element.getBoundingClientRect();
  return [x, y, width, height];
}
