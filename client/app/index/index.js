'use strict';

angular.module('uniQaApp')
	.config(function($stateProvider) {
		$stateProvider
			.state('index', {
				url: '/',
				templateUrl: 'app/index/index.html',
				controller: 'HomeCtrl'
			});
	})
	.directive('bindUnsafeHtml', ['$compile', function($compile) {
		return function(scope, element, attrs) {
			scope.$watch(
				function(scope) {
					// watch the 'bindUnsafeHtml' expression for changes
					return scope.$eval(attrs.bindUnsafeHtml);
				},
				function(value) {
					// when the 'bindUnsafeHtml' expression changes
					// assign it into the current DOM
					element.html(value);

					// compile the new DOM and link it to the current
					// scope.
					// NOTE: we only compile .childNodes so that
					// we don't get into infinite loop compiling ourselves
					$compile(element.contents())(scope);
				}
			);
		};
	}])
	// Custom directive for inserting path into SVG

// .run(function($rootScope, $modalStack) {
//   $rootScope.$on('$routeChangeSuccess', function(newVal, oldVal) {
//     if (oldVal !== newVal) {
//       $modalStack.dismissAll();
//     }
//   });
// })
// .run(function($rootScope, $modalStack) {
//   $modalStack.dismissAll();
// })
;