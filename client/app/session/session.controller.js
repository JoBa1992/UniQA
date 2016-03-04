'use strict';

angular.module('uniQaApp')
	.controller('SessionActiveCtrl', function($scope, $stateParams, $window, $timeout, $location, $sce, socket, Auth, Lecture, Session, Modal) {
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.isAdmin = Auth.isAdmin;
		$scope.isStudent = Auth.isStudent;

		var _second = 1000;
		var _minute = _second * 60;
		var _hour = _minute * 60;
		var _day = _hour * 24;
		var interval = 100;

		// ping noise on new question
		var ping = new Audio('assets/fx/drop.mp3');

		// url parameter passed through
		var sessionid = $stateParams.sessionid;

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

		// scope load for lecture
		$scope.lectureHeight = '760';
		$scope.lectureHeightMarginTop = '-1.4em;';
		$scope.fullScreenToggle = false;
		$scope.hideQuestions = false;
		$scope.presViewSizeMd = 'col-md-9';
		$scope.presViewSizeLg = 'col-lg-9';
		$scope.hideQuestionIcon = 'fa-arrow-right';
		$scope.toggleBtnPosRight = '16px;';
		$scope.toggleFullScreenIcon = 'fa-expand';
		$scope.lecture = {
			registered: [],
			questions: [{
				'asker': {
					'name': 'Joshua Bates'
				},
				'request': 'They say that nothing is true, everything is permitted',
				'time': '2016-03-20T20:35:00Z',
				'anon': false
			}, {
				'asker': {
					'name': '56c86c25099777e930372eb7'
				},
				'request': 'I have been doing this development far too long',
				'time': '2016-03-20T20:40:00Z',
				'anon': false
			}, {
				'asker': {
					'name': '56c86c25099777e930372eb7'
				},
				'request': 'Infact, it took me like 4 hours to even start on sockets',
				'time': '2016-03-20T20:50:00Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'request': 'SOCKETS!',
				'time': '2016-02-20T21:16:35Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'request': 'And the best thing is, they were built into the framework.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'request': 'I mean...',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'request': 'Anyway, if you ever feel like your degree was a pain, its because it most likely was.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'request': 'And as for this blur, I just needed some content filled in behind it. ',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'name': '56a7d95746b9e7db57417309'
				},
				'request': 'Anyway, thanks for taking your time to read this.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}], // needs declaring for use in socket updates
			title: '...'
		};
		$scope.init = false; // just used for loading screen

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


			// for animated loading
			$timeout(function() {
				$scope.lecture.title = lecture.title;
				$scope.lecture.desc = lecture.desc;
				$scope.lecture.url = lecture.url;
				$scope.lecture.questions = questions;
				$scope.lecture.runTime = runtime;
				$scope.lecture.collaborators = authorCollabs;
				$scope.lecture.registered = ['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog'];
				$scope.lecture.expected = 15;
				$scope.lecture.attachments = lecture.attachments;
				$scope.init = true;
			}, 500);
		}, function(err) {
			// session doesn't exist, kick users back
			return $location.url('/session/start');
		});

		// live socket updates for questions
		socket.syncUpdates('session', $scope.lecture.questions, function(event, item) {
			$scope.questionIconNumber = item.questions.length;
			$scope.lecture.questions = item.questions;
			ping.play();
		});

		$scope.showQrModal = function() {
			// disable full screen mode if enabled
			if ($scope.fullScreenToggle) {
				$scope.toggleFullScreen();
			}
			var openModal = Modal.read.qr(function() {
				// refreshUserStats();
				$scope.refreshUserList();
			});

			openModal();
		};

		$scope.toggleQuestions = function() {
			if ($scope.hideQuestions) {
				$scope.presViewSizeMd = 'col-md-9';
				$scope.presViewSizeLg = 'col-lg-9';
				$scope.hideQuestionIcon = 'fa-arrow-right';
				$scope.hideQuestions = false;
				$scope.toggleBtnPosRight = '16px;';

			} else {
				$scope.presViewSizeMd = 'col-md-12';
				$scope.presViewSizeLg = 'col-lg-12';
				$scope.questionIconNumber = $scope.lecture.questions.length;
				$scope.hideQuestionIcon = '';
				$scope.hideQuestions = true;
				$scope.toggleBtnPosRight = '26px;';

			}
		};

		function onkeydownFS() {
			console.info(document.getElementById('lecture'));
			// e.preventDefault();
			// console.info("hit");
			// switch (e.keyCode) {
			// 	case 27: // KeyEvent.DOM_VK_ESC
			// 		e.preventDefault();
			// 		break;
			// }
		}
		$window.addEventListener('keydown', onkeydownFS, true);

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
	.controller('SessionStartCtrl', function($scope, $window, $timeout, $sce, $interval, socket, Auth, Lecture, Session, Modal) {
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

		var _second = 1000;
		var _minute = _second * 60;
		var _hour = _minute * 60;
		var _day = _hour * 24;
		var interval = 100;

		// need to set this id by what gets passed through
		Session.getNextFour(me._id).then(function(res) {
			if (!_.isEmpty(res)) {
				// take next lecture ordered by mongoose
				var nextSession = res.shift();

				$scope.nextLecture = nextSession.lecture;

				var authorCollabs = [];
				var runtime = moment(nextSession.startTime).utc().format('HH:mm') + ' - ' + moment(nextSession.endTime).utc().format('HH:mm');;

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

				// $scope.lectureStart = moment.utc('27/02/2016 13:44:00', 'DD/MM/YYYY HH:mm:ss');

				// subtract and add the time allowance given either side of the lecture
				$scope.lectureStart = moment(moment(nextSession.startTime).utc() - (nextSession.timeAllowance * _minute)).utc();
				$scope.lectureEnd = moment(moment(nextSession.endTime).utc() + (nextSession.timeAllowance * _minute)).utc();

				// $scope.timeUntil = ($scope.lectureStart.getMinutes() - res.timeAllowance) - $scope.now;
				$scope.timeUntil = $scope.lectureStart - $scope.now;

				// console.info($scope.timeUntil);

				var timeUntilTimer = $interval(function() {
					// needed to move the following in so that its always calced,
					// as tab changing doesn't allow the interval to carry on
					$scope.now = moment.utc();
					$scope.timeUntil = $scope.lectureStart - $scope.now;

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
	.controller('SessionRegisterCtrl', function($scope, $window, $timeout, $sce, $interval, socket, Auth, Lecture, Session, Modal) {
		// attach lodash to scope
		$scope._ = _;

		// attach moment to scope
		$scope.moment = moment;

		$scope.lectureHeightMarginTop = '-1.4em;';


		// $scope.lectureHeight = '760';
		// $scope.lectureHeightMarginTop = '-1.4em;';
		//
		// $scope.lecture = {
		// 	title: 'Lecture Example',
		// 	id: 0
		// };
		//
		// var me = Auth.getCurrentUser();
		//
		// // variables used by countdown...
		//
		// $scope.now = moment.utc();
		//
		// var _second = 1000;
		// var _minute = _second * 60;
		// var _hour = _minute * 60;
		// var _day = _hour * 24;
		// var interval = 100;
		//
		// // need to set this id by what gets passed through
		// Session.getNextFour(me._id).then(function(res) {
		// 	if (!_.isEmpty(res)) {
		// 		// take next lecture ordered by mongoose
		// 		var nextSession = res.shift();
		//
		// 		$scope.nextLecture = nextSession.lecture;
		//
		// 		var authorCollabs = [];
		// 		var runtime = moment(nextSession.startTime).utc().format('HH:mm') + ' - ' + moment(nextSession.endTime).utc().format('HH:mm');;
		//
		// 		authorCollabs.push($scope.nextLecture.author.name); // push author in first
		// 		// push in collabs
		// 		for (var i = 0; i < $scope.nextLecture.collaborators.length; i++) {
		// 			authorCollabs.push($scope.nextLecture.collaborators[i].user.name);
		// 		}
		//
		// 		$scope.nextLecture.sessionId = nextSession._id;
		// 		// $scope.lecture.title = $scope.nextLecture.title;
		// 		// $scope.lecture.desc = $scope.nextLecture.desc;
		// 		// $scope.lecture.questions = questions;
		// 		$scope.nextLecture.runTime = runtime;
		// 		$scope.nextLecture.collaborators = authorCollabs;
		// 		// $scope.lecture.registered = ['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog'];
		// 		// $scope.lecture.expected = 15;
		// 		$scope.nextLecture.attachments = $scope.nextLecture.attachments;
		//
		// 		// $scope.lectureStart = moment.utc('27/02/2016 13:44:00', 'DD/MM/YYYY HH:mm:ss');
		//
		// 		// subtract and add the time allowance given either side of the lecture
		// 		$scope.lectureStart = moment(moment(nextSession.startTime).utc() - (nextSession.timeAllowance * _minute)).utc();
		// 		$scope.lectureEnd = moment(moment(nextSession.endTime).utc() + (nextSession.timeAllowance * _minute)).utc();
		//
		// 		// $scope.timeUntil = ($scope.lectureStart.getMinutes() - res.timeAllowance) - $scope.now;
		// 		$scope.timeUntil = $scope.lectureStart - $scope.now;
		//
		// 		// console.info($scope.timeUntil);
		//
		// 		var timeUntilTimer = $interval(function() {
		// 			// needed to move the following in so that its always calced,
		// 			// as tab changing doesn't allow the interval to carry on
		// 			$scope.now = moment.utc();
		// 			$scope.timeUntil = $scope.lectureStart - $scope.now;
		//
		// 			$scope.timeUntil = $scope.timeUntil - interval; // does a check every 1/10 of a second, more accurate
		//
		// 			$scope.days = Math.floor($scope.timeUntil / _day); // gets days
		// 			$scope.hours = Math.floor(($scope.timeUntil % _day) / _hour); // gets hours
		// 			$scope.minutes = Math.floor(($scope.timeUntil % _hour) / _minute); // gets mins
		// 			$scope.seconds = Math.floor(($scope.timeUntil % _minute) / _second); // gets seconds
		//
		// 			if ($scope.timeUntil < 0) {
		// 				$interval.cancel(timeUntilTimer);
		// 				timeUntilTimer = undefined;
		// 			}
		// 		}, interval);
		//
		// 		// kill timer on scope destroy, doesn't implicitly happen.
		// 		$scope.$on('$destroy', function() {
		// 			$interval.cancel(timeUntilTimer);
		// 			timeUntilTimer = undefined;
		// 		});
		//
		// 		// allows up to 3 sessions to be shown on screen
		// 		$scope.upcomingSessions = res;
		// 	} else {
		//
		// 	}
		//
		// });

	});