'use strict';

angular.module('UniQA')
	.config(function($stateProvider) {
		$stateProvider
		// .state('login', {
		// 	url: '/',
		// 	templateUrl: 'app/account/login/login.html',
		// 	controller: 'LoginCtrl'
		// })
		// .state('register', {
		// 	url: '/register',
		// 	templateUrl: 'app/account/register/register.html',
		// 	controller: 'RegisterCtrl'
		// })
			.state('messages', {
				url: '/profile/messages',
				templateUrl: 'app/account/profile/messages/messages.html',
				controller: 'MsgCtrl',
				authenticate: true
			})
			.state('settings', {
				url: '/profile/settings',
				templateUrl: 'app/account/profile/settings/settings.html',
				controller: 'SettingsCtrl',
				authenticate: true
			});
	});