var sharedb = require('sharedb/lib/client');
var StringBinding = require('sharedb-string-binding');

var CodeMirrorBinding = require('../index');
var CodeMirror = require('codemirror')

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

// Set up a CodeMirror instance.
var codeMirrorTextarea = document.querySelector('#codemirror-test')
var codeMirror = CodeMirror.fromTextArea(codeMirrorTextarea, {
  lineNumbers: true
});

// Create local Doc instance mapped to 'examples' collection document with id 'textarea'
var doc = connection.get('examples', 'textarea');
doc.subscribe(function(err) {
  if (err) throw err;

  // Set up the textarea with StringBinding.
  var element = document.querySelector('textarea');
  var stringBinding = new StringBinding(element, doc);
  stringBinding.setup();

  // Set up the CodeMirror binding.
  var codeMirrorBinding = new CodeMirrorBinding(codeMirror, doc);
  codeMirrorBinding.setup();

  setInterval(function () {
    doc.submitOp({ p:[5], si: 'd' });
  }, 1000);
});
