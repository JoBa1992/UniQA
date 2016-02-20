'use strict';

/**
 * Custom Directive for loading animation
 */
angular.module('uniQaApp')
	.directive('loading', function() {
		return {
			restrict: 'A',
			template: '<div class="spinner spinner--orange">' +
				'<div class="spinner__item1"></div>' +
				'<div class="spinner__item2"></div>' +
				'<div class="spinner__item3"></div>' +
				'<div class="spinner__item4"></div>' +
				'</div>',
			scope: {}
		};
	})