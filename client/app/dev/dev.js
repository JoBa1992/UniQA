'use strict';

angular.module('uniQaApp')
	.config(function($stateProvider) {
		$stateProvider
			.state('dev', {
				url: '/dev',
				templateUrl: 'app/dev/dev.html',
				controller: 'DevCtrl'
			});
	});