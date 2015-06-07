var Transform = require('./transform');
var CodeAnalysis = require('./code-analysis');

var Controller = function(Layout) {
  var self = this;

  this.state = null;
  this.markers = [];
  this.canvas = null;
  this.editorPointerEvents = null;

  this.activate = function() {
    console.log('Activating show');
    if(!self.state)
    self._getCurrentEditors(self._initializeState);
    else
      self._advanceState();
  };

  this.select = function() {
    console.log('Select() event @ show');
    self.deactivate();
  };

  this.deactivate = function() {
    console.log('Deactivating show');
    self.state = null;
    self._dropMarkers();
    if(self.canvas)
      self.canvas.parentNode.removeChild(self.canvas);

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
  };

  this._showArrowsPanel = function() {
    var canvas = document.createElement('canvas');
    var e = self.state.editors[self.state.current].element;
    var rect = e.getBoundingClientRect();

    var pane = atom.workspace.getActivePane();
    var paneView = atom.views.getView(pane);

    canvas.style.width = Math.floor(rect.left + 1) + 'px';
    canvas.style.height = ( 20 + pane.getActiveEditor().getHeight() ) + 'px';
    canvas.style['background-color'] = '#0000';
    canvas.style['z-index'] = 2000;
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';

    paneView.appendChild(canvas);
    self.canvas = canvas;

    var editor = atom.workspace.getActiveTextEditor();
    var cursor = editor.getLastCursor();
    // console.log(self._lineCoordinates(editor, cursor.getScreenPosition()[0]));
  };

  this._lineCoordinates = function(editor, lineNo) {
    var view = atom.views.getView(editor);
    // console.log(view.childNodes);
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
      transform.scale = .35;
      transform.translate = [ Math.floor(width * Math.cos(phiRad) / 2), 0, 100 + Math.floor(width * Math.sin(phiRad) / 2) ];
      if(effectiveIndex == 0)
        transform.translate[0] -= Math.floor(width / 2);
      transform.rotate = [0, phi, 0];
      transform.zIndex = 1000 - Math.floor(100*Math.sin(phiRad));
      transform.opacity = 1;
      transform.zoom = 2;
      
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
};

module.exports.Controller = Controller;
