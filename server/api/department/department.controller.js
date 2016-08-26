/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /departments              ->  index
 * POST    /departments              ->  create
 * GET     /departments/:id          ->  show
 * PUT     /departments/:id          ->  update
 * DELETE  /departments/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Department = require('./department.model');

// Get list of departments (or limit by querystring)
exports.index = function(req, res) {
	Department
		.find(req.query)
		.populate({
			path: "subdepartment.modules.tutors.tutor",
			populate: 'User'
		})
		.populate({
			path: "subdepartment.modules.users",
			populate: 'User'
		})
		.sort('name subdepartment.name')
		.exec(function(err, departments) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(departments);
		});
};

// Get a single department
exports.show = function(req, res) {
	Department.findById(req.params.id, function(err, department) {
		if (err) {
			return handleError(res, err);
		}
		if (!department) {
			return res.status(404).send('Not Found');
		}
		return res.json(department);
	});
};

// Creates a new department in the DB.
exports.create = function(req, res) {
	Department.create(req.body, function(err, department) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(201).json(department);
	});
};

// Updates an existing department in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Department.findById(req.params.id, function(err, department) {
		if (err) {
			return handleError(res, err);
		}
		if (!department) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(department, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(department);
		});
	});
};

// Deletes a department from the DB.
exports.destroy = function(req, res) {
	Department.findById(req.params.id, function(err, department) {
		if (err) {
			return handleError(res, err);
		}
		if (!department) {
			return res.status(404).send('Not Found');
		}
		department.remove(function(err) {
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