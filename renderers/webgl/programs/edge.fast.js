"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _program = _interopRequireDefault(require("./program"));

var _utils = require("../utils");

var _edgeFastVert = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/edge.fast.vert.glsl"));

var _edgeFastFrag = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/edge.fast.frag.glsl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var POINTS = 2,
    ATTRIBUTES = 3;

var EdgeFastProgram =
/*#__PURE__*/
function (_Program) {
  _inherits(EdgeFastProgram, _Program);

  function EdgeFastProgram(gl) {
    var _this;

    _classCallCheck(this, EdgeFastProgram);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EdgeFastProgram).call(this, gl, _edgeFastVert.default, _edgeFastFrag.default)); // Binding context

    _this.gl = gl; // Array data

    _this.array = null; // Initializing buffers

    _this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer); // Locations

    _this.positionLocation = gl.getAttribLocation(_this.program, 'a_position');
    _this.colorLocation = gl.getAttribLocation(_this.program, 'a_color');
    _this.resolutionLocation = gl.getUniformLocation(_this.program, 'u_resolution');
    _this.matrixLocation = gl.getUniformLocation(_this.program, 'u_matrix'); // Bindings

    gl.enableVertexAttribArray(_this.positionLocation);
    gl.enableVertexAttribArray(_this.colorLocation);
    gl.vertexAttribPointer(_this.positionLocation, 2, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(_this.colorLocation, 1, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 8);
    return _this;
  }

  _createClass(EdgeFastProgram, [{
    key: "allocate",
    value: function allocate(capacity) {
      this.array = new Float32Array(POINTS * ATTRIBUTES * capacity);
    }
  }, {
    key: "process",
    value: function process(sourceData, targetData, data, offset) {
      var array = this.array;

      if (sourceData.hidden || targetData.hidden || data.hidden) {
        for (var l = i + POINTS * ATTRIBUTES; i < l; i++) {
          array[i] = 0;
        }
      }

      var x1 = sourceData.x,
          y1 = sourceData.y,
          x2 = targetData.x,
          y2 = targetData.y,
          color = (0, _utils.floatColor)(data.color);
      var i = POINTS * ATTRIBUTES * offset; // First point

      array[i++] = x1;
      array[i++] = y1;
      array[i++] = color; // Second point

      array[i++] = x2;
      array[i++] = y2;
      array[i] = color;
    }
  }, {
    key: "bufferData",
    value: function bufferData() {
      var gl = this.gl; // Vertices data

      gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW);
    }
  }, {
    key: "render",
    value: function render(params) {
      var gl = this.gl;
      var program = this.program;
      gl.useProgram(program); // Binding uniforms

      gl.uniform2f(this.resolutionLocation, params.width, params.height);
      gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix); // Drawing:

      gl.drawArrays(gl.LINES, 0, this.array.length / ATTRIBUTES);
    }
  }]);

  return EdgeFastProgram;
}(_program.default);

exports.default = EdgeFastProgram;