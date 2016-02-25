'use strict';

angular.module('uniQaApp')
	.controller('RegisterCtrl', function($scope, Auth, Thing, $location) {
		$scope.user = {};
		$scope.roles = {};
		$scope.departments = {};
		$scope.subDepartments = {};
		$scope.errors = {};
		$scope.passStr = '';
		$scope.password = {};
		/**************** Password control ****************/
		$scope.password.inputType = 'password';
		$scope.password.icon = 'glyphicon glyphicon-eye-close';
		// $scope.password.revealPass = 'pass-hide';

		// pull these from db value

		// Thing.getByName('userRoles').then(function(val) {
		//   $scope.roles = val.content;
		//   $scope.user.role = 'Select Role';
		// });
		// Thing.getByName('uniDepartments').then(function(val) {
		//   $scope.departments = val.content[0];
		//   $scope.user.department = 'Select Department';
		// });
		Thing.getByName('uniName').then(function(val) {
			// only returns one element
			$scope.uniName = val.content[0];
		});
		Thing.getByName('uniEmail').then(function(val) {
			// only returns one element
			$scope.uniEmail = val.content[0];
		});
		Thing.getByName('accessCodeLen').then(function(val) {
			// only returns one element
			$scope.accCodeLen = val.content[0];
		});
		// $scope.userRoleDropdownSel = function(target) {
		//   $scope.user.role = target;
		// };
		// $scope.depDropdownSel = function(target) {
		//   $scope.user.department = target;
		// };

		$scope.togglePassInput = function() {
			if ($scope.password.inputType === 'password') {
				$scope.password.inputType = 'text';
				$scope.password.icon = 'glyphicon glyphicon-eye-open';
			} else {
				$scope.password.inputType = 'password';
				$scope.password.icon = 'glyphicon glyphicon-eye-close';
			}
		};

		$scope.testPassword = function() {
			if (!$scope.user.password) {
				$scope.passStr = -1;
				return;
			}

			$scope.passStr = 0;
			if ($scope.user.password.length < 6) {
				$scope.passStr = 0;
				return;
			}

			if (/[0-9]/.test($scope.user.password)) {
				$scope.passStr++;
			}

			if (/[a-z]/.test($scope.user.password)) {
				$scope.passStr++;
			}

			if (/[A-Z]/.test($scope.user.password)) {
				$scope.passStr++;
			}

			if (/[^A-Z-0-9]/i.test($scope.user.password)) {
				$scope.passStr++;
			}
		};

		// init on declaration
		$scope.testPassword();

		$scope.register = function(form) {
			$scope.submitted = true;
			if (form.$valid) {

				Auth.registerUser({
						user: $scope.user
					})
					.then(function() {
						// Account created, redirect to profile, simulating a login
						$location.path('/profile');
					})
					.catch(function(err) {
						console.info(err);
						err = err;
						$scope.errors = {};

						// Update validity of form fields that match the mongoose errors
						angular.forEach(err.errors, function(error, field) {
							form[field].$setValidity('mongoose', false);
							$scope.errors[field] = error.message;
						});
					});
			}
		};

	});