'use strict';

angular.module('UniQA')
	.controller('NavbarCtrl', function($rootScope, $scope, $location, $stateParams, $timeout, $mdSidenav, $log, Auth, Modal) {
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.isAdmin = Auth.isAdmin;
		$scope.isTutor = Auth.isTutor;
		$scope.isStudent = Auth.isStudent;
		$scope.currentUser = Auth.getCurrentUser;

		$scope.toggleLeft = buildDelayedToggler('left');
		$scope.toggleRight = buildToggler('right');

		$scope.navMinnied;

		if (localStorage.getItem('navMinnied') === false || localStorage.getItem('navMinnied') === undefined) {
			$scope.navMinnied = false;
			localStorage.setItem('navMinnied', $scope.navMinnied);
			$scope.sidebarIcon = 'chevron-left';
		} else {
			$scope.navMinnied = String(localStorage.getItem('navMinnied')) == "true" ? true : false;
			if ($scope.navMinnied) {
				$scope.sidebarIcon = 'chevron-right';
			} else {
				$scope.sidebarIcon = 'chevron-left';
			}
		}

		$rootScope.isOpenRight = function() {
			return $mdSidenav('right').isOpen();
		};

		$rootScope.isLeftOpen = function() {
			return $mdSidenav('left').isOpen();
		};

		$rootScope.toggleLeftMenu = function() {
			// Put the object into storage
			$mdSidenav('left').toggle();
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
		//
		$scope.sessionsMenu = [{
			title: 'Start',
			icon: 'share',
			link: '/session/start',
			login: true,
			admin: true,
			tutor: true,
			student: false
		}, {
			title: 'Continue',
			icon: 'retweet',
			link: '#', // /session/continue
			action: 'x',
			login: true,
			admin: true,
			tutor: true,
			student: false
		}];

		$scope.resourceMenu = [{
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
		}, {
			title: 'Planner',
			icon: 'calendar',
			link: '#',
			tt: 'Coming Soon',
			login: true,
			admin: true,
			student: false
		}, ];

		$scope.personalMenu = [{
			title: 'Dashboard',
			icon: 'bar-chart',
			link: '/dashboard',
			login: true,
			admin: true,
			tutor: true,
			student: false
		}, {
			title: 'Settings',
			icon: 'cogs',
			link: '/profile/settings',
			login: true,
			admin: true,
			tutor: true,
			student: false
		}];

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
		$scope.toggleNav = function() {
			if ($scope.navMinnied !== null) {
				$scope.navMinnied = !$scope.navMinnied;
				if ($scope.sidebarIcon === 'chevron-left') {
					$scope.sidebarIcon = 'chevron-right';
				} else {
					$scope.sidebarIcon = 'chevron-left';
				}
				localStorage.setItem('navMinnied', $scope.navMinnied);
			}
		};

		$scope.calculateCookieTrail = function() {

		};

		$scope.isNavMin = function() {
			if (!$scope.isLoggedIn()) {
				return null;
			}
			return $scope.navMinnied;
		};
		//
		// $scope.logout = function() {
		// 	Auth.logout();
		// 	$location.path('/');
		// };
	});