'use strict';

angular.module('uniQaApp')
	.controller('FooterCtrl', function($scope) {
		$scope.menu = [{
			'title': 'About',
			'link': '/about'
		}, {
			'title': 'Report a problem',
			'link': '/report-issue'
		}];
	});