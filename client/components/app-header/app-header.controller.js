'use strict';

angular.module('UniQA')
	.controller('AppHeaderCtrl', function($rootScope, $scope, $location, Auth) {
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.currentUser = Auth.getCurrentUser;

		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};
	});