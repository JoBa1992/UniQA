'use strict';

var Module = require('./module.model');

exports.register = function(socket) {
	Module.schema.post('save', function(doc) {
		onSave(socket, doc);
	});
	Module.schema.post('remove', function(doc) {
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	socket.emit('module:save', doc);
}

function onRemove(socket, doc, cb) {
	socket.emit('module:remove', doc);
}