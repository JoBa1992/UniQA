'use strict';

angular.module('uniQaApp', [
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
			.state('lectMgr', {
				url: '/lectures',
				templateUrl: 'app/lectures/tutor.html',
				controller: 'LectureTutCtrl',
				authenticate: true
			})
			.state('userSchedule', {
				url: '/schedule',
				templateUrl: 'app/schedule/schedule.html',
				controller: 'ScheduleCtrl',
				authenticate: true
			})
			.state('modules', {
				url: '/modules',
				templateUrl: 'app/modules/modules.html',
				controller: 'ModuleCtrl',
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
			// animation: 'slide', // or 'fade'
			verticalPosition: 'bottom',
			horizontalPosition: 'left',
			maxNumber: 1
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
						$location.path('/login');
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
	.run(function($rootScope, $location, socket, Auth, Session) {

		// check for scope state changes
		//next, current
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams /*, fromState , fromParams*/ ) {
			// if not on active lecture, unsync socket listening for questions
			if (toState.url !== '/session/active/:sessionid') {
				socket.unsyncUpdates('session');
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
					// var start = moment(moment(res.startTime).utc() - (res.timeAllowance * _minute)).utc();
					// var end = moment(moment(res.endTime).utc() + (res.timeAllowance * _minute)).utc();

					var start = moment(moment(res.startTime).utc().subtract(1, "hour") - (res.timeAllowance * _minute));
					var end = moment(moment(res.endTime).utc().subtract(1, "hour") + (res.timeAllowance * _minute));

					// if session isn't between goalposts kick back to session start
					if (!(now >= start && now <= end)) {
						console.info(Auth.isAdmin());
						if (Auth.isAdmin()) {
							return $location.path('/session/start?m=notReady');
						} else {
							return $location.path('/session/register?m=notReady');
						}
					}
				});
			}
			// don't want users going to 'homepage' if logged in
			if (toState.url === '/' || toState.url === '/login' || toState.url === '/register') {
				Auth.isLoggedInAsync(function(loggedIn) {
					if (loggedIn) {
						event.preventDefault();
						$location.path('/profile');
					}
				});
			}
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