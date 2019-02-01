"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extent = require("graphology-metrics/extent");

var _isGraph = _interopRequireDefault(require("graphology-utils/is-graph"));

var _renderer = _interopRequireDefault(require("../../renderer"));

var _camera = _interopRequireDefault(require("../../camera"));

var _mouse = _interopRequireDefault(require("../../captors/mouse"));

var _quadtree = _interopRequireDefault(require("../../quadtree"));

var _displayData2 = require("../display-data");

var _node2 = _interopRequireDefault(require("./programs/node.fast"));

var _edge = _interopRequireDefault(require("./programs/edge"));

var _label = _interopRequireDefault(require("../canvas/components/label"));

var _hover = _interopRequireDefault(require("../canvas/components/hover"));

var _utils = require("../../utils");

var _utils2 = require("../utils");

var _utils3 = require("./utils");

var _labels = require("../../heuristics/labels");

var _zIndex = require("../../heuristics/z-index");

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

/**
 * Constants.
 */
var PIXEL_RATIO = (0, _utils2.getPixelRatio)();
var WEBGL_OVERSAMPLING_RATIO = (0, _utils2.getPixelRatio)();
/**
 * Defaults.
 */

var DEFAULT_SETTINGS = {
  // Performance
  hideEdgesOnMove: false,
  hideLabelsOnMove: false,
  renderLabels: true,
  // Component rendering
  defaultNodeColor: '#999',
  defaultEdgeColor: '#ccc',
  labelFont: 'Arial',
  labelSize: 14,
  labelWeight: 'normal',
  // Reducers
  nodeReducer: null,
  edgeReducer: null,
  // Features
  zIndex: false
};
/**
 * Main class.
 *
 * @constructor
 * @param {Graph}       graph     - Graph to render.
 * @param {HTMLElement} container - DOM container in which to render.
 * @param {object}      settings  - Optional settings.
 */

