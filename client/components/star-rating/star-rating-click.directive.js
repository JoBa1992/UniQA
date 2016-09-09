'use strict';

/**
 * Star clicking functionality for lecture session feedback
 */
angular.module('UniQA')
	.directive('starRatingClick', function() {
		return {
			restrict: 'A',
			template: '<ul class="rating">' +
				' <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)"> ' +
				' <i class="fa" ng-class="{\'fa-star\': star.filled==\'true\', \'fa-star-half-o\': star.filled==\'half\', \'fa-star-o\': star.filled==\'false\'}"></i>' +
				'</li> ' +
				'</ul>',
			scope: {
				ratingValue: '=',
				max: '=',
				onRatingSelect: '&'
			},
			link: function(scope /*, elem, attrs*/ ) {
				var updateStars = function() {
					scope.stars = [];
					var starIterations = [];
					// always get either whole or .5
					scope.ratingValue = Math.round(scope.ratingValue * 2) / 2;
					// loop through and get each individual star/half
					for (var x = 0; x < scope.ratingValue; x++) {
						// if its got a decimal point
						if (String(scope.ratingValue).split('.')[1] === '5') {
							if (x === scope.ratingValue - 0.5) {
								starIterations.push(0.5);
							} else {
								starIterations.push(1);
							}
						} else {
							starIterations.push(1);
						}
					}
					var val = 'false';
					// loop through previous array and setup scope val
					for (var star in starIterations) {
						// console.info(starIterations[star]);
						/*jshint -W030 */
						starIterations[star] === 1 ? val = 'true' : starIterations[star] === 0.5 ? val = 'half' : val = 'false';
						scope.stars.push({
							filled: val
						});
					}
					// add in remaining empty
					var leftover = Math.ceil(scope.ratingValue - scope.max);
					if (leftover !== 0) {
						for (var i = 0; i > leftover; i--) {
							scope.stars.push({
								filled: 'false'
							});
						}
					}
				};
				scope.toggle = function(index) {
					if (scope.readonly === undefined || scope.readonly === false) {
						scope.ratingValue = index + 1;
						scope.onRatingSelect({
							rating: index + 1
						});
					}
				};
				scope.$watch('ratingValue',
					function(oldVal, newVal) {
						if (newVal || newVal === 0) {
							updateStars();
						}
					}
				);
			}
		};
	});