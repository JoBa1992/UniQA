'use strict';

angular.module('UniQA', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngAnimate',
		'ngDropzone',
		'ngToast',
		'ui.router',
		'ui.bootstrap',
		'btford.socket-io',
		'ui.bootstrap.datetimepicker',
		'sticky'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
		// root level routes
		$stateProvider
			.state('startSession', {
				url: '/session/start',
				templateUrl: 'app/session/start.html',
				controller: 'SessionStartCtrl',
				authenticate: true
			})
			.state('activeSession', {
				url: '/session/active/:sessionid',
				templateUrl: 'app/session/active.html',
				controller: 'SessionActiveCtrl',
				authenticate: true
			})
			.state('lessonList', {
				url: '/lessons',
				templateUrl: 'app/lessons/lessonList.html',
				controller: 'LessonList',
				authenticate: true
			})
			.state('moduleList', {
				url: '/modules',
				templateUrl: 'app/modules/moduleList.html',
				controller: 'ModuleListCtrl',
				authenticate: true
			})
			.state('module', {
				url: '/modules/:moduleid',
				templateUrl: 'app/modules/module.html',
				controller: 'ModuleCtrl',
				authenticate: true
			})
			.state('moduleGroup', {
				url: '/modules/:moduleid/groups/:groupid',
				templateUrl: 'app/moduleGroup/moduleGroup.html',
				controller: 'ModuleGroupCtrl',
				authenticate: true
			})
			.state('profile', {
				url: '/profile',
				templateUrl: 'app/profile/profile.html',
				controller: 'ProfileCtrl',
				authenticate: true
			})
			.state('notifications', {
				url: '/notifications',
				templateUrl: 'app/account/profile/notifications/notifications.html',
				controller: 'NotificationCtrl',
				authenticate: true
			})
			.state('statMgr', {
				url: '/stats',
				templateUrl: 'app/stats/statistics.html',
				controller: 'AdminStatsCtrl',
				authenticate: true
			})
			.state('registerSession', {
				url: '/session/register',
				templateUrl: 'app/session/register.html',
				controller: 'SessionRegisterCtrl',
				authenticate: true
			});
		$urlRouterProvider
			.otherwise('/');
		$locationProvider.html5Mode(true);
		$httpProvider.interceptors.push('authInterceptor');

	})
	.config(function(ngToastProvider) {
		ngToastProvider.configure({
			animation: 'slide', // or 'fade'
			verticalPosition: 'top',
			horizontalPosition: 'left'
				// maxNumber: 1
		});
	})
	.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
		return {
			// Add authorization token to headers
			request: function(config) {
				config.headers = config.headers || {};
				if ($cookieStore.get('token')) {
					config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
				}
				return config;
			},

			// Intercept 401s and redirect you to login
			responseError: function(response) {
				if (response.status === 401) {
					var loc = $location.path().substring(1, $location.path().length).split('/');
					// check to see if req is coming from qr login
					if (loc[0] === 'qr') {
						// $location.path('$loca');
					} else {
						$location.path('/');
					}

					// remove any stale tokens
					$cookieStore.remove('token');
					return $q.reject(response);
				} else {
					return $q.reject(response);
				}
			}
		};
	})
	.run(function($rootScope, $location, $window, socket, Auth, Session, Module) {
		// check for scope state changes
		// next, current
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
			Auth.isLoggedInAsync(function(loggedIn) {
				if (loggedIn) {
					event.preventDefault();
					// don't want users going to 'homepage' if logged in
					if (toState.url === '/' || toState.url === '/login' || toState.url === '/register') {
						return $location.path('/profile');
					}
					// if not on active lecture, unsync socket listening for questions
					if (toState.url !== '/session/active/:sessionid') {
						socket.unsyncUpdates('session');

						if (toState.url === '/modules/:moduleid') {
							var moduleid = toParams.moduleid;

							Module.getByID(moduleid).then(function() {
								if (!(Auth.isAdmin() || Auth.isTutor())) {
									event.preventDefault();
									return $location.path('/session/register');
								}
							}).catch(function() {
								event.preventDefault();
								if (Auth.isAdmin() || Auth.isTutor()) {
									return $location.path('/modules');
								} else {
									return $location.path('/session/register');
								}
							});

						}
					} else {
						if (!toParams.sessionid) {
							event.preventDefault();
							if (Auth.isAdmin()) {
								return $location.path('/session/start?m=notReady');
							} else {
								return $location.path('/session/register?m=notReady');
							}
						}
						var sessionid = toParams.sessionid;
						var now = moment.utc();
						var _second = 1000;
						var _minute = _second * 60;
						// don't want user accessing page if session isn't valid
						Session.getOne(sessionid).then(function(res) {
							if (!res) {
								event.preventDefault();
								if (Auth.isAdmin()) {
									return $location.path('/session/start?m=notExist');
								} else {
									return $location.path('/session/register?m=notExist');
								}
							}

							var start = moment(res.startTime) - (res.timeAllowance * _minute);
							var end = moment(res.endTime) + (res.timeAllowance * _minute);

							// if session isn't between goalposts kick back to session start
							if (!(now >= start && now <= end)) {
								// console.info(Auth.isAdmin());
								if (Auth.isAdmin()) {
									return $location.path('/session/start?m=notReady');
								} else {
									return $location.path('/session/register?m=notReady');
								}
							}
						});
					}
				} else {
					// strangely can't soft route? so doing hard refresh
					if ($location.path() !== '/') {
						return $window.location.href = '/';
					}
				}
			});
		});

	})
	.run(function($rootScope, $location, Auth) {
		// Redirect to login if route requires auth and you're not logged in
		$rootScope.$on('$stateChangeStart', function(event, toState /*, toParams, fromState, fromParams*/ ) {
			Auth.isLoggedInAsync(function(loggedIn) {
				if ((toState.authenticate && !loggedIn)) {
					event.preventDefault();
					$location.path('/login');
				}
			});
		});
	});