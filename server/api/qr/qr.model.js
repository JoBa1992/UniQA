'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var QrSchema = new Schema({
  // lecture: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Lecture',
  //   require: true
  // },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  url: {
    type: String,
    default: null,
    lowercase: true
  },
  svg: {
    type: String,
    default: null
  },
  accessed: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: 1
  }
});

module.exports = mongoose.model('Qr', QrSchema);