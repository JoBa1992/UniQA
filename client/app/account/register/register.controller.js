'use strict';

angular.module('uniQaApp')
  .controller('RegisterCtrl', function($scope, Auth, Thing, $location) {
    $scope.user = {};
    $scope.roles = {};
    $scope.departments = {};
    $scope.subDepartments = {};
    $scope.errors = {};
    // pull these from db value

    Thing.getByName('userRoles').then(function(val) {
      $scope.roles = val.content;
      $scope.user.role = 'Select Role';
    });
    Thing.getByName('uniDepartments').then(function(val) {
      $scope.departments = val.content[0];
      $scope.user.department = 'Select Department';
    });
    Thing.getByName('uniName').then(function(val) {
      // only returns one element
      $scope.uniName = val.content[0];
    });
    Thing.getByName('uniEmail').then(function(val) {
      // only returns one element
      $scope.uniEmail = val.content[0];
    });

    $scope.userRoleDropdownSel = function(target) {
      $scope.user.role = target;
    };
    $scope.depDropdownSel = function(target) {
      $scope.user.department = target;
    };


    $scope.register = function(form) {
      $scope.submitted = true;
      console.info($scope.user.department != 'Select Department');
      if (form.$valid && $scope.user.role != 'Select Role'
        && $scope.user.department != 'Select Department') {

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
