"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElement = createElement;
exports.getPixelRatio = getPixelRatio;
exports.createNormalizationFunction = createNormalizationFunction;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Sigma.js Rendering Utils
 * ===========================
 *
 * Helpers used by most renderers.
 */

/**
 * Function used to create DOM elements easily.
 *
 * @param  {string} tag        - Tag name of the element to create.
 * @param  {object} attributes - Attributes map.
 * @return {HTMLElement}
 */
function createElement(tag, attributes) {
  var element = document.createElement(tag);
  if (!attributes) return element;

  for (var k in attributes) {
    if (k === 'style') {
      for (var s in attributes[k]) {
        element.style[s] = attributes[k][s];
      }
    } else {
      element.setAttribute(k, attributes[k]);
    }
  }

  return element;
}
/**
 * Function returning the browser's pixel ratio.
 *
 * @return {number}
 */


function getPixelRatio() {
  var screen = window.screen;
  if (typeof screen.deviceXDPI !== 'undefined' && typeof screen.logicalXDPI !== 'undefined' && screen.deviceXDPI > screen.logicalXDPI) return screen.systemXDPI / screen.logicalXDPI;else if (typeof window.devicePixelRatio !== 'undefined') return window.devicePixelRatio;
  return 1;
}
/**
 * Factory returning a function normalizing the given node's position & size.
 *
 * @param  {object}   extent  - Extent of the graph.
 * @return {function}
 */


function createNormalizationFunction(extent) {
  var _extent$x = _slicedToArray(extent.x, 2),
      minX = _extent$x[0],
      maxX = _extent$x[1],
      _extent$y = _slicedToArray(extent.y, 2),
      minY = _extent$y[0],
      maxY = _extent$y[1];

  var fn;
  var ratio = Math.max(maxX - minX, maxY - minY);
  if (ratio === 0) ratio = 1;
  var dX = (maxX + minX) / 2,
      dY = (maxY + minY) / 2;

  fn = function fn(data) {
    return {
      x: 0.5 + (data.x - dX) / ratio,
      y: 0.5 + (data.y - dY) / ratio
    };
  }; // TODO: possibility to apply this in batch over array of indices


  fn.applyTo = function (data) {
    data.x = 0.5 + (data.x - dX) / ratio;
    data.y = 0.5 + (data.y - dY) / ratio;
  };

  fn.inverse = function (data) {
    return {
      x: dX + ratio * (data.x - 0.5),
      y: dY + ratio * (data.y - 0.5)
    };
  };

  fn.ratio = ratio;
  return fn;
}