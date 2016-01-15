'use strict';

angular.module('uniQaApp')
  .controller('UserCtrl', function($scope, $http, Auth, User, Modal, Thing) {

    // filtered users, different from original object.
    $scope.filter = {};
    $scope.filter.role = {};
    $scope.filter.department = {};
    $scope.clearedFilter = {
      dropdown: true,
    };

    $scope.fUsers = {};

    // use the Thing service to return back some constants
    Thing.getByName("userRoles").then(function(val) {
      val.content.forEach(function(iterate) {
        $scope.filter.role[iterate] = true;
      });
    });
    Thing.getByName("uniDepartments").then(function(val) {
      // add Any to start of array
      $scope.departments = val.content[0];
      $scope.filter.department = 'Select Department';
    });
    Thing.getByName("uniEmail").then(function(val) {
      // only returns one element
      $scope.uniEmail = val.content[0];
    });


    $scope.depDropdownSel = function(target) {
      $scope.filter.department = target;
      $scope.clearedFilter.dropdown = false;
      $scope.refreshUserList();
    };


    $scope.userRoleFilterToggle = function(target) {
      if ($scope.filter.role[target])
        $scope.filter.role[target] = false;
      else
        $scope.filter.role[target] = true;
      $scope.refreshUserList();
    }

    $scope.searchStrFilter = function(str) {
      //$scope.filter.searchStr = str;
      //console.info($scope.filter);
      $scope.refreshUserList();
    };

    $scope.refreshUserList = function() {
      // clean filter for query, roles aren't neccessary, as they're always included within the query
      var qFilter = angular.copy($scope.filter);
      if ($scope.isEmpty($scope.filter.searchStr))
        qFilter = _.omit(qFilter, 'searchStr');
      if ($scope.filter.department == "Select Department")
        qFilter = _.omit(qFilter, 'department');
      // remove any false keys
      var arr = new Array();
      for (var key in qFilter.role) {
        if (qFilter.role[key] === false) {
          delete qFilter.role[key];
        } else {
          arr.push(key);
        }
      }
      // flatten down object into array with just selected values for mongoose
      qFilter.role = arr;

      // error handling when no roles are selected
      if (qFilter.role.length == 0) {
        qFilter.role.push('No Role');
      }

      $scope.fUsers = User.filtGet({
        name: qFilter.searchStr,
        role: qFilter.role,
        department: qFilter.department
      });
      $scope.fUsers.$promise.then(function(res) {
        $scope.noFiltQueryReturn = res.length == 0 ? true : false;
      });
    };

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    // Error handling for when query returns no users
    $scope.clearDepFilter = function(e) {
      if (!$scope.clearedFilter.dropdown) {
        e.stopPropagation();
        $scope.filter.department = 'Select Department';
        $scope.clearedFilter.dropdown = true;
        $scope.refreshUserList();
      }
    };

    // Error handling for when query returns no users
    $scope.isEmpty = function(obj) {
      for (var i in obj)
        if (obj.hasOwnProperty(i)) return false;
      return true;
    };

    $scope.openCreateUserModal = Modal.create.user(function(user) { // callback when modal is confirmed
      $scope.users.push(user);
      $scope.refreshUserList();
    });
    $scope.openUpdateUserModal = Modal.update.user(function(user) { // callback when modal is confirmed
      //   $scope.users.push(user);
      $scope.refreshUserList();
    });
    $scope.openDeleteUserModal = Modal.delete.user(function(user) {
      // when modal is confirmed, callback
      if (user) {
        User.remove({
          id: user._id
        });

        // this no longer works for $scope.users... it doesn't splice off the one - check it out
        // angular.forEach($scope.users, function(u, i) {
        //   console.info("does " + u + " == " + user);
        //   if (u === user) {
        //     $scope.users.splice(i, 1);
        //   }
        // });
        $scope.users = User.query(); // bodge for foreach not working
        $scope.refreshUserList();
      }
    });
  });
