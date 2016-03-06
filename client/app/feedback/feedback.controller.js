'use strict';

angular.module('uniQaApp')
	.controller('FeedbackCtrl', function($scope, Auth, Session, Modal) {
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		// used to swap sides on css
		$scope.inverter = false;

		$scope.timelineLoading = 'fa fa-refresh rotating';
		var me = Auth.getCurrentUser();

		Session.getForMe({
			author: me._id,
			historic: true,
			order: '-startTime'
		}).then(function(res) {

			// attach expected number to each object inside response
			_.some(res, function(session) {
				session.expected = 0;
				_.some(session.groups, function(group) {
					// bad nesting due to dodgy model, needs checking
					session.expected += group.group.students.length;
				});

			});

			// attach average rating to each object inside response
			_.some(res, function(session) {
				// averages numbers inside feedback, returns avg
				session.avgRating = avgFeedback(session.feedback);
			});

			$scope.myFeedback = res;
			$scope.myFeedbackCount = res.count === 0 ? 0 : res.count;
			$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);

			// if theres no more results, this needs setting, end of the road....?
			// $scope.timelineLoading = 'fa fa-road';
		});

		function avgFeedback(arr) {
			return _.reduce(arr, function(num, memo) {
				return num + parseFloat(memo.rating);
			}, 0) / (arr.length === 0 ? 1 : arr.length);
		}

		$scope.viewFeedback = Modal.read.feedback(function() {
			// callback when modal is confirmed
			// refreshUserStats();
			// $scope.refreshUserList();
		});
	});