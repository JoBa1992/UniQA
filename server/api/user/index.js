'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin') || auth.hasRole('tutor'), controller.index);
router.get('/count', auth.hasRole('admin') || auth.hasRole('tutor'), controller.count);

router.put('/', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.hasRole('admin') || auth.hasRole('tutor'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.hasRole('admin') || auth.hasRole('tutor'), controller.create);
router.post('/authenticate', controller.registerUser);

module.exports = router;