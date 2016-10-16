/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /sessions              ->  index
 * POST    /sessions              ->  create
 * GET     /sessions/:id          ->  show
 * PUT     /sessions/:id          ->  update
 * DELETE  /sessions/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var moment = require('moment'); // date handling
var Session = require('../session/session.model');
var ModuleGroup = require('../moduleGroup/moduleGroup.model');
var Module = require('../module/module.model');

exports.moduleAttendence = function(req, res) {
	var moduleId = req.params.moduleid;

	Module.findById(moduleId).select('groups').populate('groups.group').exec(function(err, groups) {
		if (err) {
        	return handleError(res, err);
        } else {
			var groupIdArr = [];
			groups.groups.forEach(function(group) {
				groupIdArr.push(group.group._id);
			})

			Session.find({'groups.moduleGroup': { $in: groupIdArr}}).select('registered groups').exec(function(err, sessions) {
				var totalAttendance = 0;
				groups.groups.forEach(function(group) {
					totalAttendance += group.group.students.length;
				})

				var averageAttendanceOverall = 0;
				var attendances = [];
				sessions.forEach(function(session) {
					var averageAttendance = 0;
					averageAttendance = (session.registered.length / totalAttendance) * 100;
					averageAttendanceOverall += averageAttendance;
					attendances.push({
						Attendance: averageAttendance,
						Session_Id: session._id,
						Module_Groups: session.groups});
				})
				averageAttendanceOverall = averageAttendanceOverall / sessions.length;
				var attendanceObj = {
					Average_Attendance: averageAttendanceOverall,
					Module_Id: moduleId,
					Attendances: attendances
				};

				res.json(attendanceObj);
			})
		}
	})
}

exports.tutorAttendance = function (req, res) {
	var tutorId = req.params.tutorid;

	Module.find({'tutors.user': tutorId}).populate('groups.group tutors.users').exec(function(err, modules) {
		if (err) {
        	return handleError(res, err);
        } else {
			modules.forEach(function(module) {
				var groupIdArr = [];
				var attendancesArr = [];

				module.groups.forEach(function(group) {
					groupIdArr.push(group.group._id);
				})

				Session.find({'groups.moduleGroup': { $in: groupIdArr}}).select('registered groups').exec(function(err, sessions) {
					var totalAttendance = 0;
					module.groups.forEach(function(group) {
						totalAttendance += group.group.students.length;
					})

					var averageAttendanceOverall = 0;
					var attendances = [];
					sessions.forEach(function(session) {
						var averageAttendance = 0;
						averageAttendance = (session.registered.length / totalAttendance) * 100;
						averageAttendanceOverall += averageAttendance;
						attendances.push({
							Attendance: averageAttendance,
							Session_Id: session._id,
							Module_Groups: session.groups});
					})

					averageAttendanceOverall = averageAttendanceOverall / sessions.length;
					var attendanceObj = {
						Average_Attendance: averageAttendanceOverall,
						Module_Id: module._id,
						Attendances: attendances,
						Tutor_Id: tutorId
					};
					attendancesArr.push(attendanceObj);
				})
				res.json(attendancesArr);
			})
		}
	})
}

function handleError(res, err) {
	return res.status(500).send(err);
}
