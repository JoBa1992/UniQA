'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  if (isEmpty(req.query)) {
    User.find({}, '-salt -hashedPassword', function(err, users) {
      if (err) return res.status(500).send(err);
      res.status(200).json(users);
    });
  } else {
    // name checking
    if (req.query.name)
      req.query.name = new RegExp(req.query.name, "i");
    else
      req.query.name = new RegExp('', "i");
    // role checking
    if (typeof req.query.role == 'string') {
      req.query.role = [req.query.role];
    } else if (!req.query.role) {
      req.query.role = [];
    }
    // dep checking
    if (!req.query.department)
      req.query.department = new RegExp('', "i");

    User.find({
      name: req.query.name,
      role: {
        $in: req.query.role
      },
      department: req.query.department,
    }, '-salt -hashedPassword', function(err, users) {
      if (err) return res.status(500).send(err);
      res.status(200).json(users);
    });
  }
};

function isEmpty(obj) {
  for (var i in obj)
    if (obj.hasOwnProperty(i)) return false;
  return true;
}
;
/**
 * Creates a new user
 *  This function is to create a user with a access code, for users using the "register page" to "register" please refer to userRegistration.
 */
exports.create = function(req, res, next) {
  var newUser = new User(req.body);

  //append uni onto end, can be pulled from db
  newUser.email = newUser.email + '@shu.ac.uk';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    res.json({
      user: user
    });
  });
};


/**
 *  Registers an already created user for access to this system. Using a pre-defined access code, the user can get into the system and create a password.
 */
exports.userRegistration = function(req, res, next) {
  //var newUser = new User(req.body);
  User.find(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({
      _id: user._id
    }, config.secrets.session, {
      expiresInMinutes: 60 * 5
    });
    res.json({
      token: token
    });
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
