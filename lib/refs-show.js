var Transform = require('./transform');
var CodeAnalysis = require('./code-analysis');

var Controller = function(Layout) {
  var self = this;

  this.state = null;
  this.markers = [];
  this.canvas = null;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.editorPointerEvents = null;
  this.fromPoint = null;

  this.activate = function() {
    console.log('Activating show');
    if(!self.state)
    self._getCurrentEditors(self._initializeState);
    else
      self._advanceState();
  };

  this.select = function() {
    console.log('Select() event @ show');
    atom.workspace.open(self.state.editors[self.state.current].editor.buffer.file.path);
    self.deactivate();
  };

  this.deactivate = function() {
    console.log('Deactivating show');
    self.state = null;
    self._dropMarkers();
    if(self.canvas) {
      self.canvas.parentNode.removeChild(self.canvas);
      self.canvas = null;
    }

    var editor = atom.workspace.getActiveTextEditor();
    var editorView = atom.views.getView(editor);
    editorView.style['pointer-events'] = self.editorPointerEvents;

    Layout.getRenderer().disable();
  };

  this._dropMarkers = function() {
    self.markers.forEach(function(d){d.destroy();});
    self.markers = [];
  };

  this._getCurrentEditors = function(callback) {
    var pRefs = CodeAnalysis.getReferences();
    if(!pRefs)
      return;

    pRefs.then(function(refs) {
      if(!refs)
        return;

      var result = [];
      refs.forEach(function(ref) {
        var editor = {
          editor: ref.editor,
          ranges: ref.nodes.map(function(node) { return [ node.loc.start.line - 1, node.loc.end.line - 1 ]; })
        };
        result.push(editor);
      });
      callback(result);
    });
  };

  this._initializeState = function(editors) {
    if(editors.length == 0) {
      return;
    }

    var editorsToShowCount = editors.filter(function(e) { return e.editor.id != atom.workspace.getActiveTextEditor().id; }).length;
    if(editorsToShowCount == 0) {
      return;
    }

    console.log('Initializing show state | editors = ', editorsToShowCount, editors.length);
    self.state = {
      editors: [],
      current: 0
    };

    var editor = atom.workspace.getActiveTextEditor();
    var editorView = atom.views.getView(editor);

    self.editorPointerEvents = editorView.style['pointer-events'];
    editorView.style['pointer-events'] = 'none';

    Layout.ensureEditorsAreBuilt();
    self._setupEditorsTransforms(editors, editorsToShowCount);
    Layout.getRenderer().enable();
    self._showArrowsPanel();
    self._drawPointersToActiveEditor();
  };

  this._showArrowsPanel = function() {
    var canvas = document.createElement('canvas');
    var e = self.state.editors[self.state.current].element;
    var rect = e.getBoundingClientRect();

    var pane = atom.workspace.getActivePane();
    var paneView = atom.views.getView(pane);

    self.canvasWidth = Math.floor(rect.left + 1);
    self.canvasHeight = 20 + pane.getActiveEditor().getHeight();

    canvas.setAttribute('width', self.canvasWidth + 'px');
    canvas.setAttribute('height', self.canvasHeight + 'px');
    canvas.style['z-index'] = 2000;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';

    paneView.appendChild(canvas);
    self.canvas = canvas;

    var editor = atom.workspace.getActiveTextEditor();
    var cursor = editor.getLastCursor();
    self.fromPoint = self._lineCoordinates(editor, cursor.getScreenPosition().row);
  };

  this._lineCoordinates = function(editor, lineNo) {
    var view = atom.views.getView(editor);
    var row = view.shadowRoot.querySelector('div[data-screen-row="'+lineNo+'"]');
    if(!row) return;
    var lineRect = row.getBoundingClientRect();
    return [ lineRect.left, lineRect.top ];
  };

  this._setupEditorsTransforms = function(editors, editorsToShowCount) {
    var pane = editors[0].editor;
    var width = pane.getWidth();
    var height = pane.getHeight();

    var indexDelta = 0;
    editors.forEach(function(editorObj, index) {
      var effectiveIndex = index + indexDelta;

      var editor = editorObj.editor;
      if(editor.id == atom.workspace.getActiveTextEditor().id) {
        indexDelta--;
        return;
      }

      var element = atom.views.getView(editor);
      var id = Layout.getRenderer().addEditor(element);
      var transform = Layout.getRenderer().getTransform(id);
      transform.reset();

      var phi = Math.floor(effectiveIndex * 360 / editorsToShowCount);
      var phiRad = Math.PI * phi / 360;
      transform.depth = 500;
      transform.scale = .6;
      transform.translate = [ Math.floor(width * Math.cos(phiRad) / 2), 0, 100 + Math.floor(width * Math.sin(phiRad) / 2) ];
      if(effectiveIndex == 0)
        transform.translate[0] -= Math.floor(width / 2);
      transform.rotate = [0, phi, 0];
      transform.zIndex = 1000 - Math.floor(100*Math.sin(phiRad));
      transform.opacity = 1;
      // transform.zoom = 2;

      var editorState = {
        id: id,
        editor: editor,
        element: element,
        transform: transform,
        ranges: editorObj.ranges
      };
      self.state.editors.push(editorState);

      self._markEditor(editorState);
    });
  };

  this._advanceState = function() {
    console.log('Advancing show state');
    var previousTransform = new Transform();
    var tmp = new Transform();
    previousTransform.copyFrom(self.state.editors[self.state.editors.length-1].transform);

    for(var i = 0; i < self.state.editors.length; ++i) {
      var current = self.state.editors[i].transform;
      self.state.editors[i].element.style['pointer-events'] = 'none';
      tmp.copyFrom(current);
      current.copyFrom(previousTransform);
      previousTransform.copyFrom(tmp);
      current.opacity = .65;
    }

    self.state.current++;
    self.state.current %= self.state.editors.length;

    self.state.editors[self.state.current].transform.opacity = 1;

    self._drawPointersToActiveEditor();
    Layout.getRenderer().refresh();
  };

  this._markEditor = function(editorObj) {
    var editor = editorObj.editor;

    editorObj.ranges.forEach(function(lineRange) {
      var mark = editor.markBufferRange([[lineRange[0], 0], [lineRange[1], 0]], {persistent:false});
      self.markers.push(mark);
      editor.decorateMarker(mark, { type: 'line', class: 'highlight-refs' });
      editor.scrollToBufferPosition([Math.floor((lineRange[0]+lineRange[1])/2),0], {center:true});
    });
  };

  this._drawPointersToActiveEditor = function() {
    var context = self.canvas.getContext("2d");
    // context.fillStyle = '#00000000';
    // context.fillRect(0,0,self.canvasWidth,self.canvasHeight);
    context.clearRect(0,0,self.canvasWidth,self.canvasHeight);

    console.log(self.fromPoint, [self.canvasWidth,self.canvasHeight]);

    context.beginPath();
    context.arc(50, self.fromPoint[1]+10, 8, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.stroke();

    var editor = self.state.editors[self.state.current].editor;
    self.state.editors[self.state.current].ranges.forEach(function(range) {
      var coords = self._lineCoordinates(editor, range[0]);
      if(coords) {
        context.beginPath();
        context.arc(Math.floor(1.1 * self.canvasWidth/2), Math.ceil(coords[1]), 8, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#003300';
        context.stroke();

        context.beginPath();
        context.moveTo(50, self.fromPoint[1]+10);
        context.quadraticCurveTo(50, Math.ceil(coords[1]), Math.floor(1.1 * self.canvasWidth/2), Math.ceil(coords[1]));
        context.strokeStyle = 'green';
        context.stroke();
      }
    });
  };
};

module.exports.Controller = Controller;
