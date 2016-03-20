'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SessionSchema = new Schema({
	lecture: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Lecture'
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
		default: 10
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
		question: {
			type: String
		},
		time: {
			type: Date
		},
		anon: {
			type: Boolean,
			default: false
		},
		response: {
			tutor: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			body: {
				type: String,
				max: 255
			}
		}
	}],
	feedback: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		rating: {
			type: String,
			required: true
		},
		comment: {
			type: String
		},
		_id: false
	}],
	downloads: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		file: {
			type: mongoose.Schema.Types.ObjectId
		}
	}]
});

module.exports = mongoose.model('Session', SessionSchema);