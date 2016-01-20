'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  subdepartments: [String],
  deleted: Boolean
});

module.exports = mongoose.model('DepartmentSchema', DepartmentSchema);