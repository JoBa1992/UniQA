'use strict';

angular.module('UniQA')
	.controller('PageHeaderCtrl', function($rootScope, $scope, $location, Auth) {
		$scope.isLoggedIn = Auth.isLoggedIn;

		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};
	});