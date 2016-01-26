'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var GroupSchema = new Schema({
  course: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  // subdep: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Department',
  //   unique: true
  // },
  users: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true
    },
    _id: false
  }],
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Group', GroupSchema);