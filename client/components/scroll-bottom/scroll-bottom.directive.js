'use strict';

/**
 * Removes server error when user updates input
 */
angular.module('uniQaApp')
	.directive('scrollBottom', ['$timeout', function($timeout) {
		return {
			scope: {
				scrollBottom: '='
			},
			link: function($scope, $element) {
				$scope.$watchCollection('scrollBottom', function(newValue) {
					if (newValue) {
						$timeout(function() {
							$element.scrollTop($element[0].scrollHeight);
						}, 0);
					}
				});
			}
		};
	}]);