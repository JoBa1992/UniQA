'use strict';

angular.module('uniQaApp')
	.config(function($stateProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'app/account/login/login.html',
				controller: 'LoginCtrl'
			})
			.state('register', {
				url: '/register',
				templateUrl: 'app/account/register/register.html',
				controller: 'RegisterCtrl'
			})
			.state('qrListener', {
				url: '/qr/register/:sessionid',
				templateUrl: 'app/account/login/login.html',
				controller: 'QrRegistrationCtrl'
			})
			.state('notifications', {
				url: '/profile/notifications',
				templateUrl: 'app/account/profile/notifications/notifications.html',
				controller: 'NotificationCtrl',
				authenticate: true
			})
			.state('profile', {
				url: '/profile',
				templateUrl: 'app/account/profile/profile.html',
				controller: 'ProfileCtrl',
				authenticate: true
			})
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