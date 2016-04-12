'use strict';

var express = require('express');
var controller = require('./session.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/' /*, auth.isAuthenticated()*/ , controller.index);
router.post('/' /*, auth.isAuthenticated()*/ , controller.create);
router.get('/download/:sessionid/:userid/:lectureid/:fileid' /* /*, auth.isAuthenticated()*/ , controller.getFile)
router.get('/count' /*, auth.isAuthenticated()*/ , controller.count);
router.put('/register/:userid' /* /*, auth.isAuthenticated()*/ , controller.registerUser);
router.put('/:id' /*, auth.isAuthenticated()*/ , controller.update);
router.delete('/:id' /*, auth.isAuthenticated()*/ , controller.destroy);
router.get('/:id' /*, auth.isAuthenticated()*/ , controller.show);
router.get('/:userid/getnextfour/tutor' /*, auth.isAuthenticated()*/ , controller.getNextFourTutor);
// router.get('/:userid/getnext/student' /*, auth.isAuthenticated()*/, controller.getNextStudent);

router.get('/:id/question' /*, auth.isAuthenticated()*/ , controller.getQuestions);
router.post('/:id/question' /*, auth.isAuthenticated()*/ , controller.addQuestion);

router.post('/:id/feedback' /*, auth.isAuthenticated()*/ , controller.addFeedback);
// router.get('/:id/feedback/:userid' /*, auth.isAuthenticated()*/ , controller.getFeedback);
// router.put('/:id/feedback/:userid' /*, auth.isAuthenticated()*/ , controller.updateFeedback);


module.exports = router;