/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var qr = require('./qr.model');

exports.register = function(socket) {
	qr.schema.post('save', function(doc) {
		onSave(socket, doc);
	});
	qr.schema.post('remove', function(doc) {
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	socket.emit('qr:save', doc);
}

function onRemove(socket, doc, cb) {
	socket.emit('qr:remove', doc);
}