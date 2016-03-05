'use strict';

var express = require('express');
var controller = require('./session.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/count', auth.isAuthenticated(), controller.count);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:userid/getnextfour', auth.isAuthenticated(), controller.getNextFour);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/:id/question', auth.isAuthenticated(), controller.getQuestions);
router.post('/:id/question' /*, auth.isAuthenticated()*/ , controller.addQuestion);

router.post('/:id/feedback' /*, auth.isAuthenticated()*/ , controller.addFeedback);
router.get('/:id/feedback/:userid' /*, auth.isAuthenticated()*/ , controller.getFeedback);
router.put('/:id/register/:userid' /*, auth.isAuthenticated()*/ , controller.registerUser);
// router.put('/:id/feedback/:userid' /*, auth.isAuthenticated()*/ , controller.updateFeedback);


module.exports = router;