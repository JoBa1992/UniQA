'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
	if (!process.env[name]) {
		throw new Error('You must set the ' + name + ' environment variable');
	}
	return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
	env: process.env.NODE_ENV,

	TZ: 'europe/london',

	// Root path of server
	root: path.normalize(__dirname + '/../../..'),

	// Server port
	port: process.env.PORT || 8080,

	// Server IP
	ip: process.env.IP || '0.0.0.0',

	// Need to rip out when in production
	seedDB: true,

	// Secret for session, you will want to change this and make it an environment variable
	secrets: {
		session: 'UniQA-secret'
	},

	// List of user roles
	userRoles: ['admin', 'tutor', 'student'],

	// MongoDB connection options
	mongo: {
		options: {
			db: {
				safe: true
			}
		}
	}
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
	all,
	require('./' + process.env.NODE_ENV + '.js') || {});