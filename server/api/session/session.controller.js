/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /sessions              ->  index
 * POST    /sessions              ->  create
 * GET     /sessions/:id          ->  show
 * PUT     /sessions/:id          ->  update
 * DELETE  /sessions/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var moment = require('moment'); // date handling
var Lesson = require('../lesson/lesson.model');
var Session = require('./session.model');
var Thing = require('../thing/thing.model');

// USED FOR QR GENERATION
var fs = require('fs');
var path = require('path');
var qrEncoder = require('qr-image');

function file(name) {
	return fs.createWriteStream(path.join(__dirname, '../../storage/qrs/', name));
}

// check array or differences - used as profanity filter
Array.prototype.diff = function(arr2) {
	var ret = [];
	this.sort();
	arr2.sort();
	for (var i = 0; i < this.length; i += 1) {
		if (arr2.indexOf(this[i].toLowerCase()) > -1) {
			ret.push(this[i].toLowerCase());
		}
	}
	return ret;
};

function genKey(length) {
	var key = '';
	var randomchar = function() {
		var num = Math.floor(Math.random() * 62);
		if (num < 10)
			return num; //1-10
		if (num < 36)
			return String.fromCharCode(num + 55); //A-Z
		return String.fromCharCode(num + 61); //a-z
	};
	while (length--)
		key += randomchar();
	return key;
}
//
function isKeyUnique(altAccess, callback) {
	Lesson.find({
		altAccess: altAccess
	}, function(err, lesson) {
		// if authenticated user exists (find returns back an empty set,
		// so check to see if it has any elements)
		if (!lesson[0]) {
			// if it does, go to next middleware
			callback(true);
			return true;
		} else {
			// if it doesn't, send back error
			callback(false);
		}
	});
}
//
function createUniqueAccKey(altAccKeyLen, callback) {
	var altAccess = genKey(altAccKeyLen);
	isKeyUnique(altAccess, function(unique) {
		if (unique)
			callback(altAccess);
		else
			createUniqueAccKey();
	});
}

// Get list of sessions (or limit by querystring)
exports.index = function(req, res) {
	var getAuthor = {
		author: null
	};
	var query = {};
	var order = 'startTime';
	var page = 1;
	var paginate = 10;
	var now = moment.utc().format();

	if (!_.isEmpty(req.query)) {
		if (!req.query.author) {
			getAuthor = {};
		} else {
			getAuthor.author = req.query.author
		}

		if (req.query.createdBy) {
			query.createdBy = req.query.createdBy;
		}

		if (req.query.order) {
			order = req.query.order;
		}

		if (req.query.page) {
			page = req.query.page;
			delete req.query.page;
		}
		if (req.query.paginate) {
			paginate = req.query.paginate;
			delete req.query.paginate;
		}
	}
	Session.find(query)
		.populate('createdBy')
		.populate({
			path: 'lesson',
			match: getAuthor
		})
		.populate('registered.user')
		.populate('questions.asker')
		.populate('feedback.user')
		.populate('modules.module')
		.where('deleted', false)
		.sort(order)
		.skip((page - 1) * paginate)
		.limit(parseInt(paginate))
		.lean()
		.exec(function(err, sessions) {
			if (err) {
				return handleError(res, err);
			}
			if (!sessions[0]) {
				return res.status(404).send('Not Found');
			} else {
				// rip out any null lessons
				sessions = sessions.filter(function(session) {
					return session.lesson;
				});

				Session.populate(sessions, {
					path: 'modules.module.students.user',
					model: 'User'
				}, function(err) {
					res.status(200).json(sessions);
				});
			}

		});
};

exports.getFile = function(req, res) {
	var sessionId = req.params.sessionid;
	var lessonId = req.params.lessonid;
	var fileId = req.params.fileid;
	var userId = req.params.userid;

	// check file exists in db for this lesson first
	Lesson.findOne({
			_id: lessonId,
			'attachments._id': fileId
		})
		.lean()
		.exec(function(err, lesson) {
			var fileToServe;
			for (var i = 0; i < lesson.attachments.length; i++) {
				if (String(lesson.attachments[i]._id) === fileId) {
					fileToServe = lesson.attachments[i];
				}
			}

			var fileName = fileToServe.loc.split('/').pop();

			res.download(path.join(__dirname, '../../storage/lessons/', lessonId, '/', fileName), fileName, function(err) {
				if (err) {
					// Handle error, but keep in mind the response may be partially-sent
					// so check res.headersSent
				} else {
					// add to stats for download, shouldn't fail really...
					Session.findById(sessionId, function(err, session) {
						session.downloads.push({
							user: userId,
							file: fileId
						});
						session.save(function(err) {
							if (err) {
								console.info(err);
							}
						});
					});
				}
			});
		});


};

