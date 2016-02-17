/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var department = require('./department.model');

exports.register = function(socket) {
	department.schema.post('save', function(doc) {
		onSave(socket, doc);
	});
	department.schema.post('remove', function(doc) {
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	socket.emit('department:save', doc);
}

function onRemove(socket, doc, cb) {
	socket.emit('department:remove', doc);
}