"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = drawHover;

var _node = _interopRequireDefault(require("./node"));

var _label = _interopRequireDefault(require("./label"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sigma.js Canvas Renderer Hover Component
 * =========================================
 *
 * Function used by the canvas renderer to display a single node's hovered
 * state.
 */
function drawHover(context, data, settings) {
  var size = settings.labelSize,
      font = settings.labelFont,
      weight = settings.labelWeight;
  context.font = "".concat(weight, " ").concat(size, "px ").concat(font); // Then we draw the label background

  context.beginPath();
  context.fillStyle = '#fff';
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 8;
  context.shadowColor = '#000';
  var textWidth = context.measureText(data.label).width;
  var x = Math.round(data.x - size / 2 - 2),
      y = Math.round(data.y - size / 2 - 2),
      w = Math.round(textWidth + size / 2 + data.size + 9),
      h = Math.round(size + 4),
      e = Math.round(size / 2 + 2);
  context.moveTo(x, y + e);
  context.moveTo(x, y + e);
  context.arcTo(x, y, x + e, y, e);
  context.lineTo(x + w, y);
  context.lineTo(x + w, y + h);
  context.lineTo(x + e, y + h);
  context.arcTo(x, y + h, x, y + h - e, e);
  context.lineTo(x, y + e);
  context.closePath();
  context.fill();
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0; // Then we need to draw the node

  (0, _node.default)(context, data); // And finally we draw the label

  (0, _label.default)(context, data, settings);
}