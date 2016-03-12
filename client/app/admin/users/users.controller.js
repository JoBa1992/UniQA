'use strict';

angular.module('uniQaApp')
	.controller('AdminUserCtrl', function($scope, $http, Auth, User, Thing, Modal, Group) {
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.title = 'User Management';
		// filtered users, different from original object.
		$scope.filter = {};
		$scope.groups = {};
		$scope.filter.role = {};
		// $scope.filter.group = {};
		$scope.clearedFilter = {
			dropdown: true,
		};

		// $scope.userCount = 0;
		$scope.resultsPerPage = 15;
		$scope.currentPage = 1;
		$scope.totalPages = 0;

		$scope.users = {};

		Thing.getByName('uniEmail').then(function(res) {
			// only returns one element
			$scope.uniEmail = res.content[0];
		});

		Group.get().then(function(res) {
			var group = {
				course: 'None'
			}
			res.groups.unshift(group);
			$scope.filter.group = 'Select Group';
			$scope.groups = res.groups;
		});

		// use the Thing service to return back some constants
		Thing.getByName('userRoles').then(function(res) {
			res.content.forEach(function(iterate) {
				$scope.filter.role[iterate] = true;
			});
			// fire off initial refresh when userRoles are returned
			$scope.refreshUserList();
		});

		// Error handling for when query returns no users
		$scope.isEmpty = function(obj) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					return false;
				}
			}
			return true;
		};

		$scope.changePaginationPage = function(page) {
			if (page !== $scope.currentPage && page > 0 && page <= $scope.totalPages) {
				$scope.currentPage = page;
				$scope.refreshUserList(true);
			}
		};

		// initial call to get system users length.
		var refreshUserStats = function() {
			User.getTotal().$promise.then(function(res) {
				$scope.userCount = res.count;
				$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
			});
		};
		refreshUserStats();

		$scope.userRoleFilterToggle = function(target) {
			if ($scope.filter.role[target]) {
				$scope.filter.role[target] = false;
			} else {
				$scope.filter.role[target] = true;
			}
			$scope.refreshUserList();
		};

		$scope.searchStrFilter = function() {
			$scope.refreshUserList();
		};

		$scope.groupDropdownSel = function(target) {
			// console.info(target);
			$scope.filter.group = target;
			$scope.clearedFilter.dropdown = false;
			$scope.refreshUserList();
		};

		// Error handling for when query returns no users
		$scope.clearDepFilter = function(e) {
			if (!$scope.clearedFilter.dropdown) {
				e.stopPropagation();
				$scope.filter.group = 'Select Group';
				$scope.clearedFilter.dropdown = true;
				$scope.refreshUserList();
			}
		};

		$scope.refreshUserList = function(pageRequest) {
			refreshUserStats();
			// clean filter for query, roles aren't neccessary, as they're always included within the query
			var qFilter = angular.copy($scope.filter);
			if ($scope.isEmpty($scope.filter.searchStr)) {
				qFilter = _.omit(qFilter, 'searchStr');
			}

			if ($scope.filter.group === 'Select Group') {
				qFilter = _.omit(qFilter, 'group');
			}

			// remove any false keys
			var arr = [];
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
			if (qFilter.role.length === 0) {
				qFilter.role.push('No Role');
			}

			if ($scope.currentPage > 1 && !pageRequest) {
				$scope.currentPage = 1;
			}
			if (qFilter.searchStr) { // escape dodgy characters, doesn't work for [ weirdly...
				qFilter.searchStr = qFilter.searchStr.replace(/[\\$'"]/g, '\\$&');
			}

			User.filtGet({
				name: qFilter.searchStr,
				role: qFilter.role,
				group: qFilter.group,
				paginate: $scope.resultsPerPage,
				page: $scope.currentPage
			}).$promise.then(function(res) {
				$scope.users = res;
				$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
				$scope.noFiltQueryReturn = res.count === 0 ? true : false;
			});
		};

		$scope.openCreateUserModal = Modal.create.user(function() { // callback when modal is confirmed
			//$scope.users.push(user);
			refreshUserStats();
			$scope.refreshUserList();
		});

		$scope.openUpdateUserModal = Modal.update.user(function() { // callback when modal is confirmed
			$scope.refreshUserList();
		});

		$scope.openImportUserModal = Modal.import.user(function() { // callback when modal is confirmed
			refreshUserStats();
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