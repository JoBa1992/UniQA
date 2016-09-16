'use strict';

angular.module('UniQA')
	.controller('SessionRegisterCtrl', function($scope, $location, Auth, Lesson, Session) {
		// check querystring
		var querystring = $location.search();
		if (querystring.m === 'notReady') {
			// if m is set, a message needs displaying on screen.
			// default msg, can be set again
			$scope.error = 'Session is not ready to be joined just yet.';
		} else if (querystring.m === 'notExist') {
			$scope.error = 'That session does not exist';
		}
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.lessonHeightMarginTop = '-1.4em;';

		var me = Auth.getCurrentUser();

		$scope.register = {
			'session': ''
		};


		$scope.sessionAltRegister = function() {
			// console.info($scope.register.session);
			Session.register({
				'user': me._id,
				'altAccess': $scope.register.session
			}).then(function(res) {
				var now = moment.utc();
				var _second = 1000;
				var _minute = _second * 60;

				var start = moment(res.startTime) - (res.timeAllowance * _minute);
				var end = moment(res.endTime) + (res.timeAllowance * _minute);

				// var start = moment(moment(res.startTime).utc() - (res.timeAllowance * _minute)).utc();
				// var end = moment(moment(res.endTime).utc() + (res.timeAllowance * _minute)).utc();

				// if session isn't between goalposts kick back to session start
				if (now >= start && now <= end) {
					$location.path('/session/active/' + res._id);
				} else {
					$scope.error = 'Session is not ready to be joined just yet.';
				}

				// will be booted back if session isn't ready yet
			}).catch(function(err) {
				console.info(err);
				//display message on screen saying can't find
				$scope.error = 'Session cannot be found';
			});
		};


	});