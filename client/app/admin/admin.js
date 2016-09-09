'use strict';

angular.module('UniQA')
	.config(function($stateProvider) {
		$stateProvider
			.state('genMgr', {
				url: '/admin/general',
				templateUrl: 'app/admin/general/general.html',
				controller: 'AdminGenCtrl',
				authenticate: true
			})
			.state('userMgr', {
				url: '/users',
				templateUrl: 'app/admin/users/users.html',
				controller: 'AdminUserCtrl',
				authenticate: true
			});
		//   .state('depMgr', {
		//     url: '/admin/departments',
		//     templateUrl: 'app/admin/departments/departments.html',
		//     controller: 'AdminDepCtrl',
		//     authenticate: true
		//   })
	});