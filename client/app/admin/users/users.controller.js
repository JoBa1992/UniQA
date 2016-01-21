'use strict';

angular.module('uniQaApp')
  .controller('UserCtrl', function($scope, $http, Auth, User, Thing, Department, Modal) {
    $scope.title = "User Management";
    // filtered users, different from original object.
    $scope.filter = {};
    $scope.departments = {};
    $scope.filter.role = {};
    $scope.filter.department = {};
    $scope.clearedFilter = {
      dropdown: true,
    };

    $scope.userCount = 0;
    $scope.resultsPerPage = 10;
    $scope.currentPage = 1;
    $scope.totalPages = 0;

    $scope.fUsers = {};
    // initial call to get initial system user state.
    $scope.users = User.query({
      paginate: $scope.resultsPerPage,
      page: 0 // always init to 0 as a base point
    });

    $scope.changePaginationPage = function(page) {
      if (page != $scope.currentPage) {
        $scope.currentPage = page;
        $scope.refreshUserList(true);
      }
    };

    // initial call to get system users length.
    var refreshUserStats = function() {
      User.getTotal().$promise.then(function(res) {
        $scope.userCount = res.count
        $scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
      });
    };
    refreshUserStats();

    // use the Thing service to return back some constants
    Thing.getByName("userRoles").then(function(val) {
      val.content.forEach(function(iterate) {
        $scope.filter.role[iterate] = true;
      });
    });
    Department.get().then(function(val) {
      // loop through, and create key pairs to pass on scope variable
      val.forEach(function(obj) {
        $scope.departments[obj.name] = obj.subdepartments;
      });
      // add Any to start of array
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

    $scope.searchStrFilter = function(e) {
      $scope.refreshUserList();
    };

    $scope.refreshUserList = function(pageRequest) {
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
      //   User.getTotal().$promise.then(function(res) {
      //     $scope.userCount = res.count
      //     $scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
      //   });
      if ($scope.currentPage > 1 && !pageRequest) {
        $scope.currentPage = 1;
      }
      User.filtGet({
        name: qFilter.searchStr,
        role: qFilter.role,
        department: qFilter.department,
        paginate: $scope.resultsPerPage,
        page: $scope.currentPage // always init to 0 as a base point
      }).$promise.then(function(res) {
        // reset this once filters are used. Need to look at removing this object altogether
        $scope.fUsers = res;
        $scope.users = {};
        $scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
        $scope.noFiltQueryReturn = res.count == 0 ? true : false;
      });
    };

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
      //$scope.users.push(user);
      refreshUserStats();
      $scope.refreshUserList();
    });
    $scope.openUpdateUserModal = Modal.update.user(function(user) { // callback when modal is confirmed
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
        refreshUserStats();
        $scope.users = User.query(); // bodge for foreach not working
        $scope.refreshUserList();
      }
    });
  });