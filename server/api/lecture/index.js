'use strict';

var express = require('express');
var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');

// attaches files into temp folder, on route these are redirected into
// their associated folder
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		var tempLocation = path.join(__dirname, '../../storage/lectures/temp/');
		mkdirp(tempLocation, function(err) {
			if (err) {
				console.log(err);
			}
			cb(null, path.join(__dirname, '../../storage/lectures/temp'));
		});
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});

var upload = multer({
	storage: storage
});

var controller = require('./lecture.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', controller.index);
// router.post('/preview', controller.generatePreview);
router.get('/count', controller.count);
router.post('/files/:id', upload.any(), controller.attachFiles); // file uploading for lecture
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.get('/:id', controller.show);
router.post('/', controller.create);

router.patch('/:id', controller.update);


module.exports = router;