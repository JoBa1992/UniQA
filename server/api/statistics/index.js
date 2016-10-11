'use strict';

var express = require('express');
var controller = require('./statistics.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/module-attendence/:moduleid', auth.isAuthenticated(), controller.moduleAttendence);

module.exports = router;
