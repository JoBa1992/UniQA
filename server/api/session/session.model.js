'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SessionSchema = new Schema({
	createdBy: {
		type: String,
		ref: 'User'
	},
	modules: [{
		module: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Module'
		},
		_id: false
	}],
	lecture: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Lecture'
	},
	reference: {
		type: String,
		default: null
	},
	startTime: Date,
	endTime: Date,
	qr: {
		url: String,
		svg: String
	},
	altAccess: {
		type: String,
		default: null,
		max: 6
	},
	registered: [{
		user: {
			type: String,
			ref: 'User'
		},
		_id: false
	}],
	questionsEnabled: {
		type: Boolean,
		default: true
	},
	feedbackEnabled: {
		type: Boolean,
		default: true
	},
	questions: [{
		asker: {
			type: String,
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
				type: String,
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
			type: String,
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
			type: String,
			ref: 'User'
		},
		file: {
			type: mongoose.Schema.Types.ObjectId
		}
	}]
});

module.exports = mongoose.model('Session', SessionSchema);