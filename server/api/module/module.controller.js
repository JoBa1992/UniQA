/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /modules              ->  index
 * POST    /modules              ->  create
 * GET     /modules/:id          ->  show
 * PUT     /modules/:id          ->  update
 * DELETE  /modules/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Module = require('./module.model');

// Get list of modules (or limit by querystring)
exports.index = function(req, res) {
	var result = {};
	Module
		.find(req.query)
		.populate('students.user')
		.populate('tutors.user')
		.lean()
		.exec(function(err, modules) {
			if (err) {
				return handleError(res, err);
			}
			result.modules = modules;
			Module.count({}, function(err, count) {
				if (err) {
					return handleError(res, err);
				}
				result.count = count;
				return res.status(200).json(result);
			});

		});
};

// used to return possible collaborators for specific user, rips out already
// used client side
exports.getAssocUsers = function(req, res) {
	var query = {
		name: new RegExp(req.query.name, 'i')
	};
	var result = {
		collaborators: []
	};
	Module
		.find({
			'tutors': {
				'$elemMatch': {
					'user': req.params.userid
				}
			}
		})
		.populate({
			path: 'tutors.user',
			match: query
		})
		.lean()
		.exec(function(err, modules) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(modules)) {
				return res.status(404).send('Not Found');
			}
			//push into single arr
			for (var a = 0; a < modules.length; a++) {
				for (var b = 0; b < modules[a].tutors.length; b++) {
					// check that not null from elemMatch,
					// and user isn't same as logged in user
					if (modules[a].tutors[b].user && String(modules[a].tutors[b].user._id) !== String(req.params.userid)) {
						result.collaborators.push(modules[a].tutors[b].user);
					}
				}
			}

			return res.status(200).json(result);

		});
};

// Get list of modules with association to user
exports.getForMe = function(req, res) {
	var result = {};
	Module
		.find({
			'tutors': {
				'$elemMatch': {
					'user': req.params.userid
				}
			}
		})
		.populate('students.user')
		.populate('tutors.user')
		.lean()
		.exec(function(err, modules) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(modules)) {
				return res.status(404).send('Not Found');
			}
			result.modules = modules;
			Module.count({
				'tutors': {
					'$elemMatch': {
						'user': req.params.userid
					}
				}
			}, function(err, count) {
				if (err) {
					return handleError(res, err);
				}
				result.count = count;
				return res.status(200).json(result);
			});

		});


};

// Get list of modules with association to user
exports.getNotForMe = function(req, res) {
	var result = {};
	Module
		.find({
			'tutors.user': {
				'$ne': req.params.userid
			}
		})
		.populate('students.user')
		.populate('tutors.user')
		.lean()
		.exec(function(err, modules) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(modules)) {
				return res.status(404).send('Not Found');
			}
			result.modules = modules;
			Module.count({
				'tutors.user': {
					'$ne': req.params.userid
				}

			}, function(err, count) {
				if (err) {
					return handleError(res, err);
				}
				result.count = count;
				return res.status(200).json(result);
			});
		});
};

// Get a single module
exports.show = function(req, res) {
	Module.findById(req.params.id)
		.populate('students.user')
		.populate('tutors.user')
		.exec(function(err, module) {
			if (err) {
				return handleError(res, err);
			}
			if (!module) {
				return res.status(404).send('Not Found');
			}
			return res.json(module);
		});
};

// Creates a new module in the DB.
exports.create = function(req, res) {
	Module.create(req.body, function(err, module) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(201).json(module);
	});
};

// Updates an existing module in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Module.findById(req.params.id, function(err, module) {
		if (err) {
			return handleError(res, err);
		}
		if (!module) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(module, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(module);
		});
	});
};

// Deletes a module from the DB.
exports.destroy = function(req, res) {
	Module.findById(req.params.id, function(err, module) {
		if (err) {
			return handleError(res, err);
		}
		if (!module) {
			return res.status(404).send('Not Found');
		}
		module.remove(function(err) {
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