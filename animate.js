"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.animateNodes = animateNodes;

var _utils = require("./utils");

var easings = _interopRequireWildcard(require("./easings"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Sigma.js Animation Helpers
 * ===========================
 *
 * Handy helper functions dealing with nodes & edges attributes animation.
 */

/**
 * Defaults.
 */
var ANIMATE_DEFAULTS = {
  easing: 'quadraticInOut',
  duration: 150
};
/**
 * Function used to animate the nodes.
 */

function animateNodes(graph, targets, options, callback) {
  options = (0, _utils.assign)({}, ANIMATE_DEFAULTS, options);
  var easing = typeof options.easing === 'function' ? options.easing : easings[options.easing];
  var start = Date.now();
  var startPositions = {};

  for (var node in targets) {
    var attrs = targets[node];
    startPositions[node] = {};

    for (var k in attrs) {
      startPositions[node][k] = graph.getNodeAttribute(node, k);
    }
  }

  var frame = null;

  var step = function step() {
    var p = (Date.now() - start) / options.duration;

    if (p >= 1) {
      // Animation is done
      for (var _node in targets) {
        var _attrs = targets[_node];

        for (var _k in _attrs) {
          graph.setNodeAttribute(_node, _k, _attrs[_k]);
        }
      }

      if (typeof callback === 'function') callback();
      return;
    }

    p = easing(p);

    for (var _node2 in targets) {
      var _attrs2 = targets[_node2];
      var s = startPositions[_node2];

      for (var _k2 in _attrs2) {
        graph.setNodeAttribute(_node2, _k2, _attrs2[_k2] * p + s[_k2] * (1 - p));
      }
    }

    frame = requestAnimationFrame(step);
  };

  step();
  return function () {
    if (frame) cancelAnimationFrame(frame);
  };
}