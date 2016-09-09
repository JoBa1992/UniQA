'use strict';

var express = require('express');
var controller = require('./moduleGroup.controller');

var auth = require('../../auth/auth.service');

var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');

var uuid = require('uuid');

// attaches file/s into temp folder with temp name. onSucces files are unlinked.
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		var tempLocation = path.join(__dirname, '../../storage/moduleGroup/temp/');
		// gen temp id
		file.newId = uuid.v4() + '.csv';
		mkdirp(tempLocation, function(err) {
			if (err) {
				console.log(err);
			}
			cb(null, path.join(__dirname, '../../storage/moduleGroup/temp'));
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

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/users/import', upload.any(), controller.convertCsvToJSON);
// used to return tutors part of same software groups
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;