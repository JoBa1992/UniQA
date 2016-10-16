/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /issues              ->  index
 * POST    /issues              ->  create
 * GET     /issues/:id          ->  show
 * PUT     /issues/:id          ->  update
 * DELETE  /issues/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Issue = require('./issue.model');

// Get list of issues (or limit by querystring)
exports.index = function(req, res) {
	Issue.find(req.query, function(err, issue) {
		if (err) {
			return handleError(res, err);
		}
		// if limited by querystring, return single object
		if (req.query)
			issue = issue[0];
		return res.status(200).json(issue);
	});
};

// Get a single issue
exports.show = function(req, res) {
	Issue.findById(req.params.id, function(err, issue) {
		if (err) {
			return handleError(res, err);
		}
		if (!issue) {
			return res.status(404).send('Not Found');
		}
		return res.json(issue);
	});
};

// Creates a new issue in the DB.
exports.create = function(req, res) {
	Issue.create(req.body, function(err, issue) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(201).json(issue);
	});
};

// Updates an existing issue in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Issue.findById(req.params.id, function(err, issue) {
		if (err) {
			return handleError(res, err);
		}
		if (!issue) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(issue, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(issue);
		});
	});
};

// Deletes a issue from the DB.
exports.destroy = function(req, res) {
	Issue.findById(req.params.id, function(err, issue) {
		if (err) {
			return handleError(res, err);
		}
		if (!issue) {
			return res.status(404).send('Not Found');
		}
		issue.remove(function(err) {
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