"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _program = _interopRequireDefault(require("./program"));

var _utils = require("../utils");

var _edgeQuadraticBezierVert = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/edge.quadraticBezier.vert.glsl"));

var _edgeQuadraticBezierFrag = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/edge.quadraticBezier.frag.glsl"));

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

var POINTS = 3,
    ATTRIBUTES = 5;

var EdgeQuadraticBezierProgram =
/*#__PURE__*/
function (_Program) {
  _inherits(EdgeQuadraticBezierProgram, _Program);

  function EdgeQuadraticBezierProgram(gl) {
    var _this;

    _classCallCheck(this, EdgeQuadraticBezierProgram);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EdgeQuadraticBezierProgram).call(this, gl, _edgeQuadraticBezierVert.default, _edgeQuadraticBezierFrag.default)); // Binding context

    _this.gl = gl; // Array data

    _this.array = null; // Initializing buffers

    _this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer); // Locations

    _this.positionLocation = gl.getAttribLocation(_this.program, 'a_position'); // this.thicknessLocation = gl.getAttribLocation(this.program, 'a_thickness');

    _this.colorLocation = gl.getAttribLocation(_this.program, 'a_color');
    _this.coordLocation = gl.getAttribLocation(_this.program, 'a_coord');
    _this.resolutionLocation = gl.getUniformLocation(_this.program, 'u_resolution');
    _this.ratioLocation = gl.getUniformLocation(_this.program, 'u_ratio');
    _this.matrixLocation = gl.getUniformLocation(_this.program, 'u_matrix');
    _this.scaleLocation = gl.getUniformLocation(_this.program, 'u_scale'); // Bindings

    gl.enableVertexAttribArray(_this.positionLocation); // gl.enableVertexAttribArray(this.thicknessLocation);

    gl.enableVertexAttribArray(_this.colorLocation);
    gl.enableVertexAttribArray(_this.coordLocation);
    gl.vertexAttribPointer(_this.positionLocation, 2, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0); // gl.vertexAttribPointer(this.thicknessLocation,
    //   1,
    //   gl.FLOAT,
    //   false,
    //   ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT,
    //   8
    // );

    gl.vertexAttribPointer(_this.colorLocation, 4, gl.UNSIGNED_BYTE, true, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 8);
    gl.vertexAttribPointer(_this.coordLocation, 2, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 12);
    return _this;
  }

  _createClass(EdgeQuadraticBezierProgram, [{
    key: "allocate",
    value: function allocate(capacity) {
      this.array = new Float32Array(POINTS * ATTRIBUTES * capacity);
    }
  }, {
    key: "process",
    value: function process(sourceData, targetData, data, offset) {
      if (sourceData.hidden || targetData.hidden || data.hidden) {
        for (var l = i + POINTS * ATTRIBUTES; i < l; i++) {
          this.array[i] = 0;
        }
      }

      var x1 = sourceData.x,
          y1 = sourceData.y,
          x2 = targetData.x,
          y2 = targetData.y,
          color = (0, _utils.floatColor)(data.color);
      var i = POINTS * ATTRIBUTES * offset;
      var array = this.array; // Control point

      array[i++] = (x1 + x2) / 2 + (y2 - y1) / 4;
      array[i++] = (y1 + y2) / 2 + (x1 - x2) / 4; // array[i++] = thickness;

      array[i++] = color;
      array[i++] = 0.5;
      array[i++] = 0; // First point

      array[i++] = x1;
      array[i++] = y1; // array[i++] = thickness;

      array[i++] = color;
      array[i++] = 0;
      array[i++] = 0; // Second point

      array[i++] = x2;
      array[i++] = y2; // array[i++] = thickness;

      array[i++] = color;
      array[i++] = 1;
      array[i] = 1;
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
      gl.uniform1f(this.ratioLocation, params.ratio / Math.pow(params.ratio, params.edgesPowRatio));
      gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);
      gl.uniform1f(this.scaleLocation, params.ratio); // Drawing:

      gl.drawArrays(gl.TRIANGLES, 0, this.array.length / ATTRIBUTES);
    }
  }]);

  return EdgeQuadraticBezierProgram;
}(_program.default);

exports.default = EdgeQuadraticBezierProgram;