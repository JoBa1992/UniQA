/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /lessons              ->  index
 * POST    /lessons              ->  create
 * GET     /lessons/:id          ->  show
 * PUT     /lessons/:id          ->  update
 * DELETE  /lessons/:id          ->  destroy
 */

// need to convert png image when its created/stored into base64 String, store it in QR collection, and can use this to decode on html side (hopefully!)
'use strict';

// TODO:
// 	-	Hook up attachments to S3
//	-	Add possibility to attach a true flag to a particular file as the lesson 'slides'
//		-	might be done here or client side (I'm unsure)
//	-	Create lecture clone method, which takes everything from the original apart from the _id

var Lesson = require('./lesson.model');
var Thing = require('../thing/thing.model');

var _ = require('lodash');
var async = require('async');
var rmdir = require('rimraf');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function storeFile(id, name, file, cb) {
	var apiRoute = path.join('/api/storage/lessons/', String(id), '/', name);
	var dir = path.join(__dirname, '../../storage/lessons/', String(id), '/');
	var loc = path.join(__dirname, '../../storage/lessons/', String(id), '/', name);
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

// Get list of lessons (or limit by querystring)
exports.index = function(req, res) {
	// name checking
	if (req.query.title)
		req.query.title = new RegExp(req.query.title, "i");
	else
		req.query.title = new RegExp('', "i");

	Lesson.find({
			title: req.query.title,
			$or: [{
				author: req.query.author
			}, {
				'collaborators.user': req.query.author
			}]
		})
		.skip((req.query.page - 1) * req.query.paginate)
		.limit(parseInt(req.query.paginate))
		.populate('author')
		.populate('collaborators.user')
		.populate('module')
		.where('deleted', false)
		.sort('module')
		.lean()
		.exec(function(err, lessons) {
			if (err) {
				return handleError(res, err);
			}
			if (!lessons[0]) {
				return res.status(404).send('Not Found');
			} else {
				Lesson.count({
					$or: [{
						author: req.query.author
					}, {
						'collaborators.user': req.query.author
					}]
				}, function(err, count) {
					res.status(200).json({
						lessons: lessons,
						count: count
					});
				});

			}

		});
};

// Get a single lesson
exports.show = function(req, res) {
	Lesson.findById(req.params.id)
		.populate('author')
		.populate('collaborators.user')
		.populate('module')
		.where('deleted', false)
		.exec(function(err, lesson) {
			if (err) {
				return handleError(res, err);
			}
			if (!lesson) {
				return res.status(404).send('Not Found');
			}
			return res.json(lesson);
		});
};

exports.attachFiles = function(req, res) {
	var lessonId = req.params.id;
	var filesInfo = [];

	var tempLocation = path.join(__dirname, '../../storage/lessons/temp/');
	var dir = path.join(__dirname, '../../storage/lessons/', String(lessonId), '/');
	var apiRoute = path.join('/api/storage/lessons/', String(lessonId), '/');

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
						Lesson.findById(lessonId, function(err, lesson) {
							lesson.attachments = filesInfo;
							lesson.save(function(err) {
								if (err) {
									return handleError(res, err);
								} else {
									return res.json(lesson);
								}
							})
						});
					}
				});
			});
		});
	});
};

// Creates a new lesson in the DB.
exports.create = function(req, res) {
	Lesson.create(req.body.data, function(err, lesson) {
		if (err) {
			console.log(err);
			return handleError(res, err);
		} else {
			// create preview, save server side, update lesson with preview
			// if lesson has a url, generate a preview
			if (lesson.url) {
				return res.json(lesson);
			} else {
				// else res back straight away
				return res.status(201).json(lesson);
			}
		}
	});
};

// Updates an existing lesson in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Lesson.findById(req.params.id, function(err, lesson) {
		if (err) {
			return handleError(res, err);
		}
		if (!lesson) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(lesson, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(lesson);
		});
	});
};

exports.clone = function(req, res) {

	Lesson.findById(req.params.id, function(err, lesson) {
		if (err) {
			return handleError(res, err);
		}
		if (!lesson) {
			return res.status(404).send('Not Found');
		}

		var clonedLesson = new Lesson(lesson);
		clonedLesson._id = undefined;

		Lesson.create(lesson, function(err, lesson) {
			if (err) {
				console.log(err);
				return handleError(res, err);
			} else {
				// create preview, save server side, update lesson with preview
				// if lesson has a url, generate a preview
				if (lesson.url) {
					return res.json(lesson);
				} else {
					// else res back straight away
					return res.status(201).json(lesson);
				}
			}
		});
	});
};

exports.undoDelete = function(req, res) {
	Lesson.findById(req.params.id, function(err, lesson) {
		if (err) {
			return handleError(res, err);
		}
		if (!lesson) {
			return res.status(404).send('Not Found');
		}
		lesson.deleted = false;
		lesson.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(lesson);
		});
	});
};

exports.softDelete = function(req, res) {
	Lesson.findById(req.params.id, function(err, lesson) {
		if (err) {
			return handleError(res, err);
		}
		if (!lesson) {
			return res.status(404).send('Not Found');
		}
		lesson.deleted = true;
		lesson.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(lesson);
		});
	});
};

// Deletes a lesson from the DB.
exports.destroy = function(req, res) {
	Lesson.findById(req.params.id, function(err, lesson) {
		if (err) {
			return handleError(res, err);
		}
		if (!lesson) {
			return res.status(404).send('Not Found');
		}
		lesson.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			// directory for lesson files storage
			var dir = path.join(__dirname, '../../storage/lessons/', String(lesson._id), '/');
			// remove files & folder associated with this lesson
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