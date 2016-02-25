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
var Lecture = require('../lecture/lecture.model');
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

//
var genKey = function(length) {
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
var isKeyUnique = function(altAccess, callback) {
	Lecture.find({
		altAccess: altAccess
	}, function(err, session) {
		// if authenticated user exists (find returns back an empty set,
		// so check to see if it has any elements)
		if (!session[0]) {
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
var createUniqueAccKey = function(altAccKeyLen, callback) {
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
	Lecture.find({
			createdBy: req.query.createdBy,
			endTime: {
				"$gte": new Date()
			}
		})
		.sort('startTime')
		.skip((req.query.page - 1) * req.query.paginate)
		.limit(req.query.paginate)
		.populate('qr')
		.populate('createdBy')
		.lean()
		.exec(function(err, sessions) {
			if (err) {
				return handleError(res, err);
			}
			if (!sessions[0]) {
				return res.status(404).send('Not Found');
			} else {
				sessions.forEach(function(session) {
					session.startTime = convertISOTime(session.startTime, "datetime");
					session.endTime = convertISOTime(session.endTime, "datetime");
				});
				res.status(200).json(sessions);
			}

		});
};

function convertISOTime(timeStamp, convertType, cb) {
	// function takes a timestamp and converts to the requested type
	// datetime is the default return
	var day = timeStamp.getDate().toString().length <= 1 ?
		'0' + timeStamp.getDate().toString() : timeStamp.getDate(),
		// month is stored as a zero-indexed array, so needs 1 adding
		month = (timeStamp.getMonth() + 1).toString().length <= 1 ?
		'0' + (timeStamp.getMonth() + 1).toString() : (timeStamp.getMonth() + 1),
		year = timeStamp.getFullYear(),
		second = timeStamp.getSeconds().toString().length <= 1 ?
		'0' + timeStamp.getSeconds().toString() : timeStamp.getSeconds(),
		minute = timeStamp.getMinutes().toString().length <= 1 ?
		'0' + timeStamp.getMinutes().toString() : timeStamp.getMinutes(),
		hour = timeStamp.getHours().toString().length <= 1 ?
		'0' + timeStamp.getHours().toString() : timeStamp.getHours();
	switch (convertType) {
		case "date":
			return day + '/' + month + '/' + year;
		case "time":
			return hour + ':' + minute + ':' + second;
		case "dateISO":
			return year + '-' + month + '-' + day;
		default: //datetime
			return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
	}
}

exports.count = function(req, res) {
	Lecture.count({
		createdBy: req.query.createdBy,
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


// Get a single session
exports.show = function(req, res) {
	Session.findById(req.params.id)
		.populate('lecture')
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
				path: 'lecture.author',
				model: 'User'
			}, function(err) {
				Session.populate(session, {
					path: 'lecture.collaborators.user',
					model: 'User'
				}, function(err) {
					return res.json(session);
				});
			});

		});
};

// Creates a new session in the DB.
exports.create = function(req, res) {
	Lecture.create(req.body, function(err, session) {
		if (err) {
			console.log(err);
			return handleError(res, err);
		} else {
			// Qr.create({
			// 		session: session._id,
			// 		createdBy: session.createdBy
			// 	},
			// 	function(err, qr) {
			// 		if (err) {
			// 			console.info(err);
			// 			return handleError(res, err);
			// 		} else {
			// 			Thing.find({
			// 				name: 'qrBaseURL'
			// 			}, function(err, thing) {
			// 				var serverBase = thing[0].content; // just the one
			// 				Thing.find({
			// 					name: 'accessCodeLen'
			// 				}, function(err, thing) {
			// 					var altAccKeyLen = thing[0].content; // just the one
			//
			// 					createUniqueAccKey(altAccKeyLen, function(altAccessKey) {
			// 						session.altAccess = altAccessKey;
			// 						// replace temp with class id when classes are setup
			// 						var url = String(serverBase + '/' + qr._id + '/group/' + 'temp' + '/register');
			//
			// 						// currently in Sync...? :(
			// 						var qrSvgString = qrEncoder.imageSync(url, {
			// 							type: 'svg',
			// 							ec_level: 'Q',
			// 							parse_url: false,
			// 							margin: 1,
			// 							size: 4
			// 						});
			//
			// 						// REMOVE Inject elements on svg, problem with plugin
			// 						qrSvgString = qrSvgString.replace('<svg xmlns="http://www.w3.org/2000/svg" width="172" height="172" viewBox="0 0 43 43">', "");
			// 						qrSvgString = qrSvgString.replace('</svg>', "");
			// 						qrSvgString = qrSvgString.replace('\"', "\'");
			// 						qrSvgString = qrSvgString.replace('\"/', "\'/");
			//
			// 						Qr.findById(qr._id).exec(function(err, uQr) {
			// 							if (err) {
			// 								console.info(err);
			// 								return handleError(res, err);
			// 							} else if (!uQr) {
			// 								return res.status(404).send('Not Found');
			// 							} else {
			// 								// session.qr = qr._id;
			// 								uQr.url = url;
			// 								uQr.svg = qrSvgString;
			// 								uQr.save(function(err) {
			// 									if (err) {
			// 										console.info(err);
			// 										return handleError(res, err);
			// 									}
			// 									session.qr = qr._id;
			// 									session.save(function(err, session) {
			// 										if (err) {
			// 											console.info(err);
			// 											return handleError(res, err);
			// 										}
			// 										session.populate('qr', function(err, session) {
			// 											return res.status(200).json(session);
			// 										});
			// 									});
			// 								});
			// 							}
			// 						});
			// 					});
			// 				});
			//
			// 			});
			// 		}
			// 	});
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
	var requestArr = questionToAdd.request.split(' ');

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
};




// Updates an existing session in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Lecture.findById(req.params.id, function(err, session) {
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

// Deletes a session from the DB.
exports.destroy = function(req, res) {
	Lecture.findById(req.params.id, function(err, session) {
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

function convertISOTime(timeStamp, convertType) {
	// function takes a timestamp and converts to the requested type
	// datetime is the default return
	var day = timeStamp.getDate().toString().length <= 1 ?
		'0' + timeStamp.getDate().toString() : timeStamp.getDate(),
		// month is stored as a zero-indexed array, so needs 1 adding
		month = (timeStamp.getMonth() + 1).toString().length <= 1 ?
		'0' + (timeStamp.getMonth() + 1).toString() : (timeStamp.getMonth() + 1),
		year = timeStamp.getFullYear(),
		second = timeStamp.getSeconds().toString().length <= 1 ?
		'0' + timeStamp.getSeconds().toString() : timeStamp.getSeconds(),
		minute = timeStamp.getMinutes().toString().length <= 1 ?
		'0' + timeStamp.getMinutes().toString() : timeStamp.getMinutes(),
		hour = timeStamp.getHours().toString().length <= 1 ?
		'0' + timeStamp.getHours().toString() : timeStamp.getHours();
	switch (convertType) {
		case "date":
			return day + '/' + month + '/' + year;
		case "time":
			return hour + ':' + minute + ':' + second;
		case "dateISO":
			return year + '-' + month + '-' + day;
		default: //datetime
			return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
	}
}