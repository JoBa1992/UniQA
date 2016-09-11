'use strict';

angular.module('UniQA')
	.controller('LoginCtrl', function($scope, $location, $mdToast, Auth, Thing) {
		var last = {
			bottom: false,
			top: true,
			left: false,
			right: true
		};

		$scope.toastPosition = angular.extend({}, last);

		$scope.user = {};

		$scope.user.username = ''; //joba@uniqa.co.uk
		$scope.errors = {};

		$scope.password = {};
		$scope.password.inputType = 'password';
		$scope.password.icon = 'glyphicon glyphicon-eye-close';

		Thing.getByName('uniEmail').then(function(val) {
			// only returns one element
			$scope.uniEmail = val.content[0];
		});
		Thing.getByName('uniName').then(function(val) {
			// only returns one element
			$scope.uniName = val.content[0];
		});

		$scope.togglePassInput = function() {
			if ($scope.password.inputType === 'password') {
				$scope.password.inputType = 'text';
				$scope.password.icon = 'glyphicon glyphicon-eye-open';
			} else {
				$scope.password.inputType = 'password';
				$scope.password.icon = 'glyphicon glyphicon-eye-close';
			}
		};

		$scope.googleSignIn = function() {
			var pinTo = $scope.getToastPosition();
			$mdToast.show(
				$mdToast.simple()
				.textContent("We\'re working on it!")
				.position(pinTo)
				.hideDelay(3000)
				.theme('danger-toast') // temp hack
			);
		};

		$scope.getToastPosition = function() {
			sanitizePosition();

			return Object.keys($scope.toastPosition)
				.filter(function(pos) {
					return $scope.toastPosition[pos];
				})
				.join(' ');
		};

		function sanitizePosition() {
			var current = $scope.toastPosition;

			if (current.bottom && last.top) current.top = false;
			if (current.top && last.bottom) current.bottom = false;
			if (current.right && last.left) current.left = false;
			if (current.left && last.right) current.right = false;

			last = angular.extend({}, current);
		}

		$scope.showSimpleToast = function() {
			var pinTo = $scope.getToastPosition();

			$mdToast.show(
				$mdToast.simple()
				.textContent('Simple Toast!')
				.position(pinTo)
				.hideDelay(3000)
			);
		};

		$scope.login = function(form) {
			$scope.submitted = true;

			if (form.$valid) {
				Auth.login({
						username: $scope.user.username,
						password: $scope.user.password
					})
					.then(function() {
						// Logged in, redirect to home
						$location.path('/session/start');
					})
					.catch(function(err) {
						// throw message on screen
						$scope.errors.other = err.message;
					});
			}
		};

	});