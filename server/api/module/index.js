'use strict';

var express = require('express');
var controller = require('./module.controller');

var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');

var uuid = require('uuid');

// attaches file/s into temp folder with temp name. onSucces files are unlinked.
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		var tempLocation = path.join(__dirname, '../../storage/modules/temp/');
		// gen temp id
		file.newId = uuid.v4() + '.csv';
		mkdirp(tempLocation, function(err) {
			if (err) {
				console.log(err);
			}
			cb(null, path.join(__dirname, '../../storage/modules/temp'));
		});
	},
	filename: function(req, file, cb) {
		cb(null, file.newId);
	}
});

var upload = multer({
	storage: storage
});

var router = express.Router();

router.get('/', controller.index);
router.post('/users/import', upload.any(), controller.convertCsvToJSON);
// used to return tutors part of same software groups
router.get('/user/:userid', controller.getForMe);
router.get('/user/:userid/unassoc', controller.getNotForMe);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;