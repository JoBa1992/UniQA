'use strict';

angular.module('UniQA')
	.controller('AdminStatsCtrl', function($rootScope, $scope, $http, Auth, User) {
		$rootScope.showTopNav = false;
		// Use the User $resource to fetch all users
		$scope.users = User.query();


	});