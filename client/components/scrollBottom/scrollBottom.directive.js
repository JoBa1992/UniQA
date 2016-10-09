'use strict';

/**
 * Custom Directive for loading animation
 */
angular.module('UniQA')
	.directive('scrollBottom', ['$timeout', function($timeout) {
		return {
			scope: {
				ngScrollBottom: "="
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
		}
	}]);