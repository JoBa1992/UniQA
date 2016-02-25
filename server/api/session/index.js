'use strict';

var express = require('express');
var controller = require('./session.controller');
var config = require('../../config/environment');

var router = express.Router();


router.get('/', controller.index);
router.get('/count', controller.count);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.get('/:id/question', controller.getQuestions);
router.post('/:id/question', controller.addQuestion);
// router.patch('/:id', controller.update);


module.exports = router;