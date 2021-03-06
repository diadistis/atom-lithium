var Transform = require('./transform');
var CodeAnalysis = require('./code-analysis');

var Controller = function(Layout) {
  var self = this;

  this.state = null;
  this.markers = [];

  this.activate = function() {
    console.log('Activating browser');
    if(!self.state)
      self._getCurrentEditors(self._initializeState);
    else
      self._advanceState();
  };

  this.select = function() {
    console.log('Select() event @ browser');
    atom.workspace.open(self.state.editors[self.state.current].editor.buffer.file.path);
    self.deactivate();
  };

  this.deactivate = function() {
    console.log('Deactivating browser');
    self.state = null;
    self._dropMarkers();
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

    console.log('Initializing browser state');
    self.state = {
      editors: [],
      current: 0
    };

    Layout.ensureEditorsAreBuilt();

    var pane = editors[0].editor;
    var width = pane.getWidth();
    var height = pane.getHeight();
    var scale = .9;
    var Dx = Math.floor(scale * (width / 2) * (1 - Math.cos(30)));
    var Dy = Math.floor(scale * (height / 4) * Math.cos(10));

    editors.forEach(function(editorObj, index) {
      var editor = editorObj.editor;
      var element = atom.views.getView(editor);
      var id = Layout.getRenderer().addEditor(element);
      var transform = Layout.getRenderer().getTransform(id);
      transform.reset();

      transform.rotate = [ -10, 30, 0 ];
      transform.translate = [
        Dx - index * Dx / editors.length,
        -Dy + 1.2 * index * Dy / editors.length,
        -index * 200 ];
      transform.depth = 600;
      transform.scale = scale;
      // transform.zoom = 1.5;
      transform.opacity = Math.min(1, Math.max(.5, 1.2 * (editors.length - index) / editors.length));
      transform.zIndex = 10 * (editors.length - index);

      self.state.editors.push({
        id: id,
        editor: editor,
        element: element,
        transform: transform,
        ranges: editorObj.ranges
      });
    });

    self._markActiveEditor();

    Layout.getRenderer().enable();
  };

  this._advanceState = function() {
    console.log('Advancing browser state');
    var previousTransform = new Transform();
    var tmp = new Transform();
    previousTransform.copyFrom(self.state.editors[self.state.editors.length-1].transform);

    for(var i = 0; i < self.state.editors.length; ++i) {
      var current = self.state.editors[i].transform;
      self.state.editors[i].element.style['pointer-events'] = 'none';
      tmp.copyFrom(current);
      current.copyFrom(previousTransform);
      previousTransform.copyFrom(tmp);
    }

    self.state.current++;
    self.state.current %= self.state.editors.length;

    self._dropMarkers();
    self._markActiveEditor();

    Layout.getRenderer().restoreSingleAttribute(self.state.editors[self.state.current].id, 'pointer-events');
    Layout.getRenderer().refresh();
  };

  this._markActiveEditor = function() {
    var editorObj = self.state.editors[self.state.current];
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
