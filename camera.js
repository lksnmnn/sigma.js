"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

var easings = _interopRequireWildcard(require("./easings"));

var _utils = require("./utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * Defaults.
 */
var ANIMATE_DEFAULTS = {
  easing: 'quadraticInOut',
  duration: 150
};
var DEFAULT_ZOOMING_RATIO = 1.5; // TODO: animate options = number polymorphism?
// TODO: pan, zoom, unzoom, reset, rotate, zoomTo
// TODO: add width / height to camera and add #.resize
// TODO: bind camera to renderer rather than sigma
// TODO: add #.graphToDisplay, #.displayToGraph, batch methods later

/**
 * Camera class
 *
 * @constructor
 */

var Camera =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Camera, _EventEmitter);

  function Camera() {
    var _this;

    _classCallCheck(this, Camera);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Camera).call(this)); // Properties

    _this.x = 0.5;
    _this.y = 0.5;
    _this.angle = 0;
    _this.ratio = 1; // State

    _this.nextFrame = null;
    _this.previousState = _this.getState();
    _this.enabled = true;
    return _this;
  }
  /**
   * Method used to enable the camera.
   *
   * @return {Camera}
   */


  _createClass(Camera, [{
    key: "enable",
    value: function enable() {
      this.enabled = true;
      return this;
    }
    /**
     * Method used to disable the camera.
     *
     * @return {Camera}
     */

  }, {
    key: "disable",
    value: function disable() {
      this.enabled = false;
      return this;
    }
    /**
     * Method used to retrieve the camera's current state.
     *
     * @return {object}
     */

  }, {
    key: "getState",
    value: function getState() {
      return {
        x: this.x,
        y: this.y,
        angle: this.angle,
        ratio: this.ratio
      };
    }
    /**
     * Method used to retrieve the camera's previous state.
     *
     * @return {object}
     */

  }, {
    key: "getPreviousState",
    value: function getPreviousState() {
      var state = this.previousState;
      return {
        x: state.x,
        y: state.y,
        angle: state.angle,
        ratio: state.ratio
      };
    }
    /**
     * Method used to check whether the camera is currently being animated.
     *
     * @return {boolean}
     */

  }, {
    key: "isAnimated",
    value: function isAnimated() {
      return !!this.nextFrame;
    }
    /**
     * Method returning the coordinates of a point from the graph frame to the
     * viewport.
     *
     * @param  {object} dimensions - Dimensions of the viewport.
     * @param  {number} x          - The X coordinate.
     * @param  {number} y          - The Y coordinate.
     * @return {object}            - The point coordinates in the viewport.
     */
    // TODO: assign to gain one object
    // TODO: angles

  }, {
    key: "graphToViewport",
    value: function graphToViewport(dimensions, x, y) {
      var smallestDimension = Math.min(dimensions.width, dimensions.height);
      var dx = smallestDimension / dimensions.width,
          dy = smallestDimension / dimensions.height; // TODO: we keep on the upper left corner!
      // TODO: how to normalize sizes?

      return {
        x: (x - this.x + this.ratio / 2 / dx) * (smallestDimension / this.ratio),
        y: (this.y - y + this.ratio / 2 / dy) * (smallestDimension / this.ratio)
      };
    }
    /**
     * Method returning the coordinates of a point from the viewport frame to the
     * graph frame.
     *
     * @param  {object} dimensions - Dimensions of the viewport.
     * @param  {number} x          - The X coordinate.
     * @param  {number} y          - The Y coordinate.
     * @return {object}            - The point coordinates in the graph frame.
     */
    // TODO: angles

  }, {
    key: "viewportToGraph",
    value: function viewportToGraph(dimensions, x, y) {
      var smallestDimension = Math.min(dimensions.width, dimensions.height);
      var dx = smallestDimension / dimensions.width,
          dy = smallestDimension / dimensions.height;
      return {
        x: this.ratio / smallestDimension * x + this.x - this.ratio / 2 / dx,
        y: -(this.ratio / smallestDimension * y - this.y - this.ratio / 2 / dy)
      };
    }
    /**
     * Method returning the abstract rectangle containing the graph according
     * to the camera's state.
     *
     * @return {object} - The view's rectangle.
     */
    // TODO: angle

  }, {
    key: "viewRectangle",
    value: function viewRectangle(dimensions) {
      // TODO: reduce relative margin?
      var marginX = 0 * dimensions.width / 8,
          marginY = 0 * dimensions.height / 8;
      var p1 = this.viewportToGraph(dimensions, 0 - marginX, 0 - marginY),
          p2 = this.viewportToGraph(dimensions, dimensions.width + marginX, 0 - marginY),
          h = this.viewportToGraph(dimensions, 0, dimensions.height + marginY);
      return {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        height: p2.y - h.y
      };
    }
    /**
     * Method used to set the camera's state.
     *
     * @param  {object} state - New state.
     * @return {Camera}
     */

  }, {
    key: "setState",
    value: function setState(state) {
      if (!this.enabled) return this; // TODO: validations
      // TODO: update by function
      // Keeping track of last state

      this.previousState = this.getState();
      if ('x' in state) this.x = state.x;
      if ('y' in state) this.y = state.y;
      if ('angle' in state) this.angle = state.angle;
      if ('ratio' in state) this.ratio = state.ratio; // Emitting
      // TODO: don't emit if nothing changed?

      this.emit('updated', this.getState());
      return this;
    }
    /**
     * Method used to animate the camera.
     *
     * @param  {object}   state      - State to reach eventually.
     * @param  {object}   options    - Options:
     * @param  {number}     duration - Duration of the animation.
     * @param  {function} callback   - Callback
     * @return {function}            - Return a function to cancel the animation.
     */

  }, {
    key: "animate",
    value: function animate(state, options, callback) {
      var _this2 = this;

      if (!this.enabled) return this; // TODO: validation

      options = (0, _utils.assign)({}, ANIMATE_DEFAULTS, options);
      var easing = typeof options.easing === 'function' ? options.easing : easings[options.easing]; // Canceling previous animation if needed

      if (this.nextFrame) cancelAnimationFrame(this.nextFrame); // State

      var start = Date.now(),
          initialState = this.getState(); // Function performing the animation

      var fn = function fn() {
        var t = (Date.now() - start) / options.duration; // The animation is over:

        if (t >= 1) {
          _this2.nextFrame = null;

          _this2.setState(state);

          if (typeof callback === 'function') callback();
          return;
        }

        var coefficient = easing(t);
        var newState = {};
        if ('x' in state) newState.x = initialState.x + (state.x - initialState.x) * coefficient;
        if ('y' in state) newState.y = initialState.y + (state.y - initialState.y) * coefficient;
        if ('angle' in state) newState.angle = initialState.angle + (state.angle - initialState.angle) * coefficient;
        if ('ratio' in state) newState.ratio = initialState.ratio + (state.ratio - initialState.ratio) * coefficient;

        _this2.setState(newState);

        _this2.nextFrame = requestAnimationFrame(fn);
      };

      if (this.nextFrame) {
        cancelAnimationFrame(this.nextFrame);
        this.nextFrame = requestAnimationFrame(fn);
      } else {
        fn();
      }
    }
    /**
     * Method used to zoom the camera.
     *
     * @param  {number|object} factorOrOptions - Factor or options.
     * @return {function}
     */

  }, {
    key: "animatedZoom",
    value: function animatedZoom(factorOrOptions) {
      if (!factorOrOptions) {
        return this.animate({
          ratio: this.ratio / DEFAULT_ZOOMING_RATIO
        });
      } else {
        if (typeof factorOrOptions === 'number') return this.animate({
          ratio: this.ratio / factorOrOptions
        });else return this.animate({
          ratio: this.ratio / (factorOrOptions.factor || DEFAULT_ZOOMING_RATIO)
        }, factorOrOptions);
      }
    }
    /**
     * Method used to unzoom the camera.
     *
     * @param  {number|object} factorOrOptions - Factor or options.
     * @return {function}
     */

  }, {
    key: "animatedUnzoom",
    value: function animatedUnzoom(factorOrOptions) {
      if (!factorOrOptions) {
        return this.animate({
          ratio: this.ratio * DEFAULT_ZOOMING_RATIO
        });
      } else {
        if (typeof factorOrOptions === 'number') return this.animate({
          ratio: this.ratio * factorOrOptions
        });else return this.animate({
          ratio: this.ratio * (factorOrOptions.factor || DEFAULT_ZOOMING_RATIO)
        }, factorOrOptions);
      }
    }
    /**
     * Method used to reset the camera.
     *
     * @param  {object} options - Options.
     * @return {function}
     */

  }, {
    key: "animatedReset",
    value: function animatedReset(options) {
      return this.animate({
        x: 0.5,
        y: 0.5,
        ratio: 1,
        angle: 0
      }, options);
    }
  }]);

  return Camera;
}(_events.EventEmitter);

exports.default = Camera;