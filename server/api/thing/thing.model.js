'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: Array,
    default: []
  },
  active: Boolean
});

module.exports = mongoose.model('Thing', ThingSchema);