var WebGLRenderer =
/*#__PURE__*/
function (_Renderer) {
  _inherits(WebGLRenderer, _Renderer);

  function WebGLRenderer(graph, container, settings) {
    var _this;

    _classCallCheck(this, WebGLRenderer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WebGLRenderer).call(this));
    settings = settings || {};
    _this.settings = (0, _utils.assign)({}, DEFAULT_SETTINGS, settings); // Validating

    if (!(0, _isGraph.default)(graph)) throw new Error('sigma/renderers/webgl: invalid graph instance.');
    if (!(container instanceof HTMLElement)) throw new Error('sigma/renderers/webgl: container should be an html element.'); // Properties

    _this.graph = graph;
    _this.captors = {};
    _this.container = container;
    _this.elements = {};
    _this.contexts = {};
    _this.listeners = {}; // Indices & cache
    // TODO: this could be improved by key => index => floatArray
    // TODO: the cache should erase keys on node delete & add new

    _this.quadtree = new _quadtree.default();
    _this.nodeDataCache = {};
    _this.edgeDataCache = {};
    _this.nodeExtent = null;
    _this.edgeExtent = null;

    _this.initializeCache(); // Normalization function


    _this.normalizationFunction = null; // Starting dimensions

    _this.width = 0;
    _this.height = 0; // State

    _this.highlightedNodes = new Set();
    _this.displayedLabels = new Set();
    _this.hoveredNode = null;
    _this.wasRenderedInThisFrame = false;
    _this.renderFrame = null;
    _this.renderHighlightedNodesFrame = null;
    _this.needToProcess = false;
    _this.needToSoftProcess = false; // Initializing contexts

    _this.createContext('edges');

    _this.createContext('nodes');

    _this.createContext('labels', false);

    _this.createContext('hovers', false);

    _this.createContext('mouse', false); // Blending


    var gl = _this.contexts.nodes;
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl = _this.contexts.edges;
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND); // Loading programs

    _this.nodePrograms = {
      def: new _node2.default(_this.contexts.nodes)
    };
    _this.edgePrograms = {
      def: new _edge.default(_this.contexts.edges)
    }; // Initial resize

    _this.resize(); // Initializing the camera


    _this.camera = new _camera.default({
      width: _this.width,
      height: _this.height
    }); // Binding camera events

    _this.bindCameraHandlers(); // Initializing captors


    _this.captors = {
      mouse: new _mouse.default(_this.elements.mouse, _this.camera)
    }; // Binding event handlers

    _this.bindEventHandlers(); // Binding graph handlers


    _this.bindGraphHandlers(); // Processing data for the first time & render


    _this.process();

    _this.render();

    return _this;
  }
  /**---------------------------------------------------------------------------
   * Internal methods.
   **---------------------------------------------------------------------------
   */

  /**
   * Internal function used to create a canvas context and add the relevant
   * DOM elements.
   *
   * @param  {string}  id    - Context's id.
   * @param  {boolean} webgl - Whether the context is a webgl or canvas one.
   * @return {WebGLRenderer}
   */


  _createClass(WebGLRenderer, [{
    key: "createContext",
    value: function createContext(id) {
      var webgl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var element = (0, _utils2.createElement)('canvas', {
        class: "sigma-".concat(id),
        style: {
          position: 'absolute'
        }
      });
      this.elements[id] = element;
      this.container.appendChild(element);
      var contextOptions = {
        preserveDrawingBuffer: false,
        antialias: false
      };
      var context;

      if (webgl) {
        // First we try webgl2 for an easy performance boost
        context = element.getContext('webgl2', contextOptions); // Else we fall back to webgl

        if (!context) context = element.getContext('webgl', contextOptions); // Edge, I am looking right at you...

        if (!context) context = element.getContext('experimental-webgl', contextOptions);
      } else {
        context = element.getContext('2d', contextOptions);
      }

      this.contexts[id] = context;
      return this;
    }
    /**
     * Method used to initialize display data cache.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "initializeCache",
    value: function initializeCache() {
      var graph = this.graph;
      var nodes = graph.nodes();

      for (var i = 0, l = nodes.length; i < l; i++) {
        this.nodeDataCache[nodes[i]] = new _displayData2.NodeDisplayData(i, this.settings);
      }

      var edges = graph.edges();

      for (var _i = 0, _l = edges.length; _i < _l; _i++) {
        this.edgeDataCache[edges[_i]] = new _displayData2.EdgeDisplayData(_i, this.settings);
      }
    }
    /**
     * Method binding camera handlers.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "bindCameraHandlers",
    value: function bindCameraHandlers() {
      var _this2 = this;

      this.listeners.camera = function () {
        _this2.scheduleRender();
      };

      this.camera.on('updated', this.listeners.camera);
      return this;
    }
    /**
     * Method binding event handlers.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "bindEventHandlers",
    value: function bindEventHandlers() {
      var _this3 = this;

      // Handling window resize
      this.listeners.handleResize = function () {
        _this3.needToSoftProcess = true;

        _this3.scheduleRender();
      };

      window.addEventListener('resize', this.listeners.handleResize); // Function checking if the mouse is on the given node

      var mouseIsOnNode = function mouseIsOnNode(mouseX, mouseY, nodeX, nodeY, size) {
        return mouseX > nodeX - size && mouseX < nodeX + size && mouseY > nodeY - size && mouseY < nodeY + size && Math.sqrt(Math.pow(mouseX - nodeX, 2) + Math.pow(mouseY - nodeY, 2)) < size;
      }; // Function returning the nodes in the mouse's quad


      var getQuadNodes = function getQuadNodes(mouseX, mouseY) {
        var mouseGraphPosition = _this3.camera.viewportToGraph(_this3, mouseX, mouseY); // TODO: minus 1? lol


        return _this3.quadtree.point(mouseGraphPosition.x, 1 - mouseGraphPosition.y);
      }; // Handling mouse move


      this.listeners.handleMove = function (e) {
        // NOTE: for the canvas renderer, testing the pixel's alpha should
        // give some boost but this slows things down for WebGL empirically.
        // TODO: this should be a method from the camera (or can be passed to graph to display somehow)
        var sizeRatio = Math.pow(_this3.camera.getState().ratio, 0.5);
        var quadNodes = getQuadNodes(e.x, e.y); // We will hover the node whose center is closest to mouse

        var minDistance = Infinity,
            nodeToHover = null;

        for (var i = 0, l = quadNodes.length; i < l; i++) {
          var node = quadNodes[i];
          var data = _this3.nodeDataCache[node];

          var pos = _this3.camera.graphToViewport(_this3, data.x, data.y);

          var size = data.size / sizeRatio;

          if (mouseIsOnNode(e.x, e.y, pos.x, pos.y, size)) {
            var distance = Math.sqrt(Math.pow(e.x - pos.x, 2) + Math.pow(e.y - pos.y, 2)); // TODO: sort by min size also for cases where center is the same

            if (distance < minDistance) {
              minDistance = distance;
              nodeToHover = node;
            }
          }
        }

        if (nodeToHover && _this3.hoveredNode !== nodeToHover) {
          _this3.hoveredNode = nodeToHover;

          _this3.emit('enterNode', {
            node: nodeToHover
          });

          return _this3.scheduleHighlightedNodesRender();
        } // Checking if the hovered node is still hovered


        if (_this3.hoveredNode) {
          var _data = _this3.nodeDataCache[_this3.hoveredNode];

          var _pos = _this3.camera.graphToViewport(_this3, _data.x, _data.y);

          var _size = _data.size / sizeRatio;

          if (!mouseIsOnNode(e.x, e.y, _pos.x, _pos.y, _size)) {
            var _node = _this3.hoveredNode;
            _this3.hoveredNode = null;

            _this3.emit('leaveNode', {
              node: _node
            });

            return _this3.scheduleHighlightedNodesRender();
          }
        }
      }; // Handling click


      this.listeners.handleClick = function (e) {
        var sizeRatio = Math.pow(_this3.camera.getState().ratio, 0.5);
        var quadNodes = getQuadNodes(e.x, e.y);

        for (var i = 0, l = quadNodes.length; i < l; i++) {
          var node = quadNodes[i];
          var data = _this3.nodeDataCache[node];

          var pos = _this3.camera.graphToViewport(_this3, data.x, data.y);

          var size = data.size / sizeRatio;
          if (mouseIsOnNode(e.x, e.y, pos.x, pos.y, size)) return _this3.emit('clickNode', {
            node: node
          });
        }

        return _this3.emit('clickStage');
      };

      this.captors.mouse.on('mousemove', this.listeners.handleMove);
      this.captors.mouse.on('click', this.listeners.handleClick);
      return this;
    }
    /**
     * Method binding graph handlers
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "bindGraphHandlers",
    value: function bindGraphHandlers() {
      var _this4 = this;

      var graph = this.graph;

      this.listeners.graphUpdate = function () {
        _this4.needToProcess = true;

        _this4.scheduleRender();
      };

      this.listeners.softGraphUpdate = function () {
        _this4.needToSoftProcess = true;

        _this4.scheduleRender();
      }; // TODO: bind this on composed state events
      // TODO: it could be possible to update only specific node etc. by holding
      // a fixed-size pool of updated items


      graph.on('nodeAdded', this.listeners.graphUpdate);
      graph.on('nodeDropped', this.listeners.graphUpdate);
      graph.on('nodeAttributesUpdated', this.listeners.softGraphUpdate);
      graph.on('edgeAdded', this.listeners.graphUpdate);
      graph.on('nodeDropped', this.listeners.graphUpdate);
      graph.on('edgeAttributesUpdated', this.listeners.softGraphUpdate);
      graph.on('cleared', this.listeners.graphUpdate);
      return this;
    }
    /**
     * Method used to process the whole graph's data.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "process",
    value: function process() {
      var keepArrays = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var graph = this.graph,
          settings = this.settings; // Clearing the quad

      this.quadtree.clear(); // Computing extents

      var nodeExtentProperties = ['x', 'y'];

      if (this.settings.zIndex) {
        nodeExtentProperties.push('z');
        this.edgeExtent = (0, _extent.edgeExtent)(graph, ['z']);
      }

      this.nodeExtent = (0, _extent.nodeExtent)(graph, nodeExtentProperties); // Rescaling function

      this.normalizationFunction = (0, _utils2.createNormalizationFunction)(this.nodeExtent);
      var nodeProgram = this.nodePrograms.def;
      if (!keepArrays) nodeProgram.allocate(graph.order);
      var nodes = graph.nodes(); // Handling node z-index
      // TODO: z-index needs us to compute display data before hand
      // TODO: remains to be seen if reducers are a good or bad thing and if we
      // should store display data in flat byte arrays indices

      if (this.settings.zIndex) nodes = (0, _zIndex.zIndexOrdering)(this.edgeExtent.z, function (node) {
        return graph.getNodeAttribute(node, 'z');
      }, nodes);

      for (var i = 0, l = nodes.length; i < l; i++) {
        var node = nodes[i];
        var data = graph.getNodeAttributes(node);
        var displayData = this.nodeDataCache[node];
        if (settings.nodeReducer) data = settings.nodeReducer(node, data); // TODO: should assign default also somewhere here if there is a reducer

        displayData.assign(data);
        this.normalizationFunction.applyTo(displayData);
        this.quadtree.add(node, displayData.x, 1 - displayData.y, displayData.size / this.width);
        nodeProgram.process(displayData, i);
        displayData.index = i;
      }

      nodeProgram.bufferData();
      var edgeProgram = this.edgePrograms.def;
      if (!keepArrays) edgeProgram.allocate(graph.size);
      var edges = graph.edges(); // Handling edge z-index

      if (this.settings.zIndex) edges = (0, _zIndex.zIndexOrdering)(this.edgeExtent.z, function (edge) {
        return graph.getEdgeAttribute(edge, 'z');
      }, edges);

      for (var _i2 = 0, _l2 = edges.length; _i2 < _l2; _i2++) {
        var edge = edges[_i2];

        var _data2 = graph.getEdgeAttributes(edge);

        var _displayData = this.edgeDataCache[edge];
        if (settings.edgeReducer) _data2 = settings.edgeReducer(edge, _data2);

        _displayData.assign(_data2);

        var extremities = graph.extremities(edge),
            sourceData = this.nodeDataCache[extremities[0]],
            targetData = this.nodeDataCache[extremities[1]];
        edgeProgram.process(sourceData, targetData, _displayData, _i2);
        _displayData.index = _i2;
      } // Computing edge indices if necessary


      if (!keepArrays && typeof edgeProgram.computeIndices === 'function') edgeProgram.computeIndices();
      edgeProgram.bufferData();
      return this;
    }
    /**
     * Method used to process a single node.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "processNode",
    value: function processNode(key) {
      var nodeProgram = this.nodePrograms.def;
      var data = this.graph.getNodeAttributes(key);
      nodeProgram.process(data, this.nodeDataCache[key].index);
      return this;
    }
    /**
     * Method used to process a single edge.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "processEdge",
    value: function processEdge(key) {
      var graph = this.graph;
      var edgeProgram = this.edgePrograms.def;
      var data = graph.getEdgeAttributes(key),
          extremities = graph.extremities(key),
          sourceData = graph.getNodeAttributes(extremities[0]),
          targetData = graph.getNodeAttributes(extremities[1]);
      edgeProgram.process(sourceData, targetData, data, this.edgeDataCache[key].index);
      return this;
    }
    /**---------------------------------------------------------------------------
     * Public API.
     **---------------------------------------------------------------------------
     */

    /**
     * Method returning the renderer's camera.
     *
     * @return {Camera}
     */

  }, {
    key: "getCamera",
    value: function getCamera() {
      return this.camera;
    }
    /**
     * Method returning the mouse captor.
     *
     * @return {Camera}
     */

  }, {
    key: "getMouseCaptor",
    value: function getMouseCaptor() {
      return this.captors.mouse;
    }
    /**
     * Method used to resize the renderer.
     *
     * @param  {number} width  - Target width.
     * @param  {number} height - Target height.
     * @return {WebGLRenderer}
     */

  }, {
    key: "resize",
    value: function resize(width, height) {
      var previousWidth = this.width,
          previousHeight = this.height;

      if (arguments.length > 1) {
        this.width = width;
        this.height = height;
      } else {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
      }

      if (this.width === 0) throw new Error('sigma/renderers/webgl: container has no width.');
      if (this.height === 0) throw new Error('sigma/renderers/webgl: container has no height.'); // If nothing has changed, we can stop right here

      if (previousWidth === this.width && previousHeight === this.height) return this; // Sizing dom elements

      for (var id in this.elements) {
        var element = this.elements[id];
        element.style.width = this.width + 'px';
        element.style.height = this.height + 'px';
      } // Sizing contexts


      for (var _id in this.contexts) {
        var context = this.contexts[_id]; // Canvas contexts

        if (context.scale) {
          this.elements[_id].setAttribute('width', this.width * PIXEL_RATIO + 'px');

          this.elements[_id].setAttribute('height', this.height * PIXEL_RATIO + 'px');

          if (PIXEL_RATIO !== 1) context.scale(PIXEL_RATIO, PIXEL_RATIO);
        } // WebGL contexts
        else {
            this.elements[_id].setAttribute('width', this.width * WEBGL_OVERSAMPLING_RATIO + 'px');

            this.elements[_id].setAttribute('height', this.height * WEBGL_OVERSAMPLING_RATIO + 'px');
          }

        if (context.viewport) {
          context.viewport(0, 0, this.width * WEBGL_OVERSAMPLING_RATIO, this.height * WEBGL_OVERSAMPLING_RATIO);
        }
      }

      return this;
    }
    /**
     * Method used to clear the canvases.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "clear",
    value: function clear() {
      // NOTE: don't need to clear with preserveDrawingBuffer to false
      // let context = this.contexts.nodes;
      // context.clear(context.COLOR_BUFFER_BIT);
      // context = this.contexts.edges;
      // context.clear(context.COLOR_BUFFER_BIT);
      var context = this.contexts.labels;
      context.clearRect(0, 0, this.width, this.height); // context = this.contexts.hovers;
      // context.clearRect(0, 0, this.width, this.height);

      return this;
    }
    /**
     * Method used to render.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "render",
    value: function render() {
      // If a render was scheduled, we cancel it
      if (this.renderFrame) {
        cancelAnimationFrame(this.renderFrame);
        this.renderFrame = null;
        this.needToProcess = false;
        this.needToSoftProcess = false;
      } // If we have no nodes we can stop right there


      if (!this.graph.order) return this; // TODO: improve this heuristic or move to the captor itself?

      var moving = this.camera.isAnimated() || this.captors.mouse.isMoving || this.captors.mouse.hasDragged || this.captors.mouse.wheelLock; // First we need to resize

      this.resize(); // Clearing the canvases

      this.clear(); // Then we need to extract a matrix from the camera

      var cameraState = this.camera.getState(),
          cameraMatrix = (0, _utils3.matrixFromCamera)(cameraState, {
        width: this.width,
        height: this.height
      });
      var program; // Drawing nodes

      program = this.nodePrograms.def;
      program.render({
        matrix: cameraMatrix,
        width: this.width,
        height: this.height,
        ratio: cameraState.ratio,
        nodesPowRatio: 0.5,
        scalingRatio: WEBGL_OVERSAMPLING_RATIO
      }); // Drawing edges

      if (!this.settings.hideEdgesOnMove || !moving) {
        program = this.edgePrograms.def;
        program.render({
          matrix: cameraMatrix,
          width: this.width,
          height: this.height,
          ratio: cameraState.ratio,
          nodesPowRatio: 0.5,
          edgesPowRatio: 0.5,
          scalingRatio: WEBGL_OVERSAMPLING_RATIO
        });
      } // Do not display labels on move per setting


      if (this.settings.hideLabelsOnMove && moving) return this; // Finding visible nodes to display their labels

      var visibleNodes;

      if (cameraState.ratio >= 1) {
        // Camera is unzoomed so no need to ask the quadtree for visible nodes
        visibleNodes = this.graph.nodes();
      } else {
        // Let's ask the quadtree
        var viewRectangle = this.camera.viewRectangle(this);
        visibleNodes = this.quadtree.rectangle(viewRectangle.x1, 1 - viewRectangle.y1, viewRectangle.x2, 1 - viewRectangle.y2, viewRectangle.height);
      }

      if (!this.settings.renderLabels) return this; // Selecting labels to draw

      var labelsToDisplay = (0, _labels.labelsToDisplayFromGrid)({
        cache: this.nodeDataCache,
        camera: this.camera,
        displayedLabels: this.displayedLabels,
        visibleNodes: visibleNodes,
        dimensions: this,
        graph: this.graph
      }); // Drawing labels
      // TODO: POW RATIO is currently default 0.5 and harcoded

      var context = this.contexts.labels;
      var sizeRatio = Math.pow(cameraState.ratio, 0.5);

      for (var i = 0, l = labelsToDisplay.length; i < l; i++) {
        var data = this.nodeDataCache[labelsToDisplay[i]];

        var _this$camera$graphToV = this.camera.graphToViewport(this, data.x, data.y),
            x = _this$camera$graphToV.x,
            y = _this$camera$graphToV.y; // TODO: we can cache the labels we need to render until the camera's ratio changes


        var size = data.size / sizeRatio; // TODO: this is the label threshold hardcoded
        // if (size < 8)
        //   continue;

        (0, _label.default)(context, {
          label: data.label,
          size: size,
          x: x,
          y: y
        }, this.settings);
      } // Caching visible nodes and displayed labels


      this.displayedLabels = new Set(labelsToDisplay); // Rendering highlighted nodes

      this.renderHighlightedNodes();
      return this;
    }
    /**
     * Method used to render the highlighted nodes.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "renderHighlightedNodes",
    value: function renderHighlightedNodes() {
      var _this5 = this;

      var camera = this.camera;
      var sizeRatio = Math.pow(camera.getState().ratio, 0.5);
      var context = this.contexts.hovers; // Clearing

      context.clearRect(0, 0, this.width, this.height); // Rendering

      var render = function render(node) {
        var data = _this5.nodeDataCache[node];

        var _camera$graphToViewpo = camera.graphToViewport(_this5, data.x, data.y),
            x = _camera$graphToViewpo.x,
            y = _camera$graphToViewpo.y;

        var size = data.size / sizeRatio;
        (0, _hover.default)(context, {
          label: data.label,
          color: data.color,
          size: size,
          x: x,
          y: y
        }, _this5.settings);
      };

      if (this.hoveredNode) render(this.hoveredNode);
      this.highlightedNodes.forEach(render);
    }
    /**
     * Method used to schedule a render.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "scheduleRender",
    value: function scheduleRender() {
      var _this6 = this;

      // A frame is already scheduled
      if (this.renderFrame) return this; // Let's schedule a frame

      this.renderFrame = requestAnimationFrame(function () {
        // Do we need to process data?
        if (_this6.needToProcess || _this6.needToSoftProcess) _this6.process(_this6.needToSoftProcess); // Resetting state

        _this6.renderFrame = null;
        _this6.needToProcess = false;
        _this6.needToSoftProcess = false; // Rendering

        _this6.render();
      });
    }
    /**
     * Method used to schedule a hover render.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "scheduleHighlightedNodesRender",
    value: function scheduleHighlightedNodesRender() {
      var _this7 = this;

      if (this.renderHighlightedNodesFrame || this.renderFrame) return this;
      this.renderHighlightedNodesFrame = requestAnimationFrame(function () {
        // Resetting state
        _this7.renderHighlightedNodesFrame = null; // Rendering

        _this7.renderHighlightedNodes();
      });
    }
    /**
     * Method used to manually refresh.
     *
     * @return {WebGLRenderer}
     */

  }, {
    key: "refresh",
    value: function refresh() {
      this.needToSoftProcess = true;
      this.scheduleRender();
      return this;
    }
    /**
     * Method used to highlight a node.
     *
     * @param  {string} key - The node's key.
     * @return {WebGLRenderer}
     */

  }, {
    key: "highlightNode",
    value: function highlightNode(key) {
      // TODO: check the existence of the node
      // TODO: coerce?
      this.highlightedNodes.add(key); // Rendering

      this.scheduleHighlightedNodesRender();
      return this;
    }
    /**
     * Method used to unhighlight a node.
     *
     * @param  {string} key - The node's key.
     * @return {WebGLRenderer}
     */

  }, {
    key: "unhighlightNode",
    value: function unhighlightNode(key) {
      // TODO: check the existence of the node
      // TODO: coerce?
      this.highlightedNodes.delete(key); // Rendering

      this.scheduleHighlightedNodesRender();
      return this;
    }
    /**
     * Method used to shut the container & release event listeners.
     *
     * @return {undefined}
     */

  }, {
    key: "kill",
    value: function kill() {
      var graph = this.graph; // Releasing camera handlers

      this.camera.removeListener('updated', this.listeners.camera); // Releasing DOM events & captors

      window.removeEventListener('resize', this.listeners.handleResize);
      this.captors.mouse.kill(); // Releasing graph handlers

      graph.removeListener('nodeAdded', this.listeners.graphUpdate);
      graph.removeListener('nodeDropped', this.listeners.graphUpdate);
      graph.removeListener('nodeAttributesUpdated', this.listeners.softGraphUpdate);
      graph.removeListener('edgeAdded', this.listeners.graphUpdate);
      graph.removeListener('nodeDropped', this.listeners.graphUpdate);
      graph.removeListener('edgeAttributesUpdated', this.listeners.softGraphUpdate);
      graph.removeListener('cleared', this.listeners.graphUpdate); // Releasing cache & state

      this.quadtree = null;
      this.nodeDataCache = null;
      this.edgeDataCache = null;
      this.highlightedNodes = null;
      this.previousVisibleNodes = null;
      this.displayedLabels = null; // Clearing frames

      if (this.renderFrame) {
        cancelAnimationFrame(this.renderFrame);
        this.renderFrame = null;
      }

      if (this.renderHighlightedNodesFrame) {
        cancelAnimationFrame(this.renderHighlightedNodesFrame);
        this.renderHighlightedNodesFrame = null;
      } // Destroying canvases


      var container = this.container;

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  }]);

  return WebGLRenderer;
}(_renderer.default);

exports.default = WebGLRenderer;