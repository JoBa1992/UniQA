/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var module = require('./module.model');

exports.register = function(socket) {
	module.schema.post('save', function(doc) {
		onSave(socket, doc);
	});
	module.schema.post('remove', function(doc) {
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	socket.emit('module:save', doc);
}

function onRemove(socket, doc, cb) {
	socket.emit('module:remove', doc);
}