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

// router.get('/', controller.index);
// router.post('/', controller.create);
// router.post('/:id/files', upload.any(), controller.attachFiles);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.destroy);
// router.get('/:id', controller.show);
// router.patch('/:id', controller.update);
// router.post('/:id/clone', controller.clone);

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/files', upload.any(), controller.attachFiles);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id/permDelete', auth.isAuthenticated(), controller.destroy);
router.delete('/:id', auth.isAuthenticated(), controller.softDelete);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id/undoDelete', auth.isAuthenticated(), controller.undoDelete);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.post('/:id/clone', auth.isAuthenticated(), controller.clone);

module.exports = router;
