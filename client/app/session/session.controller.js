'use strict';

angular.module('uniQaApp')
	.controller('SessionActiveCtrl', function($scope, $stateParams, $window, $timeout, $location, $sce, ngToast, socket, Auth, Lesson, Session, Modal) {
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.isAdmin = Auth.isAdmin;
		$scope.isStudent = Auth.isStudent;

		$scope.playSound = true;
		$scope.sendingMsg = false;

		// question sent from user
		$scope.user = {
			question: ''
		};

		//var _second = 1000;
		//var _minute = _second * 60;
		// var _hour = _minute * 60;
		//var _day = _hour * 24;
		//var interval = 100;

		// ping noise on new question
		// need a new sound here...!
		var ping = new Audio('assets/fx/drop.mp3');

		// url parameter passed through
		var sessionid = $stateParams.sessionid;
		var me = Auth.getCurrentUser();

		$scope.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};


		// function onConnect(socket) {
		// 	socket.on('join', function(room) {
		// 		socket.join(room);
		// 	});
		//
		// 	socket.on('leave', function(room) {
		// 		socket.leave(room);
		// 	});
		// }
		// onConnect();

		// $scope.now = moment.utc();

		// scope load for user
		$scope.showQuestionSubmit = false;
		$scope.fedback = true;

		$scope.session = {};

		// scope load for lesson/tutor
		$scope.fullScreenToggle = false;
		$scope.hideQuestions = false;
		$scope.presViewSizeMd = 'col-md-9';
		$scope.presViewSizeLg = 'col-lg-9';
		$scope.hideQuestionIcon = 'fa-arrow-right';
		$scope.toggleBtnPosRight = 16;
		$scope.toggleFullScreenIcon = 'fa-expand';
		$scope.lesson = {
			registered: [],
			questions: [{
				'asker': {
					'name': 'Joshua Bates'
				},
				'question': 'Good find, I need help with building this app, so if you have some spare time, and fancy getting involved, please send me an email at joshua.bates16@gmail.com...',
				'time': '2016-03-20T20:35:00Z',
				'anon': false
			}, {
				'asker': {
					'name': 'Joshua Bates'
				},
				'question': 'It took me like 4 hours to even start understanding sockets',
				'time': '2016-03-20T20:50:00Z',
				'anon': false
			}, {
				'asker': {
					'name': 'Joshua Bates'
				},
				'question': 'SOCKETS!',
				'time': '2016-02-20T21:16:35Z',
				'anon': false
			}, {
				'asker': {
					'name': 'Joshua Bates'
				},
				'question': 'And the best thing is, they were built into the framework.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': 'Joshua Bates'
				},
				'question': 'Anyway...',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'I just needed some content filled in behind this loading blur. ',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}], // needs declaring for use in socket updates
			title: '...'
		};
		$scope.init = false; // just used for loading screen

		$scope.getFile = function(file) {
			Session.getFile({
				lesson: $scope.lesson._id,
				user: me._id,
				file: file,
				session: sessionid
			}).then(function(res) {
				console.info(res);
			});
		};

		// need to set this id by what gets passed through
		Session.getOne(sessionid).then(function(res) {
			var lesson = res.lesson;
			// var modules = res.modules;
			var questions = res.questions;
			var authorCollabs = [];
			var runtime;

			authorCollabs.push(lesson.author.name); // push author in first
			// push in collabs
			for (var i = 0; i < lesson.collaborators.length; i++) {
				authorCollabs.push(lesson.collaborators[i].user.name);
			}

			runtime = moment(res.startTime).utc().format('HH:mm') + ' - ' + moment(res.endTime).utc().format('HH:mm');

			// used for user questions
			$scope.session.startTime = res.startTime;
			$scope.session.endTime = res.endTime;

			// check if user has given feedback already
			$scope.fedback = _.some(res.feedback, function(feedback) {
				return feedback.user === me._id;
			});

			// get total users expected to register into lesson
			var expected = 0;
			_.some(res.modules, function(module) {
				// bad nesting due to dodgy model, needs checking
				expected += module.module.students.length;
			});

			// for animated loading
			$timeout(function() {
				$scope.lesson._id = lesson._id;
				$scope.lesson.title = lesson.title;
				$scope.lesson.desc = lesson.desc;
				$scope.lesson.url = lesson.url;
				$scope.lesson.questions = questions;
				$scope.lesson.runTime = runtime;
				$scope.lesson.collaborators = authorCollabs;
				$scope.lesson.altAccess = res.altAccess;
				$scope.lesson.registered = res.registered;
				$scope.lesson.expected = expected;
				$scope.lesson.attachments = lesson.attachments;
				$scope.init = true;
			}, 500);
		}, function(err) {
			console.info(err);
			// session doesn't exist, kick users back
			if (Auth.isAdmin()) {
				return $location.url('/session/start?m=notExist');
			} else {
				return $location.url('/session/register?m=notExist');
			}

		});

		// live socket updates for questions
		socket.syncUpdates('session', $scope.lesson.questions, function(event, item) {
			// checking if the event concerns this
			if (item._id === sessionid) {
				// if they don't equal the same, somethings changed
				// stops feedback from triggering noise
				if ($scope.lesson.questions.length !== item.questions.length) {
					$scope.questionIconNumber = item.questions.length;
					$scope.lesson.questions = item.questions;
					if ($scope.playSound) {
						ping.play();
					}
				}
				// if registered values have changed, update scope
				if ($scope.lesson.registered !== item.registered.length) {
					$scope.lesson.registered = item.registered;
				}
			}

		});

		$scope.showQrModal = function() {
			// disable full screen mode if enabled
			if ($scope.fullScreenToggle) {
				$scope.toggleFullScreen();
			}
			var openModal = Modal.read.qr(sessionid, function() {
				// refreshUserStats();
				$scope.refreshUserList();
			});

			openModal();
		};

		$scope.toggleSound = function() {
			$scope.playSound = !$scope.playSound;
		};

		$scope.toggleQuestions = function() {
			if ($scope.hideQuestions) {
				$scope.presViewSizeMd = 'col-md-9';
				$scope.presViewSizeLg = 'col-lg-9';
				$scope.hideQuestionIcon = 'fa-arrow-right';
				$scope.hideQuestions = false;
				$scope.toggleBtnPosRight = 16;

			} else {
				$scope.presViewSizeMd = 'col-md-12';
				$scope.presViewSizeLg = 'col-lg-12';
				$scope.questionIconNumber = $scope.lesson.questions.length;
				$scope.hideQuestionIcon = '';
				$scope.hideQuestions = true;
				$scope.toggleBtnPosRight = 16;

			}
		};

		$scope.checkForEnterKey = function(e) {
			// if user presses enter, send message
			if (e.keyCode === 13 && !$scope.sendingMsg) {
				$scope.sendMsg();
			}
		};

		$scope.sendMsg = function() {
			// console.info($scope.user.question);
			if ($scope.user.question) {
				$scope.sendingMsg = true;
				Session.sendMsg({
					session: sessionid,
					asker: me._id,
					question: $scope.user.question
				}).then(function() {
					$scope.user.error = false;
					$scope.user.question = '';
					$scope.sendingMsg = false;
				}).catch(function(err) {
					$scope.user.error = true;
					$scope.sendingMsg = false;
					ngToast.create({
						className: 'danger',
						timeout: 3000,
						content: 'Warning: ' + err
					});
				});
			}
		};

		$scope.sendMsgAnon = function() {
			if ($scope.user.question) {
				$scope.sendingMsg = true;
				Session.sendMsg({
					session: sessionid,
					asker: me,
					question: $scope.user.question,
					anon: true
				}).then(function() {
					$scope.user.error = false;
					$scope.user.question = '';
					$scope.sendingMsg = false;
				}).catch(function(err) {
					$scope.user.error = true;
					$scope.sendingMsg = false;
					ngToast.create({
						className: 'danger',
						timeout: 3000,
						content: 'Warning: ' + err
					});
				});
			}
		};

		$scope.toggleMsgBox = function() {
			$scope.showQuestionSubmit = !$scope.showQuestionSubmit;
			if ($scope.lessonHeight === $window.innerHeight) {
				$scope.lessonHeight = $window.innerHeight - 95;
				// if opening msgbox scroll to bottom of container;
				$timeout(function() {
					var scroller = document.getElementById('questionFeed');
					scroller.scrollTop = scroller.scrollHeight;
				}, 0, false);
			} else {
				$scope.lessonHeight = $window.innerHeight;
			}
		};

		$scope.checkLeave = function() {
			// check times here, if there is still at least 10 minutes of time
			// left, open up modal asking user for confirmation
			var timeUntilTenMinsLeft = moment.utc($scope.session.endTime).subtract(10, 'minutes');

			var timeUntilHalfway = moment.utc(moment.utc($scope.session.endTime) - ((moment.utc($scope.session.endTime) - moment.utc($scope.session.startTime)) / 2));

			var noFeedbackModal, confirmModal;

			// if use is admin, redirect them to correct page
			var path = $scope.isAdmin() ? '/session/start' : '/session/register';

			if (!$scope.fedback) {
				if (moment.utc() >= timeUntilHalfway) {
					noFeedbackModal = Modal.confirm.leaveSessionNoFeedback(sessionid, function() {
						$location.path(path);
					});
					noFeedbackModal();
				} else {
					confirmModal = Modal.confirm.leaveSession('There is still at least 10 minutes left, are you sure you want to leave?', function() {
						$location.path(path);
					});
					confirmModal();
				}
			} else {
				if (moment.utc() <= timeUntilTenMinsLeft) {
					confirmModal = Modal.confirm.leaveSession('There is still at least 10 minutes left, are you sure you want to leave?', function() {
						$location.path(path);
					});
					confirmModal();
				} else {
					$location.path(path);
				}
			}
		};

		$scope.showSessionContent = Modal.read.sessionContent($scope.lesson, sessionid, function() {
			// $scope.refreshUserList();
		});

		// for feedback modal
		var createFeedbackModal = Modal.create.feedback(sessionid, function() {
			// refreshUserStats();
			// $scope.refreshUserList();
			$scope.fedback = true;
			ngToast.create({
				className: 'success',
				timeout: 3000,
				content: 'Thankyou for giving us feedback!'
			});
		});

		// var updateFeedbackModal = Modal.create.feedback(sessionid, function() {
		// 	// refreshUserStats();
		// 	// $scope.refreshUserList();
		// 	console.info('thanks');
		// });

		$scope.showFeedbackModal = function() {
			// time until feedback can be given, halfway through a session
			var timeUntil = moment.utc(moment.utc($scope.session.endTime) - ((moment.utc($scope.session.endTime) - moment.utc($scope.session.startTime)) / 2));

			// check if we can give feedback yet

			if (moment.utc() >= timeUntil) {
				if (!$scope.fedback) {
					createFeedbackModal();
				} else {
					// throw a notification telling user how long until feedback can be given
					ngToast.create({
						className: 'success',
						timeout: 3000,
						content: 'Feedback already given for session!'
					});
				}
			} else {
				// throw a notification telling user how long until feedback can be given
				ngToast.create({
					className: 'danger',
					timeout: 3000,
					content: 'Feedback can be given ' + moment.utc(timeUntil).fromNow()
				});
			}

		};



		$scope.toggleFullScreen = function() {
			if (!$scope.fullScreenToggle) { // Launch fullscreen for browsers that support it!
				var element = document.getElementById('lesson-fullscreen');
				if (element.requestFullScreen) {
					element.requestFullScreen();
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.webkitRequestFullScreen) {
					element.webkitRequestFullScreen();
				}
				// $scope.lessonHeightMarginTop = '0em;';
				$scope.lessonHeight = '890';
				$scope.toggleFullScreenIcon = 'fa-compress';
				$scope.fullScreenToggle = true;
			} else { // Cancel fullscreen for browsers that support it!
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
				// $scope.lessonHeightMarginTop = '-1.4em;';
				$scope.lessonHeight = '760';
				$scope.toggleFullScreenIcon = 'fa-expand';
				$scope.fullScreenToggle = false;
			}
		};
	})
	.controller('SessionStartCtrl', function($scope, $window, $timeout, $sce, $interval, socket, Auth, Lesson, Module, Session) {
		// attach lodash to scope
		$scope._ = _;

		// attach moment to scope
		$scope.moment = moment;

		var me = Auth.getCurrentUser();

		// variables used by countdown...
		$scope.now = moment.utc();

		$scope.submitted = false;
		// default active
		$scope.startSessionQuestions = 'success';
		$scope.startSessionFeedback = 'success';

		// var _second = 1000;
		// var _minute = _second * 60;
		// var _hour = _minute * 60;
		// var _day = _hour * 24;
		// var interval = 100;

		// Module.getMyAssocModules({
		// 	title: $scope.sForm.lesson,
		// 	createdBy: me._id,
		// 	page: 1,
		// 	paginate: 50
		// }).then(function(res) {
		// 	console.info(res.result);
		// 	$scope.myLessons = res.result;
		// });

		$scope.searchForMyLessons = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// form lesson contains the object that can be used when saving
				// console.info($scope.sForm.lesson);
			} else {
				// for no value
				// $scope.sForm.lesson = $scope.sForm.lesson || '';
				// console.info($scope.sForm.lesson);
				Lesson.getForMe({
					title: $scope.sForm.lesson,
					createdBy: me._id,
					page: 1,
					paginate: 50
				}).then(function(res) {
					$scope.myLessons = res.result;
				});
			}
		};

		$scope.searchForMyModules = function(e) {
			// console.info(e);
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// console.info($scope.myModules);
				// if name isn't on the list, break out of function
				if ($scope.myModules.length === 0) {
					return;
				} else {
					// need to either get selected here, or select first
					if (!($scope.sForm.module instanceof Object)) {
						if (e === 'Submit') {
							// gets index of child with active class from typeahead property
							/*jshint -W109 */
							$scope.sForm.module = $scope.myModules[angular.element(document.querySelector("[id*='typeahead']")).find('.active').index()];
						}
					}
				}

				// only add if we have a collaborator
				if ($scope.sForm.module instanceof Object) {
					$scope.selectedModules.push($scope.sForm.module);
				}
				$scope.myModules = [];
				$scope.sForm.module = '';
			} else {
				Module.getMyAssocModules({
					user: me._id,
					search: $scope.sForm.module
				}).then(function(res) {
					// reset before continuing
					$scope.myModules = [];
					// filter through myModules here, check against already existing collaborators and only allow them to stay if they don't exist
					for (var x = 0; x < res.modules.length; x++) {
						var isIn = false;
						for (var y = 0; y < $scope.selectedModules.length; y++) {
							if (res.modules[x]._id === $scope.selectedModules[y]._id) {
								isIn = true;
							}
						}
						if (!isIn) {
							$scope.myModules.push(res.modules[x]);
						}
					}
					// console.info($scope.myModules);
				});
			}

		};

		$scope.switchQuestionState = function() {
			if ($scope.startSessionQuestions === 'success') {
				$scope.startSessionQuestions = 'default';
			} else {
				$scope.startSessionQuestions = 'success';
			}
		};

		$scope.switchFeedbackState = function() {
			if ($scope.startSessionFeedback === 'success') {
				$scope.startSessionFeedback = 'default';
			} else {
				$scope.startSessionFeedback = 'success';
			}
		};

		$scope.createSession = function() {
			// create session in here
			$scope.submitted = true;

			if ($scope.sForm.lesson && $scope.sForm.startTime && $scope.sForm.endTime && !_.isEmpty($scope.selectedModules)) {
				// setup vars to be sent across to API
				var presModules = [];
				// push each selected collaborator into array
				for (var i = 0; i < $scope.selectedModules.length; i++) {
					presModules.push({
						module: $scope.selectedModules[i]._id
					});
				}

				var data = {
					createdBy: me._id,
					lesson: $scope.sForm.lesson._id,
					startTime: moment.utc($scope.sForm.startTimeMoment).toISOString(),
					endTime: moment.utc($scope.sForm.endTimeMoment).toISOString(),
					modules: presModules,
					timeAllowance: $scope.sForm.allowance
				};

				Session.createSession({
						data: data
					})
					.then(function(res) {
						console.info(res);
						// refreshSessions();
						$scope.clearSchedForm();
					})
					.catch(function(err) {
						$scope.errors = {};

						console.info(err);

						// Update validity of form fields that match the mongoose errors
						// angular.forEach(err.errors, function(error, field) {
						// 	//console.info(form[field]);
						// 	form[field].$setValidity('mongoose', false);
						// 	$scope.errors[field] = error.message;
						// });
					});
			}
		};

		// need function which creates the session, and on success sends the page to the newly created session. Need to block UI input throughout this faze, and show a loading animation

	})
	.controller('SessionRegisterCtrl', function($scope, $location, Auth, Lesson, Session) {
		// check querystring
		var querystring = $location.search();
		if (querystring.m === 'notReady') {
			// if m is set, a message needs displaying on screen.
			// default msg, can be set again
			$scope.error = 'Session is not ready to be joined just yet.';
		} else if (querystring.m === 'notExist') {
			$scope.error = 'That session does not exist';
		}
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.lessonHeightMarginTop = '-1.4em;';

		var me = Auth.getCurrentUser();

		$scope.register = {
			'session': ''
		};


		$scope.sessionAltRegister = function() {
			// console.info($scope.register.session);
			Session.register({
				'user': me._id,
				'altAccess': $scope.register.session
			}).then(function(res) {
				var now = moment.utc();
				var _second = 1000;
				var _minute = _second * 60;

				var start = moment(res.startTime) - (res.timeAllowance * _minute);
				var end = moment(res.endTime) + (res.timeAllowance * _minute);

				// var start = moment(moment(res.startTime).utc() - (res.timeAllowance * _minute)).utc();
				// var end = moment(moment(res.endTime).utc() + (res.timeAllowance * _minute)).utc();

				// if session isn't between goalposts kick back to session start
				if (now >= start && now <= end) {
					$location.path('/session/active/' + res._id);
				} else {
					$scope.error = 'Session is not ready to be joined just yet.';
				}

				// will be booted back if session isn't ready yet
			}).catch(function(err) {
				console.info(err);
				//display message on screen saying can't find
				$scope.error = 'Session cannot be found';
			});
		};


	});