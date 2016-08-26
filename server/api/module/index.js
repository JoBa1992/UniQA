'use strict';

var express = require('express');
var controller = require('./module.controller');

var router = express.Router();

router.get('/', controller.index);
// used to return tutors part of same software groups
router.get('/assoc/:userid', controller.getAssocUsers);
router.get('/user/:userid', controller.getForMe);
router.get('/user/:userid/unassoc', controller.getNotForMe);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;