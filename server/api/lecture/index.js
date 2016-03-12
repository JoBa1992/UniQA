'use strict';

var express = require('express');
var controller = require('./lecture.controller');
var config = require('../../config/environment');

var router = express.Router();


router.get('/', controller.index);
router.post('/preview', controller.generatePreview);
router.get('/count', controller.count);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.get('/:id', controller.show);
router.post('/', controller.create);
router.patch('/:id', controller.update);


module.exports = router;