'use strict';

angular.module('UniQA')
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
	});