/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /modules              ->  index
 * POST    /modules              ->  create
 * GET     /modules/:id          ->  show
 * PUT     /modules/:id          ->  update
 * DELETE  /modules/:id          ->  destroy
 */

'use strict';

// TODO:
// 	-	Module Pagination
//		-	Your modules should show a list of up to 20 modules
//		-	Explorable modules should show a list of up to 50 modules
//	-	Create module clone endpoint, which can take everything from the original apart from the _id, 
//		giving the options to:
//		-	clone all details
//		-	clone all apart from the module groups

var _ = require('lodash');
var Module = require('./module.model');

// Get list of modules (or limit by querystring)
exports.index = function(req, res) {
	var result = {};
	Module
		.find(req.query)
		.populate('groups.group')
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

// Get list of modules with association to user
exports.getModulesForUser = function(req, res) {
	var result = {};
	Module
		.find({
			'tutors': {
				'$elemMatch': {
					'user': req.params.userid
				}
			}
		})
		.populate('groups.group')
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

// Get list of modules with association not related to user
exports.getOtherModules = function(req, res) {
	var result = {};
	Module
		.find({
			'tutors.user': {
				'$ne': req.params.userid
			}
		})
		.populate('groups.group')
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
		.populate('groups.group')
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