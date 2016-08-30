/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /lectures              ->  index
 * POST    /lectures              ->  create
 * GET     /lectures/:id          ->  show
 * PUT     /lectures/:id          ->  update
 * DELETE  /lectures/:id          ->  destroy
 */

// need to convert png image when its created/stored into base64 String, store it in QR collection, and can use this to decode on html side (hopefully!)
'use strict';

var Lecture = require('./lecture.model');
var Thing = require('../thing/thing.model');

var _ = require('lodash');
var async = require('async');
var rmdir = require('rimraf');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
// var Screenshot = require('url-to-screenshot');

function storeFile(id, name, file, cb) {
	var apiRoute = path.join('/api/storage/lectures/', String(id), '/', name);
	var dir = path.join(__dirname, '../../storage/lectures/', String(id), '/');
	var loc = path.join(__dirname, '../../storage/lectures/', String(id), '/', name);
	mkdirp(dir, function(err) {
		// path was created unless there was error
		fs.writeFileSync(loc, file);
		cb(apiRoute);
	});
}

// moves uploaded files from temporary to associated folder created
function moveFromTempToAssoc(tempLoc, newLoc, cb) {
	fs.rename(tempLoc, newLoc, function(err) {
		cb();
	});
}

// Get list of lectures (or limit by querystring)
exports.index = function(req, res) {
	// name checking
	if (req.query.title)
		req.query.title = new RegExp(req.query.title, "i");
	else
		req.query.title = new RegExp('', "i");

	Lecture.find({
			title: req.query.title,
			$or: [{
				author: req.query.createdBy
			}, {
				'collaborators.user': req.query.createdBy
			}]
		})
		.skip((req.query.page - 1) * req.query.paginate)
		.limit(req.query.paginate)
		.populate('author')
		.populate('collaborators.user')
		.sort('title')
		.lean()
		.exec(function(err, lectures) {
			if (err) {
				return handleError(res, err);
			}
			if (!lectures[0]) {
				return res.status(404).send('Not Found');
			} else {
				Lecture.count({
					$or: [{
						author: req.query.createdBy
					}, {
						'collaborators.user': req.query.createdBy
					}]
				}, function(err, count) {
					res.status(200).json({
						result: lectures,
						count: count
					});
				});

			}

		});
};

// exports.generatePreview = function(req, res) {
// 	if (req.body.url) {
// 		new Screenshot('http://' + req.body.url)
// 			.width(968)
// 			.height(968)
// 			.clip()
// 			.capture(function(err, img) {
// 				if (err) throw err;
// 				res.contentType('image/jpeg');
// 				res.end(img.toString('base64'), 'binary');
// 			});
// 	} else {
// 		res.status(400).send('no url sent');
// 	}
// };

exports.count = function(req, res) {
	Lecture.count({
		author: req.query.createdBy,
		endTime: {
			"$gte": new Date()
		}
	}, function(err, count) {
		// console.log(count);
		res.status(200).json({
			count: count
		});
	});
};


// Get a single lecture
exports.show = function(req, res) {
	Lecture.findById(req.params.id, function(err, lecture) {
		if (err) {
			return handleError(res, err);
		}
		if (!lecture) {
			return res.status(404).send('Not Found');
		}
		return res.json(lecture);
	});
};

