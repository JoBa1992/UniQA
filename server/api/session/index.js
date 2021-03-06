'use strict';

var express = require('express');
var controller = require('./session.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/download/:sessionid/:userid/:lectureid/:fileid', auth.isAuthenticated(), controller.getFile)

router.put('/register/:userid', auth.isAuthenticated(), controller.registerUser);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id/permDelete', auth.isAuthenticated(), controller.destroy);
router.delete('/:id', auth.isAuthenticated(), controller.softDelete);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id/undoDelete', auth.isAuthenticated(), controller.undoDelete);

router.get('/:id/question' /*, auth.isAuthenticated()*/ , controller.getQuestions);
router.post('/:id/question' /*, auth.isAuthenticated()*/ , controller.addQuestion);

router.post('/:id/feedback', auth.isAuthenticated(), controller.addFeedback);

// router.get('/:id/feedback/:userid' ,auth.isAuthenticated(), controller.getFeedback);
// router.put('/:id/feedback/:userid' ,auth.isAuthenticated(), controller.updateFeedback);

module.exports = router;