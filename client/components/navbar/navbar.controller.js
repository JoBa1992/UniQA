'use strict';

angular.module('uniQaApp')
	.controller('NavbarCtrl', function($scope, $location, Auth) {
		$scope.isCollapsed = true;
		$scope.isLoggedIn = Auth.isLoggedIn;
		$scope.isAdmin = Auth.isAdmin;
		$scope.isStudent = Auth.isStudent;
		$scope.getCurrentUser = Auth.getCurrentUser;

		$scope.leftMenu = [{
				title: 'Start Lecture',
				link: '/lecture/start',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Groups',
				link: '/my/groups',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Users',
				link: '/users',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'My Lectures',
				link: '/my/lectures',
				login: true,
				admin: false,
				student: true
			}, {
				title: 'Lectures',
				link: '/my/lectures',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Schedule',
				link: '/my/schedule',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Questions',
				link: '/my/questions',
				login: true,
				admin: true,
				student: false
			}, {
				title: 'Lecture Reg',
				link: '/lecture/register',
				//   link: '#',
				login: true,
				admin: false,
				student: true
			}, {
				title: 'My Questions',
				link: '/my/questions/',
				//   link: '#',
				login: true,
				admin: false,
				student: true
			},
			/* {
						title: 'Stats',
						link: '/my/stats',
						login: true,
						admin: true,
						student: false
					},*/
			{
				title: 'Modal Dev',
				//   link: '/my/questions/',
				link: '/dev',
				login: true,
				admin: true,
				student: true
			}
		];
		$scope.rightMenu = [{
			title: 'Register',
			link: '/register',
			login: false,
			admin: false,
			student: false
		}, {
			title: 'Sign in',
			link: '/login',
			login: false,
			admin: false,
			student: false
		}];
		if ($scope.isLoggedIn()) {
			$scope.leftMenu.root = '/profile';
		} else {
			$scope.leftMenu.root = '/';
		}

		$scope.logout = function() {
			Auth.logout();
			$location.path('/');
		};

		$scope.isActive = function(route) {
			//   console.info(route);
			return route === $location.path();
		};

		$scope.isRoot = function() {
			if ($location.path() === '/') {
				return 'navbar-inverse';
			}
			return 'navbar-default';
		};
	});