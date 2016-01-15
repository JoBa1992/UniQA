'use strict';

angular.module('uniQaApp')
  .controller('LoginCtrl', function($scope, Auth, Thing, $location) {
    $scope.user = {};
    // for quicker access, remove once finished
    $scope.user.email = "JoBa@uniqa.co.uk";
    $scope.errors = {};

    Thing.getByName("uniName").then(function(val) {
      // only returns one element
      $scope.uniName = val.content[0];
    });

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
            console.info(err);
            $scope.errors.other = err.message;
          });
      }
    };

  });
