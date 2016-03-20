'use strict';

/**
 * Loads content in below feedback when user reaches offset of page
 */
angular.module('uniQaApp')
	.directive('infiniteScroll', ["$document", function($document) {
		return {
			link: function(scope, element, attrs) {
				var offset = parseInt(attrs.distance) || 0;
				var e = element[0];

				$(document).bind('scroll', function() {
					// 157 adds up to other elements heights, offset reduces it by the amnt specified
					if (scope.$eval(attrs.canLoad) && (($(document)[0].body.scrollTop + $(document)[0].body.offsetHeight) >= ($(document)[0].body.offsetHeight + 157 - offset))) {
						scope.$apply(attrs.infiniteScroll);
					}
				});
			}
		};
	}])