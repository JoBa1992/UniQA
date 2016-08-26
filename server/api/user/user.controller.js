'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var Thing = require('../thing/thing.model');


var Parse = require('csv-parse');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var fs = require('fs')

var validationError = function(res, err) {
	return res.status(422).json(err);
};

function genAccessCode(length) {
	var key = '';
	var randomchar = function() {
		var num = Math.floor(Math.random() * 62);
		if (num < 10) {
			return num; //1-10
		}
		if (num < 36) {
			return String.fromCharCode(num + 55); //A-Z
		}
		return String.fromCharCode(num + 61); //a-z
	};
	while (length--) {
		key += randomchar();
	}
	return key;
}
//
function isAccessCodeUnique(key, callback) {
	// User.find({
	// 	passcode: key
	// }, function(err, user) {
	// 	// if user exists (find returns back an empty set,
	// 	// so check to see if it has any elements)
	// 	if (!user[0]) {
	// 		// if it does, go to next middleware
	// 		callback(true);
	// 		return true;
	// 	} else {
	// 		// if it doesn't, send back error
	// 		callback(false);
	// 	}
	// });
	callback(true);
}

function createUniqueAccessCode(length, cb) {
	var accessCode = genAccessCode(length);
	isAccessCodeUnique(accessCode, function(unique) {
		if (unique) {
			cb(accessCode);
		} else {
			createUniqueAccessCode();
		}
	});
}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
	// name checking
	if (req.query.name)
		req.query.name = new RegExp(req.query.name, "i");
	else
		req.query.name = new RegExp('', "i");

	// role checking
	if (typeof req.query.role === 'string') {
		req.query.role = [req.query.role];
	} else if (!req.query.role) {
		req.query.role = [];
	}

	// module checking
	if (!req.query.module)
		req.query.module = new RegExp('', "i");

	User.find({
			name: req.query.name,
			role: {
				$in: req.query.role
			},
			//module: req.query.department
		}, '-salt -hashedPassword')
		.skip((req.query.page - 1) * req.query.paginate)
		.limit(req.query.paginate)
		.populate({
			path: "department",
			populate: "Department"
		})
		.lean()
		.exec(function(err, users) {
			if (err) return res.status(500).send(err);

			User.count({
				name: req.query.name,
				role: {
					$in: req.query.role
				},
				//   module: req.query.module
			}, function(err, count) {
				users.forEach(function(user) {
					user.createdOn = user._id.getTimestamp();
				});
				res.status(200).json({
					result: users,
					count: count
				});
			});
		});
};
exports.count = function(req, res) {
	User.count({}, function(err, count) {
		res.status(200).json({
			count: count
		});
	});
};

function isEmpty(obj) {
	for (var i in obj)
		if (obj.hasOwnProperty(i)) return false;
	return true;
}

/**
 * Creates a new user
 *  This function is to create a user with a access code, for users using the "register page" to "register" please refer to userRegistration.
 */
exports.create = function(req, res, next) {
	// get access code length
	Thing.findOne({
		'name': 'accessCodeLen'
	}, function(err, thing) {
		// set as final
		var ACC_CODE_LENGTH = thing.content;
		if (req.body instanceof Array) {
			for (var i = 0; i < req.body.length; i++) {
				// not sure why this stage has to be done
				if (req.body[i]) {
					/*jshint -W083 */
					createUniqueAccessCode(ACC_CODE_LENGTH, function(key) {
						req.body[i].passcode = key;
						req.body[i].email = req.body[i].email + '@shu.ac.uk';

						var newUser = new User(req.body[i]);

						newUser.save(function(err, nUser) {
							// fails silently if any problems occur, needs feedback
							if (String(newUser.email) === String(req.body[i - 1].email)) {
								return res.status(200).send("finished inserting users");
							}

						});
					});
				}
			}
		} else {
			var newUser = new User(req.body);
			/*jshint -W083 */
			createUniqueAccessCode(ACC_CODE_LENGTH, function(key) {
				newUser.passcode = key;
				//append uni onto end, can be pulled from db
				newUser.email = newUser.email + '@shu.ac.uk';
				newUser.save(function(err, user) {
					if (err) return validationError(res, err);
					res.json({
						user: user
					});
				});
			});
		}
	});
};


/**
 *  Registers an already created user for access to this system.
 *  Using a pre-defined access code, the user can get into the system and create a password.
 */
exports.registerUser = function(req, res, next) {
	var reqUser = req.body.user;
	reqUser.email = reqUser.email.toLowerCase() + "@shu.ac.uk";
	User.findOne({
		email: reqUser.email,
		passcode: reqUser.passcode
	}, function(err, user) {
		if (err) return validationError(res, err);
		if (user) {
			user.name = reqUser.name;
			user.password = String(reqUser.password);
			user.passcode = undefined;
			user.save(function(err) {
				if (err) return validationError(res, err);
				var token = jwt.sign({
					_id: user._id
				}, config.secrets.session, {
					expiresIn: 60 * 60 * 5
				});
				res.json({
					token: token
				});
			});
		} else {
			// bit of a bodge
			err = {
				name: "ValidationError",
				message: "Validation failed",
				errors: {
					email: {
						message: "Email address doesn't match with passcode provided"
					},
					passcode: {
						message: "Is this passcode correct?"
					}
				}
			}
			return validationError(res, err);
		}
	});
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
	var userId = req.params.id;

	User.findById(userId, function(err, user) {
		if (err) return next(err);
		if (!user) return res.status(401).send('Unauthorized');
		res.json(user.profile);
	});
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
	User.findByIdAndRemove(req.params.id, function(err, user) {
		if (err) return res.status(500).send(err);
		return res.status(204).send('No Content');
	});
};

/**
 * Update user details
 */
exports.update = function(req, res, next) {
	var uID = req.body._id;
	var uName = req.body.name;
	var uEmail = req.body.email;
	var uDep = req.body.department;
	var uRole = req.body.role;

	User.findById(uID, function(err, user) {
		user.name = uName;
		user.email = uEmail;
		user.department = uDep;
		user.role = uRole;
		user.save(function(err) {
			if (err)
				return validationError(res, err);
			res.status(200).send('OK');
		});
	});
};
/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
	var userId = req.user._id;
	var oldPass = String(req.body.oldPassword);
	var newPass = String(req.body.newPassword);

	User.findById(userId, function(err, user) {
		if (user.authenticate(oldPass)) {
			user.password = newPass;
			user.save(function(err) {
				if (err) return validationError(res, err);
				res.status(200).send('OK');
			});
		} else {
			res.status(403).send('Forbidden');
		}
	});
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
	var userId = req.user._id;
	// console.info(userId);
	User.findOne({
		_id: userId
	}, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
		if (err) return next(err);
		if (!user) return res.status(401).send('Unauthorized');
		res.json(user);
	});
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
	res.redirect('/');
};