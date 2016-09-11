'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var LessonSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		required: true
	},
	// id of module to put the lecture against. Can be used purely for sorting.
	// Doesn't need to be input, and doesn't stop lessons being taught to
	// other modules.
	module: {
		type: Schema.Types.ObjectId,
		ref: 'Module'
	},
	desc: {
		type: String
	},
	collaborators: [{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		_id: false
	}],
	url: {
		// Optional, can also be an attachment marked with lessonSlides bool as true.
		// Used to determine what gets shown in the lesson
		type: String
	},
	attachments: [{
		url: {
			type: String
		},
		loc: {
			type: String
		},
		lessonSlides: {
			type: Boolean,
			default: false
		},
		type: {
			type: String,
			default: 'fa-file-o'
		}
	}]
});

module.exports = mongoose.model('Lesson', LessonSchema);