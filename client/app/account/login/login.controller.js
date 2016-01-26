'use strict';

angular.module('uniQaApp')
  .controller('LoginCtrl', function($scope, Auth, Thing, $location) {
    $scope.user = {};
    // for quicker access, remove once finished
    $scope.user.email = "joba@uniqa.co.uk";
    $scope.errors = {};

    $scope.password = {};
    $scope.password.inputType = 'password';
    $scope.password.icon = 'glyphicon glyphicon-eye-close';

    Thing.getByName('uniEmail').then(function(val) {
      // only returns one element
      $scope.uniEmail = val.content[0];
    });
    Thing.getByName("uniName").then(function(val) {
      // only returns one element
      $scope.uniName = val.content[0];
    });

    $scope.togglePassInput = function() {
      if ($scope.password.inputType == 'password') {
        $scope.password.inputType = 'text';
        $scope.password.icon = 'glyphicon glyphicon-eye-open';
      } else {
        $scope.password.inputType = 'password';
        $scope.password.icon = 'glyphicon glyphicon-eye-close';
      }
    }

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