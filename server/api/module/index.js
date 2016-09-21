'use strict';

var express = require('express');
var controller = require('./module.controller');

var auth = require('../../auth/auth.service');

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

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/user/:userid', auth.isAuthenticated(), controller.getModulesForUser);
// not the users - used for exploring
router.get('/user/:userid/unassoc', auth.isAuthenticated(), controller.getOtherModules);

router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;