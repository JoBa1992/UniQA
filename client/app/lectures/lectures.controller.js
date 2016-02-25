'use strict';

angular.module('uniQaApp')
	.controller('LectureTutCtrl', function($scope, $http, Auth, Lecture) {
		$scope.title = 'My Lectures';

		// Error handling for when query returns no users
		$scope.isEmpty = function(obj) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					return false;
				}
			}
			return true;
		};

		var me = Auth.getCurrentUser();
		$scope.currentPage = 1;
		$scope.paginate = 15;

		Lecture.getForMe({
			createdBy: me._id,
			page: $scope.currentPage,
			paginate: $scope.resultsPerPage
		}).then(function(res) {
			console.info(res);
			// reset this once filters are used. Need to look at removing this object altogether
			if (res.count === 0) {
				//no results
				$scope.noQueryResults = true;
			} else {
				$scope.lectures = res;
			}
		});
		//
		// Lecture.getForMe({
		//     createdBy: me._id,
		//     page: $scope.currentPage,
		//     paginate: $scope.resultsPerPage
		// }).then(function(res) {
		// 	var lecture = res.lecture;
		// 	var groups = res.groups;
		// 	var questions = res.questions;
		// 	var authorCollabs = [];
		// 	var runtime;
		//
		// 	authorCollabs.push(lecture.author.name); // push author in first
		// 	// push in collabs
		// 	for (var i = 0; i < lecture.collaborators.length; i++) {
		// 		authorCollabs.push(lecture.collaborators[i].user.name);
		// 	}
		//
		// 	runtime = moment(res.startTime).utc().format("HH:mm") + ' - ' + moment(res.endTime).utc().format("HH:mm")
		//
		//
		// 	console.info(runtime);
		//
		// 	// for animated loading
		// 	$timeout(function() {
		// 		$scope.lecture['title'] = lecture.title;
		// 		$scope.lecture['desc'] = lecture.desc;
		// 		$scope.lecture['url'] = lecture.url;
		// 		$scope.lecture['questions'] = questions;
		// 		$scope.lecture['runTime'] = runtime;
		// 		$scope.lecture['collaborators'] = authorCollabs;
		// 		$scope.lecture['registered'] = ['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog'];
		// 		$scope.lecture['expected'] = 15;
		// 		$scope.lecture['resources'] = lecture.attachments;
		// 		$scope.init = true;
		// 	}, 500);
		// });

	})
	.controller('LectureStartCtrl', function($scope, $http, $window, $timeout, $sce, socket, Auth, Lecture, Session, Modal) {
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};

		// ping noise on new question
		var ping = new Audio('assets/fx/drop.mp3');

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

		// console.info(socket);

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
		Session.getOne('56c87667bcd6f3c431cb8681').then(function(res) {
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


			console.info(runtime);

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

	});