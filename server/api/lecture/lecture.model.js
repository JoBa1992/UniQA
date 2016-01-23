'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LectureSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    default: null
  },
  startTime: Date,
  endTime: Date,
  qActiveAllowance: {
    type: Number,
    min: 0,
    max: 60,
    default: 10,
    required: true
  }
});

module.exports = mongoose.model('Lecture', LectureSchema);