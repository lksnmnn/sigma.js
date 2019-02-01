"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.labelsToDisplayFromGrid = labelsToDisplayFromGrid;

var _camera = _interopRequireDefault(require("../camera"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sigma.js Labels Heuristics
 * ===========================
 *
 * Miscelleneous heuristics related to label display.
 */

/**
 * Constants.
 */
// Dimensions of a normal cell
var DEFAULT_CELL = {
  width: 250,
  height: 175
}; // Dimensions of an unzoomed cell. This one is usually larger than the normal
// one to account for the fact that labels will more likely collide.

var DEFAULT_UNZOOMED_CELL = {
  width: 400,
  height: 300
};
/**
 * Helpers.
 */

function collision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
} // TODO: cache camera position of selected nodes to avoid costly computations
// in anti-collision step
// TODO: minSize to be displayed
// TOOD: document a little bit more so future people can understand this mess

/**
 * Label grid heuristic selecting labels to display.
 *
 * @param  {object} params                 - Parameters:
 * @param  {object}   cache                - Cache storing nodes' data.
 * @param  {Camera}   camera               - The renderer's camera.
 * @param  {Set}      displayedLabels      - Currently displayed labels.
 * @param  {Array}    visibleNodes         - Nodes visible for this render.
 * @param  {Graph}    graph                - The rendered graph.
 * @return {Array}                         - The selected labels.
 */


function labelsToDisplayFromGrid(params) {
  var cache = params.cache,
      camera = params.camera,
      displayedLabels = params.displayedLabels,
      visibleNodes = params.visibleNodes,
      dimensions = params.dimensions,
      graph = params.graph;
  var cameraState = camera.getState(),
      previousCameraState = camera.getPreviousState();
  var previousCamera = new _camera.default();
  previousCamera.setState(previousCameraState); // Camera hasn't moved?

  var still = cameraState.x === previousCameraState.x && cameraState.y === previousCameraState.y && cameraState.ratio === previousCameraState.ratio; // State

  var zooming = cameraState.ratio < previousCameraState.ratio,
      panning = cameraState.x !== previousCameraState.x || cameraState.y !== previousCameraState.y,
      unzooming = cameraState.ratio > previousCameraState.ratio,
      unzoomedPanning = !zooming && !unzooming && cameraState.ratio >= 1,
      zoomedPanning = panning && displayedLabels.size && !zooming && !unzooming; // Trick to discretize unzooming

  if (unzooming && Math.trunc(cameraState.ratio * 100) % 5 !== 0) return Array.from(displayedLabels); // If panning while unzoomed, we shouldn't change label selection

  if ((unzoomedPanning || still) && displayedLabels.size !== 0) return Array.from(displayedLabels); // When unzoomed & zooming

  if (zooming && cameraState.ratio >= 1) return Array.from(displayedLabels); // Adapting cell dimensions

  var cell = cameraState.ratio >= 1.3 ? DEFAULT_UNZOOMED_CELL : DEFAULT_CELL;
  var cwr = dimensions.width % cell.width;
  var cellWidth = cell.width + cwr / Math.floor(dimensions.width / cell.width);
  var chr = dimensions.height % cell.height;
  var cellHeight = cell.height + chr / Math.floor(dimensions.height / cell.height);
  var adjustedWidth = dimensions.width + cellWidth,
      adjustedHeight = dimensions.height + cellHeight,
      adjustedX = -cellWidth,
      adjustedY = -cellHeight;
  var panningWidth = dimensions.width + cellWidth / 2,
      panningHeight = dimensions.height + cellHeight / 2,
      panningX = -(cellWidth / 2),
      panningY = -(cellHeight / 2); // console.log(cellWidth, cellHeight, dimensions.width / cellWidth, dimensions.height / cellHeight);

  var worthyLabels = [];
  var grid = {};
  var maxSize = -Infinity,
      biggestNode = null;

  for (var i = 0, l = visibleNodes.length; i < l; i++) {
    var node = visibleNodes[i],
        nodeData = cache[node]; // Finding our node's cell in the grid

    var pos = camera.graphToViewport(dimensions, nodeData.x, nodeData.y); // Node is not actually visible on screen
    // NOTE: can optimize margin on the right side (only if we know where the labels go)

    if (pos.x < adjustedX || pos.x > adjustedWidth || pos.y < adjustedY || pos.y > adjustedHeight) continue; // Keeping track of the maximum node size for certain cases

    if (nodeData.size > maxSize) {
      maxSize = nodeData.size;
      biggestNode = node;
    } // If panning when zoomed, we consider only displayed labels and newly
    // visible nodes


    if (zoomedPanning) {
      var ppos = previousCamera.graphToViewport(dimensions, nodeData.x, nodeData.y); // Was node visible earlier?

      if (ppos.x >= panningX && ppos.x <= panningWidth && ppos.y >= panningY && ppos.y <= panningHeight) {
        // Was the label displayed?
        if (!displayedLabels.has(node)) continue;
      }
    }

    var xKey = Math.floor(pos.x / cellWidth),
        yKey = Math.floor(pos.y / cellHeight);
    var key = "".concat(xKey, "\xA7").concat(yKey);

    if (typeof grid[key] === 'undefined') {
      // This cell is not yet occupied
      grid[key] = node;
    } else {
      // We must solve a conflict in this cell
      var currentNode = grid[key],
          currentNodeData = cache[currentNode]; // We prefer already displayed labels

      if (displayedLabels.size > 0) {
        var n1 = displayedLabels.has(node),
            n2 = displayedLabels.has(currentNode);

        if (!n1 && n2) {
          continue;
        }

        if (n1 && !n2) {
          grid[key] = node;
          continue;
        }

        if ((zoomedPanning || zooming) && n1 && n2) {
          worthyLabels.push(node);
          continue;
        }
      } // In case of size & degree equality, we use the node's key so that the
      // process remains deterministic


      var won = false;

      if (nodeData.size > currentNodeData.size) {
        won = true;
      } else if (nodeData.size === currentNodeData.size) {
        var nodeDegree = graph.degree(node),
            currentNodeDegree = graph.degree(currentNode);

        if (nodeDegree > currentNodeDegree) {
          won = true;
        } else if (nodeDegree === currentNodeDegree) {
          if (node > currentNode) won = true;
        }
      }

      if (won) grid[key] = node;
    }
  } // Compiling the labels


  var biggestNodeShown = worthyLabels.some(function (node) {
    return node === biggestNode;
  });

  for (var _key in grid) {
    var _node = grid[_key];
    if (_node === biggestNode) biggestNodeShown = true;
    worthyLabels.push(_node);
  } // Always keeping biggest node shown on screen


  if (!biggestNodeShown && biggestNode) worthyLabels.push(biggestNode); // Basic anti-collision

  var collisions = new Set();

  for (var _i = 0, _l = worthyLabels.length; _i < _l; _i++) {
    var _n = worthyLabels[_i],
        d1 = cache[_n],
        p1 = camera.graphToViewport(dimensions, d1.x, d1.y);
    if (collisions.has(_n)) continue;

    for (var j = _i + 1; j < _l; j++) {
      var _n2 = worthyLabels[j],
          d2 = cache[_n2],
          p2 = camera.graphToViewport(dimensions, d2.x, d2.y);
      var c = collision(p1.x, p1.y, d1.label.length * 8, 14, p2.x, p2.y, d2.label.length * 8, 14);

      if (c) {
        // NOTE: add degree as tie-breaker here if required in the future
        if (d1.size < d2.size) collisions.add(_n);else collisions.add(_n2);
      }
    }
  } // console.log(collisions)


  return worthyLabels.filter(function (l) {
    return !collisions.has(l);
  });
}