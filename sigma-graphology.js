"use strict";

var _graphology = _interopRequireDefault(require("graphology"));

var _browser = _interopRequireDefault(require("graphology-library/browser"));

var _renderer = _interopRequireDefault(require("./renderer"));

var _camera = _interopRequireDefault(require("./camera"));

var _quadtree = _interopRequireDefault(require("./quadtree"));

var _mouse = _interopRequireDefault(require("./captors/mouse"));

var _webgl = _interopRequireDefault(require("./renderers/webgl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sigma.js + Graphology Bundle Endpoint
 * ======================================
 *
 * Endpoint for a mega bundle gathering sigma + graphology + libraries.
 */
var sigma = {
  Renderer: _renderer.default,
  Camera: _camera.default,
  QuadTree: _quadtree.default,
  MouseCaptor: _mouse.default,
  WebGLRenderer: _webgl.default
};
_graphology.default.library = _browser.default;
window.sigma = sigma;
window.graphology = _graphology.default;