// gets anything after file extension (.) on file dir
function getFileType(fileLoc, cb) {
	// split file on full stop and pop the last entry off of stack
	var extension = fileLoc.split('.').pop();
	// default blank file
	var fileType = 'file';

	if (extension === 'pdf') {
		fileType = 'file-pdf';
	} else if (extension === 'zip') {
		fileType = 'file-archive';
	} else if (extension === 'html' || extension === 'cpp' || extension === 'cs' || extension === 'php' || extension === 'css' || extension === 'less' || extension === 'scss') {
		fileType = 'file-code';
	} else if (extension === 'txt') {
		fileType = 'file-text';
	} else if (extension === 'docx' || extension === 'doc') {
		fileType = 'file-word';
	} else if (extension === 'ppt' || extension === 'pptx' || extension === 'pps' || extension === 'ppsx') {
		fileType = 'file-powerpoint';
	} else if (extension === 'xls' || extension === 'xlsx' || extension === 'xlsm') {
		fileType = 'file-excel';
	} else if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'bmp' || extension === 'psd') {
		fileType = 'file-image';
	}
	cb(fileType);
}
exports.attachFiles = function(req, res) {
	var lectureId = req.params.id;
	var filesInfo = [];

	var tempLocation = path.join(__dirname, '../../storage/lectures/temp/');
	var dir = path.join(__dirname, '../../storage/lectures/', String(lectureId), '/');
	var apiRoute = path.join('/api/storage/lectures/', String(lectureId), '/');

	mkdirp(dir, function(err) {

		async.each(req.files, function iteratee(file, callback) {
			var collectionFileInfo = {};
			var tempFileLocation = tempLocation + file.originalname;
			var newFileDir = dir + file.originalname.replace(/ /g, '_');
			var newApiRoute = apiRoute + file.originalname.replace(/ /g, '_');
			collectionFileInfo.loc = newFileDir;
			collectionFileInfo.url = newApiRoute;
			// function determines which fa font from passed through file
			getFileType(collectionFileInfo.loc, function(fileType) {
				collectionFileInfo.type = fileType;
				filesInfo.push(collectionFileInfo);
				moveFromTempToAssoc(tempFileLocation, newFileDir, function() {
					if (file.fieldname === req.files[req.files.length - 1].fieldname) {
						Lecture.findById(lectureId, function(err, lecture) {
							lecture.attachments = filesInfo;
							lecture.save(function(err) {
								if (err) {
									return handleError(res, err);
								} else {
									return res.json(lecture);
								}
							})
						});
					}
				});
			});
		});

	});



};

// Creates a new lecture in the DB.
exports.create = function(req, res) {
	if (req.body.data) {
		if (req.body.data.url) {
			// strip out http and http from request, and re-add just http
			req.body.data.url = 'http://' + req.body.data.url.split('http://').pop().split('https://').pop();
		}
	}
	Lecture.create(req.body.data, function(err, lecture) {
		if (err) {
			console.log(err);
			return handleError(res, err);
		} else {
			// create preview, save server side, update lecture with preview
			// if lecture has a url, generate a preview
			if (lecture.url) {
				return res.json(lecture);
				// new Screenshot(lecture.url)
				// 	.width(968)
				// 	.height(968)
				// 	.clip()
				// 	.capture(function(err, img) {
				// 		if (err) throw err;
				// 		// store other files here
				// 		storeFile(lecture._id, 'preview.png', img, function(loc) {
				// 			lecture.preview = loc;
				// 			lecture.save(function(err) {
				// 				if (err) {
				// 					return handleError(res, err);
				// 				} else {
				// 					return res.json(lecture);
				// 				}
				// 			})
				// 		});
				// 	});
			} else {
				// else res back straight away
				return res.status(201).json(lecture);
			}
		}
	});
};

// Updates an existing lecture in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Lecture.findById(req.params.id, function(err, lecture) {
		if (err) {
			return handleError(res, err);
		}
		if (!lecture) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(lecture, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(lecture);
		});
	});
};

// Deletes a lecture from the DB.
exports.destroy = function(req, res) {
	Lecture.findById(req.params.id, function(err, lecture) {
		if (err) {
			return handleError(res, err);
		}
		if (!lecture) {
			return res.status(404).send('Not Found');
		}
		lecture.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			// directory for lecture files storage
			var dir = path.join(__dirname, '../../storage/lectures/', String(lecture._id), '/');
			// remove files & folder associated with this lecture
			rmdir(dir, function(error) {
				if (error) {
					return handleError(res, err);
				} else {
					return res.status(204).send('No Content');
				}
			});
		});
	});
};

function handleError(res, err) {
	return res.status(500).send(err);
}