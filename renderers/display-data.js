"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EdgeDisplayData = exports.NodeDisplayData = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Sigma.js Display Data Classes
 * ==============================
 *
 * Classes representing nodes & edges display data aiming at facilitating
 * the engine's memory representation and keep them in a pool to avoid
 * requiring to allocate memory too often.
 *
 * NOTE: it's possible to optimize this further by maintaining display data
 * in byte arrays but this would prove more tedious for the rendering logic
 * afterwards.
 */
var NodeDisplayData =
/*#__PURE__*/
function () {
  function NodeDisplayData(index, settings) {
    _classCallCheck(this, NodeDisplayData);

    this.index = index;
    this.x = 0;
    this.y = 0;
    this.size = 2;
    this.color = settings.defaultNodeColor;
    this.hidden = false;
    this.label = '';
  }

  _createClass(NodeDisplayData, [{
    key: "assign",
    value: function assign(data) {
      if ('x' in data) this.x = data.x;
      if ('y' in data) this.y = data.y;
      if ('size' in data) this.size = data.size;
      if ('color' in data) this.color = data.color;
      if ('hidden' in data) this.hidden = data.hidden;
      if ('label' in data) this.label = data.label;
    }
  }]);

  return NodeDisplayData;
}();

exports.NodeDisplayData = NodeDisplayData;

var EdgeDisplayData =
/*#__PURE__*/
function () {
  function EdgeDisplayData(index, settings) {
    _classCallCheck(this, EdgeDisplayData);

    this.index = index;
    this.size = 1;
    this.color = settings.defaultEdgeColor;
    this.hidden = false;
  }

  _createClass(EdgeDisplayData, [{
    key: "assign",
    value: function assign(data) {
      if ('size' in data) this.size = data.size;
      if ('color' in data) this.color = data.color;
      if ('hidden' in data) this.hidden = data.hidden;
    }
  }]);

  return EdgeDisplayData;
}();

exports.EdgeDisplayData = EdgeDisplayData;