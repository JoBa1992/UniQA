'use strict';

angular.module('uniQaApp')
  .controller('RegisterCtrl', function($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};
    // pull these from db value
    $scope.userRoles = ["I am a...", "Student", "Teacher"]
    $scope.user.role = $scope.userRoles[0];
    $scope.universities = ["I go to...", "Sheffield Hallam", "Sheffield University"]
    $scope.user.university = $scope.universities[0];


    $scope.userTypeDropdownSel = function(target) {
      $scope.user.role = target;
    };
    $scope.uniDropdownSel = function(target) {
      $scope.user.university = target;
    };


    $scope.register = function(form) {
      $scope.submitted = true;
      if (form.$valid && $scope.user.role != "I'm a..."
        && $scope.user.university != "I go to...") {

        Auth.register({
          user: $scope.user
        })
          .then(function() {
            // Account created, redirect to settings... need to redirect to a password set page
            $location.path('/settings');
          })
          .catch(function(err) {
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
