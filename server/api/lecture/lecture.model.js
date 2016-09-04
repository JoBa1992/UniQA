'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var LectureSchema = new Schema({
	author: {
		type: String,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		required: true
	},
	collaborators: [{
		user: {
			type: String,
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
		}
	}]
});

module.exports = mongoose.model('Lecture', LectureSchema);