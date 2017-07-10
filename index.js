// This file began as a copy of https://github.com/share/sharedb-string-binding/blob/master/index.js
var TextDiffBinding = require('./textDiffCodeMirrorBinding');

function CodeMirrorBinding(codeMirror, doc, path) {
  TextDiffBinding.call(this, codeMirror);
  this.doc = doc;
  this.path = path || [];
  this._opListener = null;
  this._inputListener = null;
}
CodeMirrorBinding.prototype = Object.create(TextDiffBinding.prototype);
CodeMirrorBinding.prototype.constructor = CodeMirrorBinding;

CodeMirrorBinding.prototype.setup = function() {
  this.update();
  this.attachDoc();
  this.attachElement();
};

CodeMirrorBinding.prototype.destroy = function() {
  this.detachElement();
  this.detachDoc();
};

CodeMirrorBinding.prototype.attachElement = function() {
  var binding = this;
  this._inputListener = function() {
    console.log("HERE")
    binding.onInput();
  };
  this.codeMirror.on('change', this._inputListener);
};

CodeMirrorBinding.prototype.detachElement = function() {
  this.codeMirror.off('change', this._inputListener);
};

CodeMirrorBinding.prototype.attachDoc = function() {
  var binding = this;
  this._opListener = function(op, source) {
    binding._onOp(op, source);
  };
  this.doc.on('op', this._opListener);
};

CodeMirrorBinding.prototype.detachDoc = function() {
  this.doc.removeListener('op', this._opListener);
};

CodeMirrorBinding.prototype._onOp = function(op, source) {
  if (source === this) return;
  if (op.length === 0) return;
  if (op.length > 1) {
    throw new Error('Op with multiple components emitted');
  }
  var component = op[0];
  if (isSubpath(this.path, component.p)) {
    this._parseInsertOp(component);
    this._parseRemoveOp(component);
  } else if (isSubpath(component.p, this.path)) {
    this._parseParentOp();
  }
};

CodeMirrorBinding.prototype._parseInsertOp = function(component) {
  if (!component.si) return;
  var index = component.p[component.p.length - 1];
  var length = component.si.length;
  this.onInsert(index, length);
};

CodeMirrorBinding.prototype._parseRemoveOp = function(component) {
  if (!component.sd) return;
  var index = component.p[component.p.length - 1];
  var length = component.sd.length;
  this.onRemove(index, length);
};

CodeMirrorBinding.prototype._parseParentOp = function() {
  this.update();
};

CodeMirrorBinding.prototype._get = function() {
  var value = this.doc.data;
  for (var i = 0; i < this.path.length; i++) {
    var segment = this.path[i];
    value = value[segment];
  }
  return value;
};

CodeMirrorBinding.prototype._insert = function(index, text) {
  var path = this.path.concat(index);
  var op = {p: path, si: text};
  this.doc.submitOp(op, {source: this});
};

CodeMirrorBinding.prototype._remove = function(index, text) {
  var path = this.path.concat(index);
  var op = {p: path, sd: text};
  this.doc.submitOp(op, {source: this});
};

function isSubpath(path, testPath) {
  for (var i = 0; i < path.length; i++) {
    if (testPath[i] !== path[i]) return false;
  }
  return true;
}

module.exports = CodeMirrorBinding;
