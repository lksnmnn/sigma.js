"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _program = _interopRequireDefault(require("./program"));

var _utils = require("../utils");

var _edgeClampedVert = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/edge.clamped.vert.glsl"));

var _edgeFrag = _interopRequireDefault(require("raw-loader!glslify-loader!../shaders/edge.frag.glsl"));

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

var POINTS = 4,
    ATTRIBUTES = 7,
    STRIDE = POINTS * ATTRIBUTES;

var EdgeClampedProgram =
/*#__PURE__*/
function (_Program) {
  _inherits(EdgeClampedProgram, _Program);

  function EdgeClampedProgram(gl) {
    var _this;

    _classCallCheck(this, EdgeClampedProgram);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(EdgeClampedProgram).call(this, gl, _edgeClampedVert.default, _edgeFrag.default)); // Binding context

    _this.gl = gl; // Array data

    _this.array = null;
    _this.indicesArray = null; // Initializing buffers

    _this.buffer = gl.createBuffer();
    _this.indicesBuffer = gl.createBuffer(); // Locations

    _this.positionLocation = gl.getAttribLocation(_this.program, 'a_position');
    _this.normalLocation = gl.getAttribLocation(_this.program, 'a_normal');
    _this.thicknessLocation = gl.getAttribLocation(_this.program, 'a_thickness');
    _this.colorLocation = gl.getAttribLocation(_this.program, 'a_color');
    _this.radiusLocation = gl.getAttribLocation(_this.program, 'a_radius');
    _this.resolutionLocation = gl.getUniformLocation(_this.program, 'u_resolution');
    _this.ratioLocation = gl.getUniformLocation(_this.program, 'u_ratio');
    _this.matrixLocation = gl.getUniformLocation(_this.program, 'u_matrix');
    _this.scaleLocation = gl.getUniformLocation(_this.program, 'u_scale');

    _this.bind(); // Enabling the OES_element_index_uint extension
    // NOTE: on older GPUs, this means that really large graphs won't
    // have all their edges rendered. But it seems that the
    // `OES_element_index_uint` is quite everywhere so we'll handle
    // the potential issue if it really arises.
    // NOTE: when using webgl2, the extension is enabled by default


    _this.canUse32BitsIndices = (0, _utils.canUse32BitsIndices)(gl);
    _this.IndicesArray = _this.canUse32BitsIndices ? Uint32Array : Uint16Array;
    _this.indicesType = _this.canUse32BitsIndices ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    return _this;
  }

  _createClass(EdgeClampedProgram, [{
    key: "bind",
    value: function bind() {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer); // Bindings

      gl.enableVertexAttribArray(this.positionLocation);
      gl.enableVertexAttribArray(this.normalLocation);
      gl.enableVertexAttribArray(this.thicknessLocation);
      gl.enableVertexAttribArray(this.colorLocation);
      gl.enableVertexAttribArray(this.radiusLocation);
      gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.vertexAttribPointer(this.normalLocation, 2, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 8);
      gl.vertexAttribPointer(this.thicknessLocation, 1, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 16);
      gl.vertexAttribPointer(this.colorLocation, 4, gl.UNSIGNED_BYTE, true, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 20);
      gl.vertexAttribPointer(this.radiusLocation, 1, gl.FLOAT, false, ATTRIBUTES * Float32Array.BYTES_PER_ELEMENT, 24);
    }
  }, {
    key: "allocate",
    value: function allocate(capacity) {
      this.array = new Float32Array(POINTS * ATTRIBUTES * capacity);
    }
  }, {
    key: "process",
    value: function process(sourceData, targetData, data, offset) {
      if (sourceData.hidden || targetData.hidden || data.hidden) {
        for (var _i = offset * STRIDE, l = _i + STRIDE; _i < l; _i++) {
          this.array[_i] = 0;
        }

        return;
      }

      var thickness = data.size || 1,
          x1 = sourceData.x,
          y1 = sourceData.y,
          x2 = targetData.x,
          y2 = targetData.y,
          radius = targetData.size || 1,
          color = (0, _utils.floatColor)(data.color); // Computing normals

      var dx = x2 - x1,
          dy = y2 - y1;
      var len = dx * dx + dy * dy,
          n1 = 0,
          n2 = 0;

      if (len) {
        len = 1 / Math.sqrt(len);
        n1 = -dy * len;
        n2 = dx * len;
      }

      var i = POINTS * ATTRIBUTES * offset;
      var array = this.array; // First point

      array[i++] = x1;
      array[i++] = y1;
      array[i++] = n1;
      array[i++] = n2;
      array[i++] = thickness;
      array[i++] = color;
      array[i++] = 0; // First point flipped

      array[i++] = x1;
      array[i++] = y1;
      array[i++] = -n1;
      array[i++] = -n2;
      array[i++] = thickness;
      array[i++] = color;
      array[i++] = 0; // Second point

      array[i++] = x2;
      array[i++] = y2;
      array[i++] = n1;
      array[i++] = n2;
      array[i++] = thickness;
      array[i++] = color;
      array[i++] = radius; // Second point flipped

      array[i++] = x2;
      array[i++] = y2;
      array[i++] = -n1;
      array[i++] = -n2;
      array[i++] = thickness;
      array[i++] = color;
      array[i] = -radius;
    }
  }, {
    key: "computeIndices",
    value: function computeIndices() {
      var l = this.array.length / ATTRIBUTES;
      var size = l + l / 2;
      var indices = new this.IndicesArray(size);

      for (var i = 0, c = 0; i < l; i += 4) {
        indices[c++] = i;
        indices[c++] = i + 1;
        indices[c++] = i + 2;
        indices[c++] = i + 2;
        indices[c++] = i + 1;
        indices[c++] = i + 3;
      }

      this.indicesArray = indices;
    }
  }, {
    key: "bufferData",
    value: function bufferData() {
      var gl = this.gl; // Vertices data

      gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW); // Indices data

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indicesArray, gl.STATIC_DRAW);
    }
  }, {
    key: "render",
    value: function render(params) {
      var gl = this.gl;
      var program = this.program;
      gl.useProgram(program); // Binding uniforms
      // TODO: precise the uniform names

      gl.uniform2f(this.resolutionLocation, params.width, params.height);
      gl.uniform1f(this.ratioLocation, // 1 / Math.pow(params.ratio, params.edgesPowRatio)
      params.ratio);
      gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);
      gl.uniform1f(this.scaleLocation, params.scalingRatio); // Drawing:

      gl.drawElements(gl.TRIANGLES, this.indicesArray.length, this.indicesType, 0);
    }
  }]);

  return EdgeClampedProgram;
}(_program.default);

exports.default = EdgeClampedProgram;