/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /groups              ->  index
 * POST    /groups              ->  create
 * GET     /groups/:id          ->  show
 * PUT     /groups/:id          ->  update
 * DELETE  /groups/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Group = require('./group.model');

// Get list of groups (or limit by querystring)
exports.index = function(req, res) {
	var result = {};
	Group
		.find(req.query)
		.populate('students.user')
		.populate('tutors.user')
		.lean()
		.exec(function(err, groups) {
			if (err) {
				return handleError(res, err);
			}
			result.groups = groups;
			Group.count({}, function(err, count) {
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
	Group
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
		.exec(function(err, groups) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(groups)) {
				return res.status(404).send('Not Found');
			}
			//push into single arr
			for (var a = 0; a < groups.length; a++) {
				for (var b = 0; b < groups[a].tutors.length; b++) {
					// check that not null from elemMatch,
					// and user isn't same as logged in user
					if (groups[a].tutors[b].user && groups[a].tutors[b].user._id != req.params.userid) {
						result.collaborators.push(groups[a].tutors[b].user);
					}
				}
			}

			return res.status(200).json(result);

		});
};

// Get list of groups with association to user
exports.getForMe = function(req, res) {
	var result = {};
	Group
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
		.exec(function(err, groups) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(groups)) {
				return res.status(404).send('Not Found');
			}
			result.groups = groups;
			Group.count({
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

// Get list of groups with association to user
exports.getNotForMe = function(req, res) {
	var result = {};
	Group
		.find({
			'tutors.user': {
				'$ne': req.params.userid
			}
		})
		.populate('students.user')
		.populate('tutors.user')
		.lean()
		.exec(function(err, groups) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(groups)) {
				return res.status(404).send('Not Found');
			}
			result.groups = groups;
			Group.count({
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

// Get a single group
exports.show = function(req, res) {
	Group.findById(req.params.id)
		.populate('students.user')
		.populate('tutors.user')
		.exec(function(err, group) {
			if (err) {
				return handleError(res, err);
			}
			if (!group) {
				return res.status(404).send('Not Found');
			}
			return res.json(group);
		});
};

// Creates a new group in the DB.
exports.create = function(req, res) {
	Group.create(req.body, function(err, group) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(201).json(group);
	});
};

// Updates an existing group in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Group.findById(req.params.id, function(err, group) {
		if (err) {
			return handleError(res, err);
		}
		if (!group) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(group, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(group);
		});
	});
};

// Deletes a group from the DB.
exports.destroy = function(req, res) {
	Group.findById(req.params.id, function(err, group) {
		if (err) {
			return handleError(res, err);
		}
		if (!group) {
			return res.status(404).send('Not Found');
		}
		group.remove(function(err) {
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