"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _program = _interopRequireDefault(require("./program"));

var _utils = require("../utils");

var _nodeVert = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/node.vert.glsl"));

var _nodeFrag = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/node.frag.glsl"));

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

var ANGLE_1 = 0,
    ANGLE_2 = 2 * Math.PI / 3,
    ANGLE_3 = 4 * Math.PI / 3;
var POINTS = 3,
    ATTRIBUTES = 5;

var NodeProgram =
/*#__PURE__*/
function (_Program) {
  _inherits(NodeProgram, _Program);

  function NodeProgram(gl) {
    var _this;

    _classCallCheck(this, NodeProgram);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NodeProgram).call(this, gl, _nodeVert.default, _nodeFrag.default)); // Binding context

    _this.gl = gl; // Array data

    _this.array = null; // Initializing buffers

    _this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer); // Locations

    _this.positionLocation = gl.getAttribLocation(_this.program, 'a_position');
    _this.sizeLocation = gl.getAttribLocation(_this.program, 'a_size');
    _this.colorLocation = gl.getAttribLocation(_this.program, 'a_color');
    _this.angleLocation = gl.getAttribLocation(_this.program, 'a_angle');
    _this.resolutionLocation = gl.getUniformLocation(_this.program, 'u_resolution');
    _this.matrixLocation = gl.getUniformLocation(_this.program, 'u_matrix');
    _this.ratioLocation = gl.getUniformLocation(_this.program, 'u_ratio');
    _this.scaleLocation = gl.getUniformLocation(_this.program, 'u_scale'); // Bindings

    gl.enableVertexAttribArray(_this.positionLocation);
    gl.enableVertexAttribArray(_this.sizeLocation);
    gl.enableVertexAttribArray(_this.colorLocation);
    gl.enableVertexAttribArray(_this.angleLocation);
    gl.vertexAttribPointer(_this.positionLocation, 2, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(_this.sizeLocation, 1, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 8);
    gl.vertexAttribPointer(_this.colorLocation, 1, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 12);
    gl.vertexAttribPointer(_this.angleLocation, 1, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 16);
    return _this;
  }

  _createClass(NodeProgram, [{
    key: "allocate",
    value: function allocate(capacity) {
      this.array = new Float32Array(POINTS * ATTRIBUTES * capacity);
    }
  }, {
    key: "process",
    value: function process(data, offset) {
      var color = (0, _utils.floatColor)(data.color);
      var i = offset * POINTS * ATTRIBUTES;
      var array = this.array;
      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = color;
      array[i++] = ANGLE_1;
      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = color;
      array[i++] = ANGLE_2;
      array[i++] = data.x;
      array[i++] = data.y;
      array[i++] = data.size;
      array[i++] = color;
      array[i] = ANGLE_3;
    }
  }, {
    key: "bufferData",
    value: function bufferData() {
      var gl = this.gl;
      gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW);
    }
  }, {
    key: "render",
    value: function render(params) {
      var gl = this.gl;
      var program = this.program;
      gl.useProgram(program);
      gl.uniform2f(this.resolutionLocation, params.width, params.height);
      gl.uniform1f(this.ratioLocation, 1 / Math.pow(params.ratio, params.nodesPowRatio));
      gl.uniform1f(this.scaleLocation, params.scalingRatio);
      gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);
      gl.drawArrays(gl.TRIANGLES, 0, this.array.length / ATTRIBUTES);
    }
  }]);

  return NodeProgram;
}(_program.default);

exports.default = NodeProgram;