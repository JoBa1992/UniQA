'use strict';

/**
 * Injects SVG into frame
 */
angular.module('uniQaApp')
	.directive('extSvg', ['$compile', function($compile) {
		return {
			restrict: 'E',
			scope: {

				/**
				 * @doc property
				 * @propertyOf extSvg
				 * @name content
				 * @description
				 * Contains a SVG string.
				 */
				content: '='
			},
			link: function($scope, $element) {
				$element.replaceWith($compile('<svg xmlns="http://www.w3.org/2000/svg" style="width:100%;" alt="Alternate Text" class="img-responsive" viewBox="0 0 43 43">' + $scope.content + '</svg>')($scope.$parent));
			}
		};
	}])