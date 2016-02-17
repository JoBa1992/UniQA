'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	subdepartment: [{
		name: {
			type: String
		},
		groups: [{
			course: {
				type: String,
				required: true,
			},
			name: {
				type: String,
				required: true
			},
			users: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			}],
			tutors: [{
				tutor: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				_id: false
			}],
			deleted: {
				type: Boolean,
				default: false
			}
		}],
	}],
	deleted: Boolean
});

module.exports = mongoose.model('Department', DepartmentSchema);