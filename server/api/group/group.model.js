'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var GroupSchema = new Schema({
	course: {
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

module.exports = mongoose.model('Group', GroupSchema);