'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SessionSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	// needs to handle modules/module groups, but allowing it to contain
	// just groups means we can handle this on the front end
	groups: [{
		moduleGroup: {
			type: Schema.Types.ObjectId,
			ref: 'ModuleGroup'
		},
		_id: false
	}],
	lesson: {
		type: Schema.Types.ObjectId,
		ref: 'Lesson'
	},
	// reference is optional, (e.g. week 4 catch-up, etc.)
	reference: {
		type: String,
		default: null
	},
	// runtime is an array of start and end times.
	// when creating a session, they can setup multiple runtimes to allow them
	// the possibility of booking against an entire module to attain their attendance record
	runTime: [{
		start: Date,
		end: Date,
	}],
	qr: { // generated
		url: String,
		svg: String
	},
	altAccess: { // generated
		type: String,
		default: null,
		lowercase: true, // makes it easier to diff i from l in-app
		max: 6
	},
	registered: [{
		user: {
			type: Schema.Types.ObjectId,
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
			type: Schema.Types.ObjectId,
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
				type: Schema.Types.ObjectId,
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
			type: Schema.Types.ObjectId,
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
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		file: {
			type: Schema.Types.ObjectId
		}
	}]
});

module.exports = mongoose.model('Session', SessionSchema);