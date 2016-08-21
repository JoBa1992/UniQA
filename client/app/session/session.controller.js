'use strict';

angular.module('uniQaApp')
	.controller('SessionActiveCtrl', function($scope, $stateParams, $window, $timeout, $location, $sce, ngToast, socket, Auth, Lecture, Session, Modal) {
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

		// scope load for lecture/tutor
		$scope.lectureHeight = $window.innerHeight;
		$scope.lectureHeightMarginTop = '-1.4em;';
		$scope.fullScreenToggle = false;
		$scope.hideQuestions = false;
		$scope.presViewSizeMd = 'col-md-9';
		$scope.presViewSizeLg = 'col-lg-9';
		$scope.hideQuestionIcon = 'fa-arrow-right';
		$scope.toggleBtnPosRight = 16;
		$scope.toggleFullScreenIcon = 'fa-expand';
		$scope.lecture = {
			registered: [],
			questions: [{
				'asker': {
					'name': 'Joshua Bates'
				},
				'question': 'They say that nothing is true, everything is permitted',
				'time': '2016-03-20T20:35:00Z',
				'anon': false
			}, {
				'asker': {
					'name': '56c86c25099777e930372eb7'
				},
				'question': 'I have been doing this development far too long',
				'time': '2016-03-20T20:40:00Z',
				'anon': false
			}, {
				'asker': {
					'name': '56c86c25099777e930372eb7'
				},
				'question': 'Infact, it took me like 4 hours to even start on sockets',
				'time': '2016-03-20T20:50:00Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'SOCKETS!',
				'time': '2016-02-20T21:16:35Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'And the best thing is, they were built into the framework.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'I mean...',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'Anyway, if you ever feel like your degree was a pain, its because it most likely was.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'And as for this blur, I just needed some content filled in behind it. ',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'question': 'Anyway, thanks for taking your time to read this.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}], // needs declaring for use in socket updates
			title: '...'
		};
		$scope.init = false; // just used for loading screen

		$scope.getFile = function(file) {
			Session.getFile({
				lecture: $scope.lecture._id,
				user: me._id,
				file: file,
				session: sessionid
			}).then(function(res) {
				console.info(res);
			});
		};

		// need to set this id by what gets passed through
		Session.getOne(sessionid).then(function(res) {
			// var start = moment(moment(res.startTime).utc() - (res.timeAllowance * _minute)).utc();
			// var end = moment(moment(res.endTime).utc() + (res.timeAllowance * _minute)).utc();
			//
			// // if session isn't between goalposts kick back to session start
			// if (!($scope.now >= start && $scope.now <= end)) {
			// 	return $location.url('/session/start');
			// }

			var lecture = res.lecture;
			// var groups = res.groups;
			var questions = res.questions;
			var authorCollabs = [];
			var runtime;

			authorCollabs.push(lecture.author.name); // push author in first
			// push in collabs
			for (var i = 0; i < lecture.collaborators.length; i++) {
				authorCollabs.push(lecture.collaborators[i].user.name);
			}

			runtime = moment(res.startTime).utc().format('HH:mm') + ' - ' + moment(res.endTime).utc().format('HH:mm');

			// used for user questions
			$scope.session.startTime = res.startTime;
			$scope.session.endTime = res.endTime;

			// console.info(res);

			// check if user has given feedback already
			$scope.fedback = _.some(res.feedback, function(feedback) {
				return feedback.user === me._id;
			});

			// get total users expected to register into lecture
			var expected = 0;
			_.some(res.groups, function(group) {
				// bad nesting due to dodgy model, needs checking
				expected += group.group.students.length;
			});

			/*
			['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog']
			*/
			// for animated loading
			$timeout(function() {
				$scope.lecture._id = lecture._id;
				$scope.lecture.title = lecture.title;
				$scope.lecture.desc = lecture.desc;
				$scope.lecture.url = lecture.url;
				$scope.lecture.questions = questions;
				$scope.lecture.runTime = runtime;
				$scope.lecture.collaborators = authorCollabs;
				$scope.lecture.altAccess = res.altAccess;
				$scope.lecture.registered = res.registered;
				$scope.lecture.expected = expected;
				$scope.lecture.attachments = lecture.attachments;
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
		socket.syncUpdates('session', $scope.lecture.questions, function(event, item) {
			// checking if the event concerns this
			if (item._id === sessionid) {
				// if they don't equal the same, somethings changed
				// stops feedback from triggering noise
				if ($scope.lecture.questions.length !== item.questions.length) {
					$scope.questionIconNumber = item.questions.length;
					$scope.lecture.questions = item.questions;
					if ($scope.playSound) {
						ping.play();
					}
				}
				// if registered values have changed, update scope
				if ($scope.lecture.registered !== item.registered.length) {
					$scope.lecture.registered = item.registered;
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
				$scope.questionIconNumber = $scope.lecture.questions.length;
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
			if ($scope.lectureHeight === $window.innerHeight) {
				$scope.lectureHeight = $window.innerHeight - 95;
				// if opening msgbox scroll to bottom of container;
				$timeout(function() {
					var scroller = document.getElementById('questionFeed');
					scroller.scrollTop = scroller.scrollHeight;
				}, 0, false);
			} else {
				$scope.lectureHeight = $window.innerHeight;
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

		$scope.showSessionContent = Modal.read.sessionContent($scope.lecture, sessionid, function() {
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
				var element = document.getElementById('lecture-fullscreen');
				if (element.requestFullScreen) {
					element.requestFullScreen();
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.webkitRequestFullScreen) {
					element.webkitRequestFullScreen();
				}
				// $scope.lectureHeightMarginTop = '0em;';
				$scope.lectureHeight = '890';
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
				// $scope.lectureHeightMarginTop = '-1.4em;';
				$scope.lectureHeight = '760';
				$scope.toggleFullScreenIcon = 'fa-expand';
				$scope.fullScreenToggle = false;
			}
		};
	})
	.controller('SessionStartCtrl', function($scope, $window, $timeout, $sce, $interval, socket, Auth, Lecture, Session) {
		// attach lodash to scope
		$scope._ = _;

		// attach moment to scope
		$scope.moment = moment;

		$scope.lectureHeight = '760';
		$scope.lectureHeightMarginTop = '-1.4em;';

		$scope.lecture = {
			title: 'Lecture Example',
			id: 0
		};

		var me = Auth.getCurrentUser();

		// variables used by countdown...

		$scope.now = moment.utc();

		// console.info(moment(moment.utc()).subtract(1, 'hours'));

		var _second = 1000;
		var _minute = _second * 60;
		var _hour = _minute * 60;
		var _day = _hour * 24;
		var interval = 100;

		// need to set this id by what gets passed through
		Session.getNextFourTutor(me._id).then(function(res) {
			if (!_.isEmpty(res)) {
				// take next lecture ordered by mongoose
				var nextSession = res.shift();

				console.info(nextSession);

				$scope.nextLecture = nextSession.lecture;
				$scope.nextLectureStudentCount = 0;

				_.some(nextSession.groups, function(group) {
					// bad nesting due to dodgy model, needs checking
					$scope.nextLectureStudentCount += group.group.students.length;
				});

				var authorCollabs = [];
				var runtime = moment(nextSession.startTime).utc().format('HH:mm') + ' - ' + moment(nextSession.endTime).utc().format('HH:mm');

				authorCollabs.push($scope.nextLecture.author.name); // push author in first
				// push in collabs
				for (var i = 0; i < $scope.nextLecture.collaborators.length; i++) {
					authorCollabs.push($scope.nextLecture.collaborators[i].user.name);
				}

				$scope.nextLecture.sessionId = nextSession._id;
				// $scope.lecture.title = $scope.nextLecture.title;
				// $scope.lecture.desc = $scope.nextLecture.desc;
				// $scope.lecture.questions = questions;
				$scope.nextLecture.runTime = runtime;
				$scope.nextLecture.collaborators = authorCollabs;
				// $scope.lecture.registered = ['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog'];
				// $scope.lecture.expected = 15;
				$scope.nextLecture.attachments = $scope.nextLecture.attachments;

				// subtract and add the time allowance given either side of the lecture
				$scope.lectureStart = moment(moment(nextSession.startTime).utc().subtract(1, "hour") - (nextSession.timeAllowance * _minute));
				$scope.lectureEnd = moment(moment(nextSession.endTime).utc().subtract(1, "hour") + (nextSession.timeAllowance * _minute));

				// $scope.timeUntil = ($scope.lectureStart.getMinutes() - res.timeAllowance) - $scope.now;
				console.info($scope.lectureStart);

				// $scope.timeUntil = $scope.lectureStart - $scope.now;


				var timeUntilTimer = $interval(function() {
					// needed to move the following in so that its always calced,
					// as tab changing doesn't allow the interval to carry on

					// TEMP FIX. NEEDS REMOVING ONCE TIME IS CORRECTED
					$scope.now = moment.utc();
					$scope.timeUntil = $scope.lectureStart - $scope.now;

					// console.info($scope.timeUntil);


					$scope.timeUntil = $scope.timeUntil - interval; // does a check every 1/10 of a second, more accurate

					$scope.days = Math.floor($scope.timeUntil / _day); // gets days
					$scope.hours = Math.floor(($scope.timeUntil % _day) / _hour); // gets hours
					$scope.minutes = Math.floor(($scope.timeUntil % _hour) / _minute); // gets mins
					$scope.seconds = Math.floor(($scope.timeUntil % _minute) / _second); // gets seconds

					if ($scope.timeUntil < 0) {
						$interval.cancel(timeUntilTimer);
						timeUntilTimer = undefined;
					}
				}, interval);

				// kill timer on scope destroy, doesn't implicitly happen.
				$scope.$on('$destroy', function() {
					$interval.cancel(timeUntilTimer);
					timeUntilTimer = undefined;
				});

				// allows up to 3 sessions to be shown on screen
				$scope.upcomingSessions = res;
			} else {

			}

		});

	})
	.controller('SessionRegisterCtrl', function($scope, $location, Auth, Lecture, Session) {
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

		$scope.lectureHeightMarginTop = '-1.4em;';

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
				var start = moment(moment(res.startTime).utc().subtract(1, "hour") - (res.timeAllowance * _minute));
				var end = moment(moment(res.endTime).utc().subtract(1, "hour") + (res.timeAllowance * _minute));

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