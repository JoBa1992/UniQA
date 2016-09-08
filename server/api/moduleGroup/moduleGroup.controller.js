/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /moduleGroups              ->  index
 * POST    /moduleGroups              ->  create
 * GET     /moduleGroups/:id          ->  show
 * PUT     /moduleGroups/:id          ->  update
 * DELETE  /moduleGroups/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Module = require('./moduleGroup.model');
var User = require('../user/user.model');

var fs = require('fs');

function csvToArray(strData, strDelimiter) {
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ',');
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp((
		// Delimiters.
		'(\\' + strDelimiter + '|\\r?\\n|\\r|^)' +
		// Quoted fields.
		'(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|' +
		// Standard fields.
		'([^\"\\' + strDelimiter + '\\r\\n]*))'), 'gi');
	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [
		[]
	];
	// Create an array to hold our individual pattern
	// matching moduleGroups.
	var arrMatches;
	var strMatchedDelimiter;
	var strMatchedValue;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	/*jshint -W084 */
	while (arrMatches = objPattern.exec(strData)) {
		// Get the delimiter that was found.
		strMatchedDelimiter = arrMatches[1];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push([]);
		}
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[2]) {
			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			strMatchedValue = arrMatches[2].replace(
				new RegExp('\"\"', 'g'), '\"');
		} else {
			// We found a non-quoted value.
			strMatchedValue = arrMatches[3];
		}
		// Now that we have our value string, let's add
		// it to the data array.
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	// Return the parsed data.
	return (arrData);
}

function csvToJSON(csv) {
	var array = csvToArray(csv);
	var objArray = [];
	for (var i = 1; i < array.length; i++) {
		objArray[i - 1] = {};
		for (var k = 0; k < array[0].length && k < array[i].length; k++) {
			var key = array[0][k];
			objArray[i - 1][key] = array[i][k];
		}
	}

	var json = JSON.stringify(objArray);
	var str = json.replace(/},/g, '},\r\n');

	return str;
}

// Convert Csv file to JSON and pass back
exports.convertCsvToJSON = function(req, res) {
	var result = [];
	if (req.files.length > 0) {
		if (req.files.length > 1) {
			req.files.forEach(function(item) {
				fs.readFile(item.path, 'utf8', function(err, data) {
					if (err) {
						return res.status(400).send(err);
					}
					var tempStore = JSON.parse(csvToJSON(data));

					for (var x = 0; x < tempStore.length; x++) {
						if ((tempStore[x].id || tempStore[x]._id || tempStore[x].Username) &&
							(tempStore[x].name || tempStore[x].fullName || (tempStore[x].forename && tempStore[x].surname) || (tempStore[x]['First Name'] && tempStore[x]['Last Name']))) {
							result.push({
								user: tempStore[x].id || tempStore[x]._id || tempStore[x].Username,
								course: tempStore[x].course,
								group: tempStore[x].group,
								fullName: tempStore[x].name || tempStore[x].fullName,
								forename: tempStore[x].forename || tempStore[x]['First Name'] || tempStore[x].name.split(" ").shift(),
								surname: tempStore[x].surname || tempStore[x]['Last Name'] || tempStore[x].name.split(" ").pop()
							});
						}
					}
					fs.unlink(item.path);
					if (item.newId === req.files[req.files.length - 1].newId) {
						return res.status(200).send(result);
					}

				});
			});
		} else {
			fs.readFile(req.files[0].path, 'utf8', function(err, data) {
				if (err) {
					return res.status(400).send(err);
				}
				var tempStore = JSON.parse(csvToJSON(data));

				// loop through data and remove any invalid fields?
				for (var x = 0; x < tempStore.length; x++) {
					if ((tempStore[x].id || tempStore[x]._id || tempStore[x].Username) &&
						(tempStore[x].name || tempStore[x].fullName || (tempStore[x].forename && tempStore[x].surname) || (tempStore[x]['First Name'] && tempStore[x]['Last Name']))) {
						result.push({
							user: tempStore[x].id || tempStore[x]._id || tempStore[x].Username,
							course: tempStore[x].course,
							group: tempStore[x].group,
							fullName: tempStore[x].name || tempStore[x].fullName,
							forename: tempStore[x].forename || tempStore[x]['First Name'] || tempStore[x].name.split(" ").shift(),
							surname: tempStore[x].surname || tempStore[x]['Last Name'] || tempStore[x].name.split(" ").pop()
						});
					}
					// else don't push, doesn't meet restrictions
				}
				fs.unlink(req.files[0].path);
				return res.status(200).send(result);
			});
		}
	} else {
		return res.status(400).send('Invalid file');
	}
};


