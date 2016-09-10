'use strict';

angular.module('UniQA')
	.controller('NavbarCtrl', function($scope, $location, $stateParams, $timeout, $mdSidenav, $log, Auth, Modal) {
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.isAdmin = Auth.isAdmin;
		$scope.isTutor = Auth.isTutor;
		$scope.isStudent = Auth.isStudent;
		$scope.currentUser = Auth.getCurrentUser;
		$scope.sidebarIcon = 'chevron-left';
		$scope.toggleLeft = buildDelayedToggler('left');
		$scope.toggleRight = buildToggler('right');
		$scope.isOpenRight = function() {
			return $mdSidenav('right').isOpen();
		};

		/**
		 * Supplies a function that will continue to operate until the
		 * time is up.
		 */
		function debounce(func, wait, context) {
			var timer;

			return function debounced() {
				var context = $scope,
					args = Array.prototype.slice.call(arguments);
				$timeout.cancel(timer);
				timer = $timeout(function() {
					timer = undefined;
					func.apply(context, args);
				}, wait || 10);
			};
		}

		/**
		 * Build handler to open/close a SideNav; when animation finishes
		 * report completion in console
		 */
		function buildDelayedToggler(navID) {
			return debounce(function() {
				$mdSidenav(navID)
					.toggle()
					.then(function() {
						$log.debug("toggle " + navID + " is done");
					});
			}, 200);
		}

		function buildToggler(navID) {
			return function() {
				$mdSidenav(navID)
					.toggle()
					.then(function() {
						$log.debug("toggle " + navID + " is done");
					});
			}
		}
		// $scope.collapsed = false;

		//
		$scope.leftMenu = [{
				title: 'Start Session',
				icon: 'play',
				link: '/session/start',
				login: true,
				admin: true,
				tutor: true,
				student: false
			}, {
				title: 'Modules',
				icon: 'users',
				link: '/modules',
				login: true,
				admin: true,
				tutor: true,
				student: false
			}, {
				title: 'Lessons',
				icon: 'archive',
				link: '/lessons',
				login: true,
				admin: true,
				tutor: true,
				student: false
			},
			// {
			// 	title: 'Planner',
			// 	icon: 'calendar',
			// 	link: '/planner',
			// 	action: 'y',
			// 	login: true,
			// 	admin: true,
			// 	student: false
			// },
			{
				title: 'Statistics',
				icon: 'bar-chart',
				link: '/profile',
				login: true,
				admin: true,
				tutor: true,
				student: false
			}
			// , {
			// 	title: 'Lesson Reg',
			// 	link: '/session/register',
			// 	//   link: '#',
			// 	login: true,
			// 	admin: false,
			// 	student: true
			// }
		];
		$scope.isActive = function(route) {
			return $location.path().includes(route);
		};
		// $scope.checkLocation = function() {
		// 	if ($scope.isLoggedIn()) {
		// 		// check if user is in an active session,
		// 		if ($stateParams.sessionid) {
		// 			// are they sure they want to leave?
		// 			var confirmModal = Modal.confirm.leaveSession('Are you sure you want to leave?', function() {
		// 				$location.path('/profile');
		// 			});
		// 			confirmModal();
		// 		} else {
		// 			$location.path('/profile');
		// 		}
		// 	} else {
		// 		$location.path('/');
		// 	}
		// };
		//
		// $scope.toggleNav = function() {
		// 	if ($scope.collapsed !== null) {
		// 		$scope.collapsed = !$scope.collapsed;
		// 		if ($scope.sidebarIcon === 'chevron-left') {
		// 			$scope.sidebarIcon = 'chevron-right';
		// 		} else {
		// 			$scope.sidebarIcon = 'chevron-left';
		// 		}
		// 	}
		// };
		//
		// $scope.calculateCookieTrail = function() {
		//
		// };
		//
		// $scope.isNavCollapsed = function() {
		// 	if (!$scope.isLoggedIn()) {
		// 		return null;
		// 	}
		// 	return $scope.collapsed;
		// };
		//
		// $scope.logout = function() {
		// 	Auth.logout();
		// 	$location.path('/');
		// };

		//
		// $scope.isRoot = function() {
		// 	if ($location.path() === '/') {
		// 		return 'navbar-inverse';
		// 	}
		// 	return 'navbar-default';
		// };
	});