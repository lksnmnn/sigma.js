"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = drawLabel;

/**
 * Sigma.js Canvas Renderer Label Component
 * =========================================
 *
 * Function used by the canvas renderer to display a single node's label.
 */
function drawLabel(context, data, settings) {
  var size = settings.labelSize,
      font = settings.labelFont,
      weight = settings.labelWeight;
  context.fillStyle = '#000';
  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}