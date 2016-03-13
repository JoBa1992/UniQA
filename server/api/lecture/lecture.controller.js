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

var _ = require('lodash');
var Lecture = require('./lecture.model');
var Thing = require('../thing/thing.model');

var Screenshot = require('url-to-screenshot');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function storeFile(id, name, file, cb) {
	//'localhost:' + String(process.env.PORT),
	var apiRoute = path.join('/api/storage/lectures/', String(id), '/', name);
	var dir = path.join(__dirname, '../../storage/lectures/', String(id), '/');
	var loc = path.join(__dirname, '../../storage/lectures/', String(id), '/', name);
	mkdirp(dir, function(err) {
		// path was created unless there was error
		fs.writeFileSync(loc, file);
		cb(apiRoute);
	});
};

// Get list of lectures (or limit by querystring)
exports.index = function(req, res) {
	Lecture.find({
			author: req.query.createdBy
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
				res.status(200).json(lectures);
			}

		});
};

exports.generatePreview = function(req, res) {
	if (req.body.url) {
		Screenshot('http://' + req.body.url)
			.width(968)
			.height(968)
			.clip()
			.capture(function(err, img) {
				if (err) throw err;
				res.contentType('image/jpeg');
				res.end(img.toString('base64'), 'binary');
			});
	} else {
		res.status(400).send('no url sent');
	}
};

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

// Creates a new lecture in the DB.
exports.create = function(req, res) {
	Lecture.create(req.body, function(err, lecture) {
		if (err) {
			console.log(err);
			return handleError(res, err);
		} else {
			// create preview, save server side, update lecture with preview
			// if lecture has a url, generate a preview
			if (lecture.url) {
				Screenshot('http://' + lecture.url)
					.width(968)
					.height(968)
					.clip()
					.capture(function(err, img) {
						if (err) throw err;
						storeFile(lecture._id, 'preview.png', img, function(loc) {
							lecture.preview = loc;
							lecture.save(function(err) {
								if (err) {
									return handleError(res, err);
								} else {
									return res.json(lecture);
								}
							})
						});
					});
			} else {
				// else res back straight away
				return res.json(lecture);
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
			return res.status(204).send('No Content');
		});
	});
};

function handleError(res, err) {
	return res.status(500).send(err);
}