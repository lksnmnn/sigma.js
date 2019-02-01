"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCompoundProgram = createCompoundProgram;
exports.default = void 0;

var _utils = require("../shaders/utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Program class.
 *
 * @constructor
 */
var Program =
/*#__PURE__*/
function () {
  function Program(gl, vertexShaderSource, fragmentShaderSource) {
    _classCallCheck(this, Program);

    this.vertexShaderSource = vertexShaderSource;
    this.fragmentShaderSource = fragmentShaderSource;
    this.load(gl);
  }
  /**
   * Method used to load the program into a webgl context.
   *
   * @param  {WebGLContext} gl - The WebGL context.
   * @return {WebGLProgram}
   */


  _createClass(Program, [{
    key: "load",
    value: function load(gl) {
      this.vertexShader = (0, _utils.loadVertexShader)(gl, this.vertexShaderSource);
      this.fragmentShader = (0, _utils.loadFragmentShader)(gl, this.fragmentShaderSource);
      this.program = (0, _utils.loadProgram)(gl, [this.vertexShader, this.fragmentShader]);
      return this.program;
    }
  }]);

  return Program;
}();
/**
 * Helper function combining two or more programs into a single compound one.
 * Note that this is more a quick & easy way to combine program than a really
 * performant option. More performant programs can be written entirely.
 *
 * @param  {array}    programClasses - Program classes to combine.
 * @return {function}
 */
// TODO: maybe those should handle their own canvases


exports.default = Program;

function createCompoundProgram(programClasses) {
  return (
    /*#__PURE__*/
    function () {
      function CompoundProgram(gl) {
        _classCallCheck(this, CompoundProgram);

        this.programs = programClasses.map(function (ProgramClass) {
          return new ProgramClass(gl);
        });
      }

      _createClass(CompoundProgram, [{
        key: "allocate",
        value: function allocate(capacity) {
          this.programs.forEach(function (program) {
            return program.allocate(capacity);
          });
        }
      }, {
        key: "process",
        value: function process() {
          var args = arguments;
          this.programs.forEach(function (program) {
            return program.process.apply(program, _toConsumableArray(args));
          });
        }
      }, {
        key: "computeIndices",
        value: function computeIndices() {
          this.programs.forEach(function (program) {
            if (typeof program.computeIndices === 'function') program.computeIndices();
          });
        }
      }, {
        key: "bufferData",
        value: function bufferData() {
          this.programs.forEach(function (program) {
            return program.bufferData();
          });
        }
      }, {
        key: "render",
        value: function render() {
          var args = arguments;
          this.programs.forEach(function (program) {
            program.bind();
            program.bufferData();
            program.render.apply(program, _toConsumableArray(args));
          });
        }
      }]);

      return CompoundProgram;
    }()
  );
}