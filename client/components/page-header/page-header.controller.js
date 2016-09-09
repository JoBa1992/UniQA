'use strict';

angular.module('UniQA')
	.controller('PageHeaderCtrl', function($scope, $location, Auth) {
		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};
	});