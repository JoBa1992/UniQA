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

var fs = require('fs');

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
	// matching modules.
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
	// TODO: do foreach on multiple files, add onto array. Determine whether to split if fullname exists
	console.info(req.files);
	var result = [];
	if (req.files.length > 0) {
		if (req.files.length > 1) {
			req.files.forEach(function(item) {
				// need to forEach here...
				fs.readFile(req.files[0].path, 'utf8', function(err, data) {
					if (err) {
						return res.status(400).send(err);
					}
					// console.info(data);
					result = JSON.parse(csvToJSON(data));
					// console.info(result);
					fs.unlink(req.files[0].path);
					return res.status(200).send(result);

					// console.info(fileRows);
					// // convert userid into email address
					// for (var user in fileRows) {
					// 	fileRows[user].email = String.fromCharCode(fileRows[user].id.charCodeAt(0) + 48) + fileRows[user].id.substring(1, fileRows[user].id.length);
					// 	result.push(fileRows[user]);
					// }
				});
			});
		} else {
			fs.readFile(req.files[0].path, 'utf8', function(err, data) {
				if (err) {
					return res.status(400).send(err);
				}
				// console.info(data);
				result = JSON.parse(csvToJSON(data));
				// console.info(result);
				fs.unlink(req.files[0].path);
				return res.status(200).send(result);
				// result = fileRows;
				// console.info(fileRows);
				// convert userid into email address
				// for (var user in fileRows) {
				// 	fileRows[user].email = String.fromCharCode(fileRows[user].id.charCodeAt(0) + 48) + fileRows[user].id.substring(1, fileRows[user].id.length);
				// 	result.push(fileRows[user]);
				// }
			});
		}
	} else {
		return res.status(400).send('Invalid file');
	}


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