exports.getNextFourTutor = function(req, res) {
	Session.find({
			endTime: {
				$gt: moment.utc().format()
			}
		}) // order by startDate asc
		.populate({
			path: 'lesson',
			match: {
				$or: [{
					author: req.params.userid
				}, {
					'collaborators.user': req.params.userid
				}]

			}
		})
		.populate('registered.user')
		.populate('questions.asker')
		.populate('modules.module')
		.sort('startTime')
		.limit(4)
		.exec(function(err, sessions) {
			// console.info(sessions);
			if (err) {
				return handleError(res, err);
			}
			if (!sessions) {
				return res.status(404).send('Not Found');
			}

			// rip out any null lessons
			sessions = sessions.filter(function(session) {
				return session.lesson;
			});

			Session.populate(sessions, {
				path: 'lesson.author',
				model: 'User'
			}, function(err) {
				Session.populate(sessions, {
					path: 'lesson.collaborators.user',
					model: 'User'
				}, function(err) {
					return res.json(sessions);
				});
			});

		});
};
// exports.getNextStudent = function(req, res) {
// 	// console.info(req.params);
// 	Session.find({
// 			endTime: {
// 				$gt: new Date()
// 			}
// 		}) // order by startDate asc
// 		.populate('lesson')
// 		.populate('registered.user')
// 		.populate('questions.asker')
// 		.populate({
// 			path: 'modules.module',
// 			match: {
// 				'students.user': req.params.userid
// 			}
// 		})
// 		.sort('startTime')
// 		.exec(function(err, sessions) {
// 			// console.info(sessionss);
// 			if (err) {
// 				return handleError(res, err);
// 			}
// 			if (!sessions) {
// 				return res.status(404).send('Not Found');
// 			}
// 			console.info(sessions);
// 			// rip out any null lessons
// 			sessions = sessions.filter(function(session) {
// 				return session.module;
// 			});
//
// 			Session.populate(sessions, {
// 				path: 'lesson.author',
// 				model: 'User'
// 			}, function(err) {
// 				Session.populate(sessions, {
// 					path: 'lesson.collaborators.user',
// 					model: 'User'
// 				}, function(err) {
// 					return res.json(sessions);
// 				});
// 			});
//
// 		});
// };

// Get a single session
exports.show = function(req, res) {

	Session.findById(req.params.id)
		.populate('lesson')
		.populate('registered.user')
		.populate('questions.asker')
		.populate('modules.module')
		.where('deleted', false)
		.exec(function(err, session) {
			if (err) {
				return handleError(res, err);
			}
			if (!session) {
				return res.status(404).send('Not Found');
			}
			Session.populate(session, {
				path: 'lesson.author',
				model: 'User'
			}, function(err) {
				Session.populate(session, {
					path: 'lesson.collaborators.user',
					model: 'User'
				}, function(err) {
					return res.json(session);
				});
			});

		});
};

exports.showForUser = function(req, res) {
	Session.findById(req.params.id)
		.populate('lesson', null, {
			'lesson.author': req.params.user
		})
		.populate('register')
		.populate('questions.asker')
		.exec(function(err, session) {
			if (err) {
				return handleError(res, err);
			}
			if (!session) {
				return res.status(404).send('Not Found');
			}
			Session.populate(session, {
				path: 'lesson.author',
				model: 'User'
			}, function(err) {
				Session.populate(session, {
					path: 'lesson.collaborators.user',
					model: 'User'
				}, function(err) {
					return res.json(session);
				});
			});

		});
};

// Creates a new session in the DB.
exports.create = function(req, res) {
	Session.create(req.body, function(err, session) {
		if (err) {
			console.log(err);
			return handleError(res, err);
		} else {
			Thing.find({
				name: 'accessCodeLen'
			}, function(err, thing) {
				var altAccKeyLen = thing[0].content; // just the one
				createUniqueAccKey(altAccKeyLen, function(altAccessKey) {
					session.altAccess = altAccessKey;

					// var url = String('http://' + process.env.DOMAIN + '/qr/register/' + session._id);
					var url = String('http://uniqa-shu.herokuapp.com/qr/register/' + session._id);


					// currently in Sync...? :(
					var qrSvgString = qrEncoder.imageSync(url, {
						type: 'svg',
						ec_level: 'Q',
						parse_url: false,
						margin: 1,
						size: 4
					});
					// REMOVE Inject elements on svg, problem with plugin

					qrSvgString = qrSvgString.replace('<svg xmlns="http://www.w3.org/2000/svg" width="172" height="172" viewBox="0 0 43 43">', "");
					qrSvgString = qrSvgString.replace('</svg>', "");
					qrSvgString = qrSvgString.replace('\"', "\'");
					qrSvgString = qrSvgString.replace('\"/', "\'/");

					session.qr.url = '/qr/register/' + session._id;
					session.qr.svg = qrSvgString;

					session.save(function(err) {
						if (err) {
							console.info(err);
						} else {
							res.status(201).send(session);
						}

					});
				});
			});
		}
	});
};

exports.getQuestions = function(req, res) {
	Session.findOne({
		_id: req.params.id
	}).exec(function(err, session) {
		if (err) {
			return handleError(res, err);
		}
		if (!session)
			return res.status(404).send('Session does not exist');
		return res.status(200).json(session);
	});
};



