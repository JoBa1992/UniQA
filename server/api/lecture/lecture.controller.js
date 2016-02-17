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
var moment = require('moment'); // date handling
var Lecture = require('./lecture.model');
var Thing = require('../thing/thing.model');
var Qr = require('../qr/qr.model');

// USED FOR QR GENERATION
var fs = require('fs');
var path = require('path');
var qrEncoder = require('qr-image');

function file(name) {
	return fs.createWriteStream(path.join(__dirname, '../../storage/qrs/', name));
}

//
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
	Lecture.find({
		altAccess: altAccess
	}, function(err, lecture) {
		// if authenticated user exists (find returns back an empty set,
		// so check to see if it has any elements)
		if (!lecture[0]) {
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
			createUniqueKey();
	});
}

// Get list of lectures (or limit by querystring)
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
		.exec(function(err, lectures) {
			if (err) {
				return handleError(res, err);
			}
			if (!lectures[0]) {
				return res.status(404).send('Not Found');
			} else {
				lectures.forEach(function(lecture) {
					lecture.startTime = convertISOTime(lecture.startTime, "datetime");
					lecture.endTime = convertISOTime(lecture.endTime, "datetime");
				});
				res.status(200).json(lectures);
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
		case "datetime":
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
			Qr.create({
					lecture: lecture._id,
					createdBy: lecture.createdBy
				},
				function(err, qr) {
					if (err) {
						console.info(err);
						return handleError(res, err);
					} else {
						Thing.find({
							name: 'qrBaseURL'
						}, function(err, thing) {
							var serverBase = thing[0].content; // just the one
							Thing.find({
								name: 'accessCodeLen'
							}, function(err, thing) {
								var altAccKeyLen = thing[0].content; // just the one

								createUniqueAccKey(altAccKeyLen, function(altAccessKey) {
									lecture.altAccess = altAccessKey;
									// replace temp with class id when classes are setup
									var url = String(serverBase + '/' + qr._id + '/group/' + 'temp' + '/register');

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

									Qr.findById(qr._id).exec(function(err, uQr) {
										if (err) {
											console.info(err);
											return handleError(res, err);
										} else if (!uQr) {
											return res.status(404).send('Not Found');
										} else {
											// lecture.qr = qr._id;
											uQr.url = url;
											uQr.svg = qrSvgString;
											uQr.save(function(err) {
												if (err) {
													console.info(err);
													return handleError(res, err);
												}
												lecture.qr = qr._id;
												lecture.save(function(err, lecture) {
													if (err) {
														console.info(err);
														return handleError(res, err);
													}
													lecture.populate('qr', function(err, lecture) {
														return res.status(200).json(lecture);
													});
												});
											});
										}
									});
								});
							});

						});
					}
				});
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
		case "datetime":
		default: //datetime
			return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
	}
};