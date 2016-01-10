'use strict';

angular.module('uniQaApp')
  .controller('LoginCtrl', function($scope, Auth, $location) {
    $scope.user = {};
    // for quicker access, remove once finished
    $scope.user.email = "JoBa@uniqa.co.uk";
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;


      if (form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
          .then(function() {
            // Logged in, redirect to home
            $location.path('/profile');
          })
          .catch(function(err) {
            $scope.errors.other = err.message;
          });
      }
    };

  });
