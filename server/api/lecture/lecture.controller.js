/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /lectures              ->  index
 * POST    /lectures              ->  create
 * GET     /lectures/:id          ->  show
 * PUT     /lectures/:id          ->  update
 * DELETE  /lectures/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Lecture = require('./lecture.model');

// Get list of lectures (or limit by querystring)
exports.index = function(req, res) {
  Lecture.find({
      createdBy: req.query.createdBy
    })
    .skip((req.query.page - 1) * req.query.paginate)
    .limit(req.query.paginate)
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
        return res.status(200).json(lectures);
      }

    });
};

exports.count = function(req, res) {
  Lecture.count(req.query.id, function(err, count) {
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
      return handleError(res, err);
    }
    return res.status(201).json(lecture);
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