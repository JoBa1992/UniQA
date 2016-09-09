'use strict';

angular.module('UniQA')
	.controller('FooterCtrl', function($scope, $location) {
		$scope.menu = [{
			'title': 'About',
			'link': '/about',
			'root': true
		}, {
			'title': 'Report a problem',
			'link': '/report-issue',
			'root': false
		}];

		$scope.isRoot = function() {
			if ($location.path() === '/') {
				return true;
			}
			return false;
		};

	});