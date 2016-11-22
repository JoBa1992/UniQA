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
var Bucket = require('../../aws/s3/bucket')
var bucket = new Bucket('uniqa/lectures')

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
	Lesson.findById(req.params.id).where('deleted', false).exec(function(err, lesson) {
		if (err) {
			return handleError(res, err);
		}
		if (!lesson) {
			return res.status(404).send('Not Found');
		}
		return res.json(lesson);
	});
};

exports.attachFiles = function (req, res, next) {
  var lessonId = req.params.id

  bucket.upload(req.files, function (err, uploadedFiles) {
    if (err) return next(err)

    Lesson.findById(lessonId, function (err, lesson) {
      if (err) return next(err)
      lesson.attachments = uploadedFiles
      lesson.save(function (err) {
        if (err) return next(err)
        res.status(201).json(lesson)
      })
    })
  })
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

    async.each(lesson.attachments, (attachment, cb) => {
      bucket.remove(attachment.key, cb)
    }, (awsError) => {
      if (awsError) {
        // Log something here. Its not a fatal error, as the lesson can still
        // be deleted, but the files still technically exist.
      }
      lesson.remove(function(err) {
        if (err) {
          return handleError(res, err);
        } else {
          res.status(204)
        }
      });
    })
	});
};

function handleError(res, err) {
	return res.status(500).send(err);
}