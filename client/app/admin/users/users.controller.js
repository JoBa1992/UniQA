'use strict';

angular.module('uniQaApp')
  .controller('UserCtrl', function($scope, $http, Auth, User, Modal) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.universities = ["Select University", "Sheffield Hallam", "Sheffield University"]
    $scope.university = $scope.universities[0];

    $scope.userTypes = {
      "student": true,
      "teacher": true,
      "admin": true
    }

    $scope.uniDropdownSel = function(target) {
      $scope.university = target;
    };

    $scope.userTypeFilterToggle = function(target) {
      if ($scope.userTypes[target])
        $scope.userTypes[target] = false;
      else
        $scope.userTypes[target] = true;
    }

    $scope.openCreateUserModal = Modal.create.user(function() { // callback when modal is confirmed
      //callback
      console.info("user created?");
    //   $scope.$parent.submitted = true;
    //   if (form.$valid && $scope.$parent.userRole != "Select Role"
    //     && $scope.$parent.university != "Select University") {
    //
    //     Auth.register({
    //       user: $scope.$parent.user
    //     })
    //       .then(function() {
    //         // Account created, redirect to settings... need to redirect to a password set page
    //         //$location.path('/settings');
    //       })
    //       .catch(function(err) {
    //         err = err.data;
    //         $scope.$parent.errors = {};
    //
    //         // Update validity of form fields that match the mongoose errors
    //         angular.forEach(err.errors, function(error, field) {
    //           form[field].$setValidity('mongoose', false);
    //           $scope.$parent.errors[field] = error.message;
    //         });
    //         Modal.create.user(function() {});
    //       });
    //   }
    });
    $scope.deleteUser = Modal.confirm.delete(function(user) {
      // check callback result to make sure its got content
      if (user) {
        User.remove({
          id: user._id
        });
        angular.forEach($scope.users, function(u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      }
    });
  });
