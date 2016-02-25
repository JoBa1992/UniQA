'use strict';

/**
 * Removes server error when user updates input
 */
angular.module('uniQaApp')
	.directive('comingSoon', ['$timeout', function($timeout) {
		return {
			scope: {
				comingSoon: '='
			},
			link: function($scope, $element) {
				$scope.$watchCollection('comingSoon', function() {
					// if (newValue) {
					$timeout(function() {
						$element.scrollTop($element[0].scrollHeight);
					}, 0);
					// }
				});
			}
		};
	}]);