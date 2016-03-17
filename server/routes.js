/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var express = require('express');

module.exports = function(app) {


	// serve static images, need to make this more secure, but its only screenshots/attachments
	app.use('/api/storage', express.static(__dirname + '/storage'));

	// Insert routes below
	app.use('/api/comments', require('./api/comment'));
	app.use('/api/things', require('./api/thing'));
	app.use('/api/users', require('./api/user'));
	app.use('/api/groups', require('./api/group'));
	// app.use('/api/departments', require('./api/department'));
	app.use('/api/lectures', require('./api/lecture'));
	app.use('/api/sessions', require('./api/session'));

	app.use('/auth', require('./auth'));

	// All undefined asset or api routes should return a 404
	app.route('/:url(api|auth|components|app|bower_components|assets)/*')
		.get(errors[404]);

	// All other routes should redirect to the index.html
	app.route('/*')
		.get(function(req, res) {
			res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
		});
};