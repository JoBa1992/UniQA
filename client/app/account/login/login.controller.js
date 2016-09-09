'use strict';

angular.module('UniQA')
	.controller('LoginCtrl', function($scope, $location, Auth, Thing, ngToast) {
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
			ngToast.create({
				className: 'danger',
				timeout: 25000,
				content: 'We\'re&nbsp;working&nbsp;on&nbsp;it&nbsp;:)'
			});
			// ngToast.create({
			// 	className: 'danger',
			// 	timeout: 25000,
			// 	content: 'We\'re&nbsp;working&nbsp;on&nbsp;it&nbsp;:)'
			// });
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