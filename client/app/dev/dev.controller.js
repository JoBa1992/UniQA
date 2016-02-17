'use strict';

angular.module('uniQaApp')
	.controller('DevCtrl', function($scope, $window, Auth) {
		$scope.me = Auth.getCurrentUser();
		$scope.lecture = {
			startTime: new Date(),
			endTime: new Date(new Date().getTime() + 60 * 60000),
			createdBy: $scope.me.name,
			qActAllowance: 10,
		};

	});