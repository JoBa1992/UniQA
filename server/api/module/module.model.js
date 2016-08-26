'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ModuleSchema = new Schema({
	course: {
		type: String,
		required: true
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
	level: {
		type: Number,
		min: 4,
		max: 7
	},
	deleted: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Module', ModuleSchema);