// Get list of moduleGroups (or limit by querystring)
exports.index = function(req, res) {
	var result = {};
	Module
		.find(req.query)
		.populate('students.user')
		.populate('tutors.user')
		.lean()
		.exec(function(err, moduleGroups) {
			if (err) {
				return handleError(res, err);
			}
			result.moduleGroups = moduleGroups;
			Module.count({}, function(err, count) {
				if (err) {
					return handleError(res, err);
				}
				result.count = count;
				return res.status(200).json(result);
			});

		});
};

// Get list of moduleGroups with association to user
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
		.exec(function(err, moduleGroups) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(moduleGroups)) {
				return res.status(404).send('Not Found');
			}
			result.moduleGroups = moduleGroups;
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

// Get list of moduleGroups with association to user
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
		.exec(function(err, moduleGroups) {
			if (err) {
				return handleError(res, err);
			}
			if (_.isEmpty(moduleGroups)) {
				return res.status(404).send('Not Found');
			}
			result.moduleGroups = moduleGroups;
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

// Get a single moduleGroup
exports.show = function(req, res) {
	Module.findById(req.params.id)
		.populate('students.user')
		.populate('tutors.user')
		.exec(function(err, moduleGroup) {
			if (err) {
				return handleError(res, err);
			}
			if (!moduleGroup) {
				return res.status(404).send('Not Found');
			}
			return res.json(moduleGroup);
		});
};

// Creates a new moduleGroup in the DB. Users are checked against the user model,
// and if they don't exist they're created and referenced back to the created moduleGroup
exports.create = function(req, res) {
	// hack, but no es6 or spread operator :(
	var moduleGroupStudents = JSON.parse(JSON.stringify(req.body.students));

	var studentList = [];
	for (var x = 0; x < moduleGroupStudents.length; x++) {
		studentList.push(moduleGroupStudents[x].user);
	}

	User.find({
			_id: {
				$in: studentList
			}
		})
		.lean()
		.exec(function(err, usersWhoExist) {
			//	loop through usersWhoExist, compare against original array,
			// and pull out users who exist from original array.

			// temp
			/* jshint loopfunc:true */
			for (var x = 0; x < usersWhoExist.length; x++) {
				moduleGroupStudents = moduleGroupStudents.filter(function(user) {
					return usersWhoExist[x]._id !== user.user;
				});
			}

			var studentsToCreate = [];

			for (var z = 0; z < moduleGroupStudents.length; z++) {
				if (moduleGroupStudents[z]) {
					studentsToCreate.push({
						_id: moduleGroupStudents[z].user,
						forename: moduleGroupStudents[z].forename,
						surname: moduleGroupStudents[z].surname,
						role: 'student'
					});
				}
			}

			// create users who still remain from original request
			if (!_.isEmpty(moduleGroupStudents)) {
				User.insertMany(studentsToCreate, function(err, docs) {
					if (err) {
						console.info(err);
					}

					Module.create(req.body, function(err, moduleGroup) {
						if (err) {
							return handleError(res, err);
						}
						return res.status(201).json(moduleGroup);
					});

				});
			} else {
				Module.create(req.body, function(err, moduleGroup) {
					if (err) {
						return handleError(res, err);
					}
					return res.status(201).json(moduleGroup);
				});
			}

		});
};

// Updates an existing moduleGroup in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Module.findById(req.params.id, function(err, moduleGroup) {
		if (err) {
			return handleError(res, err);
		}
		if (!moduleGroup) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(moduleGroup, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(moduleGroup);
		});
	});
};

// Deletes a moduleGroup from the DB.
exports.destroy = function(req, res) {
	Module.findById(req.params.id, function(err, moduleGroup) {
		if (err) {
			return handleError(res, err);
		}
		if (!moduleGroup) {
			return res.status(404).send('Not Found');
		}
		moduleGroup.remove(function(err) {
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