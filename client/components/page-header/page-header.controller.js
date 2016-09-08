'use strict';

angular.module('uniQaApp')
	.controller('PageHeaderCtrl', function($scope, $location, Auth) {
		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};
	});