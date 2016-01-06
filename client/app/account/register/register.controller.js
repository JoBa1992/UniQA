'use strict';

angular.module('uniQaApp')
  .controller('RegisterCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};
	// pull these from db value
	$scope.userTypes = [ "I'm a...","Student","Teacher" ]
	$scope.uTypeSelect = $scope.userTypes[0];
	$scope.universities = [ "I go to...","Aberdeen","Sheffield Hallam","Sheffield University" ]
	$scope.uniSelect = $scope.universities[0];


	$scope.userTypeDropdownSel = function(target) {
		$scope.uTypeSelect = target;
	};
	$scope.uniDropdownSel = function(target) {
		$scope.uniSelect = target;
	};


    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
        })
        .then( function() {
          // Account created, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          err = err.data;
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
