"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _camera = _interopRequireDefault(require("../camera"));

var _captor = _interopRequireDefault(require("../captor"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

/**
 * Constants.
 */
var DRAG_TIMEOUT = 200,
    MOUSE_INERTIA_DURATION = 200,
    MOUSE_INERTIA_RATIO = 3,
    MOUSE_ZOOM_DURATION = 200,
    ZOOMING_RATIO = 1.7,
    DOUBLE_CLICK_TIMEOUT = 300,
    DOUBLE_CLICK_ZOOMING_RATIO = 2.2,
    DOUBLE_CLICK_ZOOMING_DURATION = 200;
/**
 * Mouse captor class.
 *
 * @constructor
 */

var MouseCaptor =
/*#__PURE__*/
function (_Captor) {
  _inherits(MouseCaptor, _Captor);

  function MouseCaptor(container, camera) {
    var _this;

    _classCallCheck(this, MouseCaptor);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MouseCaptor).call(this, container, camera)); // Properties

    _this.container = container;
    _this.camera = camera; // State

    _this.enabled = true;
    _this.hasDragged = false;
    _this.downStartTime = null;
    _this.lastMouseX = null;
    _this.lastMouseY = null;
    _this.isMouseDown = false;
    _this.isMoving = false;
    _this.movingTimeout = null;
    _this.startCameraState = null;
    _this.lastCameraState = null;
    _this.clicks = 0;
    _this.doubleClickTimeout = null;
    _this.wheelLock = false; // Binding methods

    _this.handleClick = _this.handleClick.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.handleDown = _this.handleDown.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.handleUp = _this.handleUp.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.handleMove = _this.handleMove.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.handleWheel = _this.handleWheel.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.handleOut = _this.handleOut.bind(_assertThisInitialized(_assertThisInitialized(_this))); // Binding events

    container.addEventListener('click', _this.handleClick, false);
    container.addEventListener('mousedown', _this.handleDown, false);
    container.addEventListener('mousemove', _this.handleMove, false);
    container.addEventListener('DOMMouseScroll', _this.handleWheel, false);
    container.addEventListener('mousewheel', _this.handleWheel, false);
    container.addEventListener('mouseout', _this.handleOut, false);
    document.addEventListener('mouseup', _this.handleUp, false);
    return _this;
  }

  _createClass(MouseCaptor, [{
    key: "kill",
    value: function kill() {
      var container = this.container;
      container.removeEventListener('click', this.handleClick);
      container.removeEventListener('mousedown', this.handleDown);
      container.removeEventListener('mousemove', this.handleMove);
      container.removeEventListener('DOMMouseScroll', this.handleWheel);
      container.removeEventListener('mousewheel', this.handleWheel);
      container.removeEventListener('mouseout', this.handleOut);
      document.removeEventListener('mouseup', this.handleUp);
    }
  }, {
    key: "handleClick",
    value: function handleClick(e) {
      var _this2 = this;

      if (!this.enabled) return;
      this.clicks++;

      if (this.clicks === 2) {
        this.clicks = 0;
        clearTimeout(this.doubleClickTimeout);
        this.doubleClickTimeout = null;
        return this.handleDoubleClick(e);
      }

      setTimeout(function () {
        _this2.clicks = 0;
        _this2.doubleClickTimeout = null;
      }, DOUBLE_CLICK_TIMEOUT); // NOTE: this is here to prevent click events on drag

      if (!this.hasDragged) this.emit('click', (0, _utils.getMouseCoords)(e));
    }
  }, {
    key: "handleDoubleClick",
    value: function handleDoubleClick(e) {
      if (!this.enabled) return;
      var center = (0, _utils.getCenter)(e);
      var cameraState = this.camera.getState();
      var newRatio = cameraState.ratio / DOUBLE_CLICK_ZOOMING_RATIO; // TODO: factorize

      var dimensions = {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      };
      var clickX = (0, _utils.getX)(e),
          clickY = (0, _utils.getY)(e); // TODO: baaaad we mustn't mutate the camera, create a Camera.from or #.copy
      // TODO: factorize pan & zoomTo

      var cameraWithNewRatio = new _camera.default();
      cameraWithNewRatio.ratio = newRatio;
      cameraWithNewRatio.x = cameraState.x;
      cameraWithNewRatio.y = cameraState.y;
      var clickGraph = this.camera.viewportToGraph(dimensions, clickX, clickY),
          centerGraph = this.camera.viewportToGraph(dimensions, center.x, center.y);
      var clickGraphNew = cameraWithNewRatio.viewportToGraph(dimensions, clickX, clickY),
          centerGraphNew = cameraWithNewRatio.viewportToGraph(dimensions, center.x, center.y);
      var deltaX = clickGraphNew.x - centerGraphNew.x - clickGraph.x + centerGraph.x,
          deltaY = clickGraphNew.y - centerGraphNew.y - clickGraph.y + centerGraph.y;
      this.camera.animate({
        x: cameraState.x - deltaX,
        y: cameraState.y - deltaY,
        ratio: newRatio
      }, {
        easing: 'quadraticInOut',
        duration: DOUBLE_CLICK_ZOOMING_DURATION
      });
      if (e.preventDefault) e.preventDefault();else e.returnValue = false;
      e.stopPropagation();
      return false;
    }
  }, {
    key: "handleDown",
    value: function handleDown(e) {
      if (!this.enabled) return;
      this.startCameraState = this.camera.getState();
      this.lastCameraState = this.startCameraState;
      this.lastMouseX = (0, _utils.getX)(e);
      this.lastMouseY = (0, _utils.getY)(e);
      this.hasDragged = false;
      this.downStartTime = Date.now(); // TODO: dispatch events

      switch (e.which) {
        default:
          // Left button pressed
          this.isMouseDown = true;
          this.emit('mousedown', (0, _utils.getMouseCoords)(e));
      }
    }
  }, {
    key: "handleUp",
    value: function handleUp(e) {
      var _this3 = this;

      if (!this.enabled || !this.isMouseDown) return;
      this.isMouseDown = false;

      if (this.movingTimeout) {
        this.movingTimeout = null;
        clearTimeout(this.movingTimeout);
      }

      var x = (0, _utils.getX)(e),
          y = (0, _utils.getY)(e);
      var cameraState = this.camera.getState(),
          previousCameraState = this.camera.getPreviousState();

      if (this.isMoving) {
        this.camera.animate({
          x: cameraState.x + MOUSE_INERTIA_RATIO * (cameraState.x - previousCameraState.x),
          y: cameraState.y + MOUSE_INERTIA_RATIO * (cameraState.y - previousCameraState.y)
        }, {
          duration: MOUSE_INERTIA_DURATION,
          easing: 'quadraticOut'
        });
      } else if (this.lastMouseX !== x || this.lastMouseY !== y) {
        this.camera.setState({
          x: cameraState.x,
          y: cameraState.y
        });
      }

      this.isMoving = false;
      setImmediate(function () {
        return _this3.hasDragged = false;
      });
      this.emit('mouseup', (0, _utils.getMouseCoords)(e));
    }
  }, {
    key: "handleMove",
    value: function handleMove(e) {
      var _this4 = this;

      if (!this.enabled) return;
      this.emit('mousemove', (0, _utils.getMouseCoords)(e));

      if (this.isMouseDown) {
        // TODO: dispatch events
        this.isMoving = true;
        this.hasDragged = true;
        if (this.movingTimeout) clearTimeout(this.movingTimeout);
        this.movingTimeout = setTimeout(function () {
          _this4.movingTimeout = null;
          _this4.isMoving = false;
        }, DRAG_TIMEOUT);
        var dimensions = {
          width: this.container.offsetWidth,
          height: this.container.offsetHeight
        };
        var eX = (0, _utils.getX)(e),
            eY = (0, _utils.getY)(e);
        var lastMouse = this.camera.viewportToGraph(dimensions, this.lastMouseX, this.lastMouseY);
        var mouse = this.camera.viewportToGraph(dimensions, eX, eY);
        var offsetX = lastMouse.x - mouse.x,
            offsetY = lastMouse.y - mouse.y;
        var cameraState = this.camera.getState();
        var x = cameraState.x + offsetX,
            y = cameraState.y + offsetY;
        this.camera.setState({
          x: x,
          y: y
        });
        this.lastMouseX = eX;
        this.lastMouseY = eY;
      }

      if (e.preventDefault) e.preventDefault();else e.returnValue = false;
      e.stopPropagation();
      return false;
    }
  }, {
    key: "handleWheel",
    value: function handleWheel(e) {
      var _this5 = this;

      if (e.preventDefault) e.preventDefault();else e.returnValue = false;
      e.stopPropagation();
      if (!this.enabled) return false;
      var delta = (0, _utils.getWheelDelta)(e);
      if (!delta) return false;
      if (this.wheelLock) return false;
      this.wheelLock = true; // TODO: handle max zoom

      var ratio = delta > 0 ? 1 / ZOOMING_RATIO : ZOOMING_RATIO;
      var cameraState = this.camera.getState();
      var newRatio = ratio * cameraState.ratio;
      var center = (0, _utils.getCenter)(e);
      var dimensions = {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      };
      var clickX = (0, _utils.getX)(e),
          clickY = (0, _utils.getY)(e); // TODO: baaaad we mustn't mutate the camera, create a Camera.from or #.copy
      // TODO: factorize pan & zoomTo

      var cameraWithNewRatio = new _camera.default();
      cameraWithNewRatio.ratio = newRatio;
      cameraWithNewRatio.x = cameraState.x;
      cameraWithNewRatio.y = cameraState.y;
      var clickGraph = this.camera.viewportToGraph(dimensions, clickX, clickY),
          centerGraph = this.camera.viewportToGraph(dimensions, center.x, center.y);
      var clickGraphNew = cameraWithNewRatio.viewportToGraph(dimensions, clickX, clickY),
          centerGraphNew = cameraWithNewRatio.viewportToGraph(dimensions, center.x, center.y);
      var deltaX = clickGraphNew.x - centerGraphNew.x - clickGraph.x + centerGraph.x,
          deltaY = clickGraphNew.y - centerGraphNew.y - clickGraph.y + centerGraph.y;
      this.camera.animate({
        x: cameraState.x - deltaX,
        y: cameraState.y - deltaY,
        ratio: newRatio
      }, {
        easing: 'linear',
        duration: MOUSE_ZOOM_DURATION
      }, function () {
        return _this5.wheelLock = false;
      });
      return false;
    }
  }, {
    key: "handleOut",
    value: function handleOut() {// TODO: dispatch event
    }
  }]);

  return MouseCaptor;
}(_captor.default);

exports.default = MouseCaptor;