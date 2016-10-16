'use strict';

angular.module('UniQA')
	.controller('AppHeaderCtrl', function($rootScope, $scope, $location, Auth, Modal) {
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.currentUser = Auth.getCurrentUser;

		var last = {
			bottom: true,
			top: false,
			left: false,
			right: true
		};

		var originatorEv;

		$scope.toastPosition = angular.extend({}, last);

		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};

		$scope.openIssueCreateModal = Modal.create.issue(function(issue) {
			return showIssueRaisedToast(issue._id);
		});

		$scope.getToastPosition = function() {
			sanitizePosition();

			return Object.keys($scope.toastPosition)
				.filter(function(pos) {
					return $scope.toastPosition[pos];
				}).join(' ');
		};

		function sanitizePosition() {
			var current = $scope.toastPosition;

			if (current.bottom && last.top) current.top = false;
			if (current.top && last.bottom) current.bottom = false;
			if (current.right && last.left) current.left = false;
			if (current.left && last.right) current.right = false;

			last = angular.extend({}, current);
		}
		var showIssueRaisedToast = function(id) {
			var pinTo = $scope.getToastPosition();
			var toast = $mdToast.simple()
				.textContent('Issue has been raised with reference: {{id}}')
				.hideDelay(10000)
				.position(pinTo);

			$mdToast.show(toast).then(function(response) {

			});
		}
	});