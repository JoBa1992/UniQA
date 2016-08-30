'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var LectureSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		required: true
	},
	desc: {
		type: String,
		default: null
	},
	collaborators: [{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		_id: false
	}],
	url: {
		type: String
	},
	attachments: [{
		url: {
			type: String
		},
		loc: {
			type: String
		},
		type: {
			type: String,
			default: 'fa-file-o'
		} //,
		// desc: {
		// 	type: String
		// }
	}]
});

module.exports = mongoose.model('Lecture', LectureSchema);