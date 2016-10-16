'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var IssueSchema = new Schema({
	raisedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	url: {
		type: String,
		required: true
	},
	body: {
		type: String,
		required: true
	},
	fixed: {
		state: Boolean,
		reply: {
			type: String
		}
	}
});

module.exports = mongoose.model('Issue', IssueSchema);