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
			console.info(res);

			$scope.myFeedback = res;
			$scope.myFeedbackCount = res.count === 0 ? 0 : res.count;
			$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);

			// if theres no more results, this needs setting, end of the road....?
			// $scope.timelineLoading = 'fa fa-road';
		});

		$scope.viewFeedback = Modal.read.feedback(function() {
			// callback when modal is confirmed
			// refreshUserStats();
			// $scope.refreshUserList();
		});
	});