'use strict';

angular.module('UniQA')
	.controller('AdminStatsCtrl', function($scope, $http, Auth, User) {

		// Use the User $resource to fetch all users
		$scope.users = User.query();


	});