exports.addQuestion = function(req, res) {
	var questionToAdd = JSON.parse(JSON.stringify(req.body)); // deep copy
	questionToAdd.time = new Date(moment.utc().format());

	if (questionToAdd.question) {
		var requestArr = questionToAdd.question.split(' ');
		var expWords = [];

		Thing.findOne({
			name: 'explicitWords'
		}, function(err, thing) {
			expWords = thing.content;
			// profanity filtering, if array contains anything,
			// bad words have been caught
			if (_.isEmpty(requestArr.diff(expWords))) {
				Session.findOne({
					_id: req.params.id
				}, function(err, session) {
					session.questions.push(questionToAdd);
					session.save(function(err) {
						if (err) {
							return handleError(res, err);
						}
						if (!session)
							return res.status(404).send('Session does not exist');
						return res.status(200).json(session);
					});
				});
			} else {
				return res.status(400).send('No explicit words allowed');
			}
		});
	} else {
		return res.status(400).send('No Question sent');
	}
};

exports.registerUser = function(req, res) {
	var user = {
		user: req.params.userid
	}

	if (_.isEmpty(req.body)) {
		return res.status(400).send('No Method of registering supplied');
	}


	var query = {
		// find the session with the url or alt access code
		'$or': [{
			'qr.url': req.body.params.url
		}, {
			'altAccess': req.body.params.altAccess
		}]
	};

	Session.findOne(query)
		.populate('modules.module')
		.exec(function(err, session) {
			if (err) {
				return handleError(res, err);
			}
			if (!session) {
				return res.status(404).send('Session does not exist');
			}

			var checkSession = session.toObject();
			var expected = false;

			// need to check that user is supposed to be registering to this lesson
			for (var i = 0; i < checkSession.modules.length; i++) {
				for (var x = 0; x < checkSession.modules[i].module.students.length; x++) {
					if (String(checkSession.modules[i].module.students[x].user) === String(user.user)) {
						expected = true;
					}
				}
				for (var y = 0; y < checkSession.modules[i].module.tutors.length; y++) {
					if (String(checkSession.modules[i].module.tutors[y].user) === String(user.user)) {
						expected = 'tutor';
					}
				}
			}

			// check if user is already registered, if they are, don't update
			var exists = checkSession.registered.some(function(regUser) {
				return String(regUser.user) === String(user.user);
			});

			if (expected) {
				if (!exists && String(expected) !== 'tutor') {
					session.registered.push(user);
				}
				session.save(function(err) {
					if (err) {
						return handleError(res, err);
					}
					if (!session)
						return res.status(404).send('Session does not exist');
					return res.status(200).json(session);
				});
			} else {
				return res.status(400).send('User is not authorized to register into this lesson');
			}
		});
};

exports.addFeedback = function(req, res) {
	var feedbackToAdd = JSON.parse(JSON.stringify(req.body.params)); // deep copy

	if (!_.isEmpty(feedbackToAdd)) {
		Session.findOneAndUpdate({
			_id: req.params.id
		}, {
			'$addToSet': {
				'feedback': {
					'user': feedbackToAdd.user,
					'rating': feedbackToAdd.rating,
					'comment': feedbackToAdd.comment
				}
			}
		}, {
			new: true, // returns updated doc
			runValidators: true
		}, function(err, session) {
			// session.feedback.push(feedbackToAdd);
			// session.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			if (!session) {
				return res.status(404).send('Session does not exist');
			}
			return res.status(200).json(session);
			// });
		});
	} else {
		return res.status(400).send('No Feedback sent');
	}
};

// exports.getFeedback = function(req, res) {
//
// };

exports.updateFeedback = function(req, res) {
	var feedbackToAdd = JSON.parse(JSON.stringify(req.body.params)); // deep copy

	if (!_.isEmpty(feedbackToAdd)) {
		Session.findOne({
			_id: req.params.id,
			'feedback.user': req.params.userid
		}, function(err, session) {

			return res.status(404).send('Session does not exist');
			// session.feedback.push(questionToAdd);
			// session.save(function(err) {
			// 	if (err) {
			// 		return handleError(res, err);
			// 	}
			// 	if (!session)
			// 		return res.status(404).send('Session does not exist');
			// 	return res.status(200).json(session);
			// });
		});
	} else {
		return res.status(400).send('No Feedback sent');
	}
};





// Updates an existing session in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Session.findById(req.params.id, function(err, session) {
		if (err) {
			return handleError(res, err);
		}
		if (!session) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(session, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(session);
		});
	});
};

exports.undoDelete = function(req, res) {
	Session.findById(req.params.id, function(err, session) {
		if (err) {
			return handleError(res, err);
		}
		if (!session) {
			return res.status(404).send('Not Found');
		}
		session.deleted = false;
		session.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(session);
		});
	});
};

exports.softDelete = function(req, res) {
	Session.findById(req.params.id, function(err, session) {
		if (err) {
			return handleError(res, err);
		}
		if (!session) {
			return res.status(404).send('Not Found');
		}
		session.deleted = true;
		session.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(session);
		});
	});
};

// Deletes a session from the DB.
exports.destroy = function(req, res) {
	Session.findById(req.params.id, function(err, session) {
		if (err) {
			return handleError(res, err);
		}
		if (!session) {
			return res.status(404).send('Not Found');
		}
		session.remove(function(err) {
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