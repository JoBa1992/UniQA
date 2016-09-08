'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ModuleGroupSchema = new Schema({
	ref: {
		// eg Group 2a, optional
		type: String
	},
	students: [{
		user: {
			type: String,
			ref: 'User'
		},
		_id: false
	}],
	deleted: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('ModuleGroup', ModuleGroupSchema);