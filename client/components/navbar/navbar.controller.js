'use strict';

angular.module('uniQaApp')
	.controller('NavbarCtrl', function($scope, $location, $stateParams, Auth, Modal) {
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.isAdmin = Auth.isAdmin;
		$scope.isStudent = Auth.isStudent;
		$scope.currentUser = Auth.getCurrentUser;
		$scope.collapsed = false;
		$scope.sidebarIcon = 'chevron-left';

		$scope.leftMenu = [{
				title: 'Start Session',
				icon: 'play',
				link: '/session/start',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Modules',
				icon: 'users',
				link: '/modules',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Lectures',
				icon: 'archive',
				link: '/lectures',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Schedule',
				icon: 'calendar',
				link: '/schedule',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Statistics',
				icon: 'bar-chart',
				link: '/profile',
				login: true,
				admin: true,
				student: false
			}
			// , {
			// 	title: 'Lecture Reg',
			// 	link: '/session/register',
			// 	//   link: '#',
			// 	login: true,
			// 	admin: false,
			// 	student: true
			// }
		];
		$scope.checkLocation = function() {
			if ($scope.isLoggedIn()) {
				// check if user is in an active session,
				if ($stateParams.sessionid) {
					// are they sure they want to leave?
					var confirmModal = Modal.confirm.leaveSession('Are you sure you want to leave?', function() {
						$location.path('/profile');
					});
					confirmModal();
				} else {
					$location.path('/profile');
				}
			} else {
				$location.path('/');
			}
		};

		$scope.toggleNav = function() {
			$scope.collapsed = !$scope.collapsed;
			if ($scope.sidebarIcon === 'chevron-left') {
				$scope.sidebarIcon = 'chevron-right';
			}
			if ($scope.sidebarIcon === 'chevron-right') {
				$scope.sidebarIcon = 'chevron-left';
			}
		};

		$scope.calculateCookieTrail = function() {

		};

		$scope.isNavCollapsed = function() {
			if (!$scope.isLoggedIn()) {
				return null;
			}
			return $scope.collapsed;
		};

		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};

		$scope.isActive = function(route) {
			return route === $location.path();
		};

		$scope.isRoot = function() {
			if ($location.path() === '/') {
				return 'navbar-inverse';
			}
			return 'navbar-default';
		};
	});