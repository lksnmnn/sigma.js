"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _program = require("./program");

var _arrow = _interopRequireDefault(require("./arrow"));

var _edge = _interopRequireDefault(require("./edge.clamped"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sigma.js WebGL Renderer Edge Arrow Program
 * ===========================================
 *
 * Compound program rendering edges as an arrow from the source to the target.
 */
var program = (0, _program.createCompoundProgram)([_edge.default, _arrow.default]);
var _default = program;
exports.default = _default;