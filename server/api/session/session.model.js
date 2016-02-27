'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SessionSchema = new Schema({
	lecture: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Lecture',
		required: true
	},
	startTime: Date,
	endTime: Date,
	started: {
		type: Boolean,
		default: false
	},
	qr: {
		url: String,
		svg: String
	},
	altAccess: {
		type: String,
		default: null,
		max: 6
	},
	timeAllowance: {
		type: Number,
		min: 0,
		max: 60,
		default: 10,
		required: true
	},
	registered: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		_id: false
	}],
	groups: [{
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group'
		},
		_id: false
	}],
	questions: [{
		asker: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		request: {
			type: String
		},
		time: {
			type: Date
		},
		anon: {
			type: Boolean,
			default: false
		}
	}],
	feedback: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		rating: {
			type: String
		},
		comment: {
			type: Date
		}
	}],
});

module.exports = mongoose.model('Session', SessionSchema);