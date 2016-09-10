'use strict';

angular.module('UniQA')
	.controller('PageHeaderCtrl', function($scope, $location, Auth) {
		$scope.title = 'page title';
		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};
	});