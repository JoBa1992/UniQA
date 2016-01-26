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
  },
  attachments: {
    type: [String],
    default: []
  },
  qr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Qr',
    default: null
  },
  altAccess: {
    type: String,
    default: null,
    max: 6
  }
});

module.exports = mongoose.model('Lecture', LectureSchema);