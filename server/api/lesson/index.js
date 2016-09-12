'use strict';

var express = require('express');

var auth = require('../../auth/auth.service');

var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');

// attaches files into temp folder, on route these are redirected into
// their associated folder
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		var tempLocation = path.join(__dirname, '../../storage/lessons/temp/');
		mkdirp(tempLocation, function(err) {
			if (err) {
				console.log(err);
			}
			cb(null, path.join(__dirname, '../../storage/lessons/temp'));
		});
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});

var upload = multer({
	storage: storage
});

var controller = require('./lesson.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/files', upload.any(), controller.attachFiles);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.patch('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;