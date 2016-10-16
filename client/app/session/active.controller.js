'use strict';

angular.module('UniQA')
	.controller('SessionActiveCtrl', function($scope, $stateParams, $window, $timeout, $mdToast, $location, $sce, socket, Auth, Lesson, Session, Modal) {

		var last = {
			bottom: true,
			top: false,
			left: true,
			right: false
		};

		$scope.toastPosition = angular.extend({}, last);

		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.isAdmin = Auth.isAdmin;
		$scope.isStudent = Auth.isStudent;

		$scope.sendingMsg = false;

		// question sent from user
		$scope.user = {
			question: ''
		};

		// ping noise on new question
		// need a new sound here...!
		var ping = new Audio('assets/fx/drop.mp3');

		// url parameter passed through
		var sessionid = $stateParams.sessionid;
		var me = Auth.getCurrentUser();

		$scope.hideQuestions;
		$scope.playSound;

		if (localStorage.getItem('hideQuestions') === false || localStorage.getItem('hideQuestions') === undefined) {
			$scope.hideQuestions = false;
			localStorage.setItem('hideQuestions', $scope.hideQuestions);
		} else {
			$scope.hideQuestions = String(localStorage.getItem('hideQuestions')) == "true" ? true : false;
		}

		if (localStorage.getItem('playSound') === false || localStorage.getItem('playSound') === undefined) {
			$scope.playSound = false;
			localStorage.setItem('playSound', $scope.playSound);
		} else {
			$scope.playSound = String(localStorage.getItem('playSound')) == "true" ? true : false;
		}

		$scope.isFullScreen = function() {
			if (document.fullscreenElement ||
				document.mozFullScreenElement ||
				document.webkitFullscreenElement ||
				document.msFullscreenElement) {
				return true;
			}
			// // A fallback
			// try {
			// 	return isFullScreenMicrosoft();
			// } catch (ex) {}
			// try {
			// 	return isFullScreenMozilla();
			// } catch (ex) {}
			// try {
			// 	return isFullScreenWebkit();
			// } catch (ex) {}
			//
			// console.log("This browser is not supported, sorry!");
			return false;
		};

		$scope.loadedURL = false;

		$scope.$on('$locationChangeStart', function(event, next) {
			var answer = confirm("Are you sure you want to leave this session?")
			if (!answer) {
				event.preventDefault();
			}
		});

		//var _second = 1000;
		//var _minute = _second * 60;
		// var _hour = _minute * 60;
		//var _day = _hour * 24;
		//var interval = 100;


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

		// $scope.session = {};

		// scope load for lesson/tutor
		$scope.session = {
			qr: {
				svg: ''
			},
			url: 'placeholder',
			registered: [],
			questions: [{
				'asker': {
					'fullName': 'Joshua Bates'
				},
				'question': 'Good find',
				'time': '2016-03-20T20:35:00Z',
				'anon': false
			}, {
				'asker': {
					'fullName': 'Joshua Bates'
				},
				'question': 'It took me like 4 hours to even start understanding sockets',
				'time': '2016-03-20T20:50:00Z',
				'anon': false
			}, {
				'asker': {
					'fullName': 'Joshua Bates'
				},
				'question': 'SOCKETS!',
				'time': '2016-02-20T21:16:35Z',
				'anon': false
			}, {
				'asker': {
					'fullName': 'Joshua Bates'
				},
				'question': 'And the best thing is, they were built into the framework.',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'fullName': 'Joshua Bates'
				},
				'question': 'Anyway...',
				'time': '2016-02-20T21:16:36Z',
				'anon': false
			}, {
				'asker': {
					'fullName': '56a7d95746b9e7db57417309'
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

		$scope.urlLoaded = function() {
			// for animated loading
			$timeout(function() {
				$scope.loadedURL = true;
			}, 500);
		}

		$scope.toggleSessionQuestions = function() {
			$scope.session.questionsEnabled = !$scope.session.questionsEnabled;
		};

		// need to set this id by what gets passed through
		Session.getById(sessionid).then(function(res) {
			var session = res;
			var lesson = session.lesson;

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

			// check if user has given feedback already
			$scope.fedback = _.some(res.feedback, function(feedback) {
				return feedback.user === me._id;
			});

			// get total users expected to register into session
			var expected = 0;
			_.some(res.modules, function(module) {
				// bad nesting due to dodgy model, needs checking
				expected += module.module.students.length;
			});

			// for animated loading
			$timeout(function() {
				$scope.questionIconNumber = session.questions.length;
				$scope.session = {
					_id: session._id,
					title: lesson.title,
					desc: lesson.desc,
					url: $sce.trustAsResourceUrl(lesson.url),
					questions: questions,
					qr: session.qr,
					runTime: runtime,
					feedback: session.feedback,
					collaborators: authorCollabs,
					questionsEnabled: session.questionsEnabled,
					altAccess: session.altAccess,
					registered: session.registered,
					expected: expected,
					attachments: session.attachments
				}
				$scope.init = true;
			}, 500);
		}, function(err) {
			console.info(err);
			// session doesn't exist, kick users back
			// if (Auth.isAdmin()) {
			// 	return $location.url('/session/start?m=notExist');
			// } else {
			// 	return $location.url('/session/register?m=notExist');
			// }

		});

		$scope.getToastPosition = function() {
			sanitizePosition();
			return Object.keys($scope.toastPosition)
				.filter(function(pos) {
					return $scope.toastPosition[pos];
				})
				.join(' ');
		};

		function sanitizePosition() {
			var current = $scope.toastPosition;

			if (current.bottom && last.top) current.top = false;
			if (current.top && last.bottom) current.bottom = false;
			if (current.right && last.left) current.left = false;
			if (current.left && last.right) current.right = false;

			last = angular.extend({}, current);
		}

		// live socket updates for questions
		socket.syncUpdates('session', $scope.session.questions, function(event, item) {
			console.info(item);
			// checking if the event concerns this
			if (item._id === sessionid) {
				// if they don't equal the same, somethings changed
				// stops feedback from triggering noise
				if ($scope.session.questions.length !== item.questions.length) {
					$scope.questionIconNumber = item.questions.length;
					$scope.session.questions = item.questions;
					if ($scope.playSound) {
						ping.play();
					}
				}
				// if registered values have changed, update scope
				if ($scope.session.registered !== item.registered.length) {
					$scope.session.registered = item.registered;
				}
				// if feedback has been given, throw toast
				if ($scope.session.feedback.length !== item.feedback.length) {
					var pinTo = $scope.getToastPosition();
					$mdToast.show(
						$mdToast.simple()
						.textContent("Feedback has been given")
						.position(pinTo)
						.hideDelay(3000)
						.theme('success-toast')
					);
				}
			}
		});

		$scope.showQrModal = function() {
			// disable full screen mode if enabled
			if ($scope.isFullScreen()) {
				$scope.toggleFullScreen();
			}
			var openModal = Modal.read.qr($scope.session.qr, function() {
				// refreshUserStats();
				$scope.refreshUserList();
			});

			openModal();
		};

		$scope.toggleSound = function() {
			if ($scope.playSound !== null) {
				$scope.playSound = !$scope.playSound;
				localStorage.setItem('playSound', $scope.playSound);
			}
		};

		$scope.toggleQuestionHide = function() {
			if ($scope.hideQuestions !== null) {
				$scope.hideQuestions = !$scope.hideQuestions;
				localStorage.setItem('hideQuestions', $scope.hideQuestions);

				if ($scope.hideQuestions) {
					$scope.questionIconNumber = $scope.session.questions.length;
				}
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
					// ngToast.create({
					// 	className: 'danger',
					// 	timeout: 3000,
					// 	content: 'Warning: ' + err
					// });
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
					// ngToast.create({
					// 	className: 'danger',
					// 	timeout: 3000,
					// 	content: 'Warning: ' + err
					// });
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
			// var timeUntilTenMinsLeft = moment.utc($scope.session.endTime).subtract(10, 'minutes');
			//
			// var timeUntilHalfway = moment.utc(moment.utc($scope.session.endTime) - ((moment.utc($scope.session.endTime) - moment.utc($scope.session.startTime)) / 2));

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
			// ngToast.create({
			// 	className: 'success',
			// 	timeout: 3000,
			// 	content: 'Thankyou for giving us feedback!'
			// });
		});

		// var updateFeedbackModal = Modal.create.feedback(sessionid, function() {
		// 	// refreshUserStats();
		// 	// $scope.refreshUserList();
		// 	console.info('thanks');
		// });

		$scope.showFeedbackModal = function() {
			// time until feedback can be given, halfway through a session
			// var timeUntil = moment.utc(moment.utc($scope.session.endTime) - ((moment.utc($scope.session.endTime) - moment.utc($scope.session.startTime)) / 2));

			// check if we can give feedback yet

			if (moment.utc() >= timeUntil) {
				if (!$scope.fedback) {
					createFeedbackModal();
				} else {
					// throw a notification telling user how long until feedback can be given
					// ngToast.create({
					// 	className: 'success',
					// 	timeout: 3000,
					// 	content: 'Feedback already given for session!'
					// });
				}
			} else {
				// throw a notification telling user how long until feedback can be given
				// ngToast.create({
				// 	className: 'danger',
				// 	timeout: 3000,
				// 	content: 'Feedback can be given ' + moment.utc(timeUntil).fromNow()
				// });
			}

		};

		$scope.toggleFullScreen = function() {
			if (!$scope.isFullScreen()) { // Launch fullscreen for browsers that support it!
				var element = document.getElementById('lesson-container');
				if (element.requestFullScreen) {
					element.requestFullScreen();
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.webkitRequestFullScreen) {
					element.webkitRequestFullScreen();
				}
			} else { // Cancel fullscreen for browsers that support it!
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
		};
	});