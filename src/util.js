export function createLog(subject, isEnabled = true) {
  if (!isEnabled) {
    return () => null;
  }
  return (tag, ...args) => console.log(`[${subject}][${tag}]`, ...args);
}

export const POSITION_NULL = [-100, -100];

/**
 * Returns true if the given position is valid
 */
export function isPositionValid(pos) {
  if (pos === undefined || pos === POSITION_NULL) {
    return false;
  }
  const [x, y] = pos;
  if (x === 0 && y === 0) {
    return false;
  }
  return true;
}

/**
 * Sets the translate3d style transform property
 *
 * @param {HTMLElement} element
 * @param {number} x
 * @param {number} y
 */
export function updateTransform(element, x, y) {
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/**
 * Returns true if a given number is within the range of min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function valueInRange(value, min, max) {
  return value >= min && value <= max;
}

function getBoundClientRectFromAttribute(element) {
  let attr = element.getAttribute("boundingClientRect");
  return attr.split(",").map(n => parseFloat(n));
}

/**
 * https://stackoverflow.com/a/22119674/2377677
 */
export function findParentWithClass(element, parentClass) {
  while (
    (element = element.parentElement) &&
    !element.classList.contains(parentClass)
  );
  return element;
}

/**
 * Removes a CSS class from an element
 * @param {HTMLElement} element
 * @param {string} className
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Removes a CSS class from an element
 * @param {HTMLElement} element
 * @param {string} className
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Converts an array of objects to a map, using the objects
 * key property as the results key
 * @param {[]} array
 * @param {string} key
 * @return {Object} - the converted object
 */
export function arrayToMap(array = [], key = "id") {
  return array.reduce((result, item) => {
    result[item[key]] = item;
    return result;
  }, {});
}
