'use strict';

angular.module('UniQA', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngAnimate',
		'ngDropzone',
		'ngMaterial',
		'ui.router',
		'ui.bootstrap',
		'btford.socket-io',
		'ui.bootstrap.datetimepicker'
	])
	.config(function($mdThemingProvider) {
		var customPrimary = {
			'50': '#7b8ba0',
			'100': '#6c7e95',
			'200': '#617286',
			'300': '#566578',
			'400': '#4c5869',
			'500': '#414C5A',
			'600': '#363f4b',
			'700': '#2c333c',
			'800': '#21262e',
			'900': '#161a1f',
			'A100': '#8a98aa',
			'A200': '#99a5b5',
			'A400': '#a7b2c0',
			'A700': '#0c0d10'
		};
		$mdThemingProvider
			.definePalette('customPrimary',
				customPrimary);

		var customAccent = {
			'50': '#346281',
			'100': '#3c6f93',
			'200': '#437da5',
			'300': '#4c8bb6',
			'400': '#5e97bd',
			'500': '#70a2c5',
			'600': '#94bad3',
			'700': '#a6c5db',
			'800': '#b8d1e2',
			'900': '#caddea',
			'A100': '#94bad3',
			'A200': '#82AECC',
			'A400': '#70a2c5',
			'A700': '#dde9f1'
		};
		$mdThemingProvider
			.definePalette('customAccent',
				customAccent);

		var customWarn = {
			'50': '#ffd380',
			'100': '#ffca66',
			'200': '#ffc14d',
			'300': '#ffb933',
			'400': '#ffb01a',
			'500': '#FFA700',
			'600': '#e69600',
			'700': '#cc8600',
			'800': '#b37500',
			'900': '#996400',
			'A100': '#ffdc99',
			'A200': '#ffe5b3',
			'A400': '#ffedcc',
			'A700': '#805400'
		};
		$mdThemingProvider
			.definePalette('customWarn',
				customWarn);

		var customBackground = {
			'50': '#ffffff',
			'100': '#ffffff',
			'200': '#ffffff',
			'300': '#ffffff',
			'400': '#ffffff',
			'500': '#F5F5F5',
			'600': '#e8e8e8',
			'700': '#dbdbdb',
			'800': '#cfcfcf',
			'900': '#c2c2c2',
			'A100': '#ffffff',
			'A200': '#ffffff',
			'A400': '#ffffff',
			'A700': '#b5b5b5'
		};
		$mdThemingProvider
			.definePalette('customBackground',
				customBackground);

		$mdThemingProvider.theme('default')
			.primaryPalette('customPrimary')
			.accentPalette('customAccent')
			.warnPalette('customWarn')
			.backgroundPalette('customBackground');
	})
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
				controller: 'LessonListCtrl',
				authenticate: true
			})
			.state('lesson', {
				url: '/lessons/:lessonid',
				templateUrl: 'app/lessons/lesson.html',
				controller: 'LessonCtrl',
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
			.state('dashboard', {
				url: '/dashboard',
				templateUrl: 'app/dashboard/dashboard.html',
				controller: 'DashboardCtrl',
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
						return $location.path('/dashboard');
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