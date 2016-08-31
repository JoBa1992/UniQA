'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ModuleSchema = new Schema({
	// implied _id
	_id: {
		type: String
	},
	name: {
		type: String
	},
	students: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		_id: false
	}],
	tutors: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
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