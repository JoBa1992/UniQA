'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ModuleSchema = new Schema({
	code: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	groups: [{
		group: {
			type: Schema.Types.ObjectId,
			ref: 'ModuleGroup'
		},
		_id: false
	}],
	tutors: [{
		user: {
			type: String,
			ref: 'User',
		},
		_id: false
	}],
	deleted: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Module', ModuleSchema);