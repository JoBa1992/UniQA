'use strict';

angular.module('uniQaApp')
	.controller('HomeCtrl', function($scope, $window) {

		//dynamic page size set for browser compatibility
		$scope.banHeight = ($window.innerHeight - 71) + 'px';

		var slideCnt = 1; // amount of slides
		var slides = $scope.slides = []; // slide array
		$scope.addSlide = function() {
			slides.push({
				image: '',
				text: [''][slides.length % slideCnt] + ' ' + [''][slides.length % slideCnt]
			});
		};




		for (var i = 0; i < slideCnt; i++) {
			$scope.addSlide();
		}
		$scope.scrollTo = function() {

			// if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			// 	var target = $(this.hash);
			// 	target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			// 	if (target.length) {
			// 		$('html,body').animate({
			// 			scrollTop: target.offset().top
			// 		}, 1000);
			// 	return false;
			// 	}
			// }
		}
	});

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
	.controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function($scope, $timeout, $transition, $q) {}]).directive('carousel', [function() {
		return {}
	}]);