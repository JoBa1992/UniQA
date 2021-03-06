'use strict';

angular.module('UniQA')
	.factory('Modal', function($rootScope, $mdDialog, $window, $location, $timeout, $interval, $sce, Auth, Thing, Module, Lesson, Session) {

		// Use the User $resource to fetch all users
		$rootScope.user = {};
		$rootScope.errors = {};
		$rootScope.form = {};

		$rootScope.res = {
			received: true
		};

		/**
		 * Opens a modal
		 * @param  {Object} scope      - an object to be merged with modal's scope
		 * @param  {String} modalClass - (optional) class(es) to be applied to the modal
		 * @return {Object}            - the instance $mdDialog.open() returns
		 */
		function openModal(scope) {
			var modalScope = $rootScope.$new();
			scope = scope || {};

			angular.extend(modalScope, scope);

			var modalCtrl = modalScope.modal.controller || undefined;
			var modalTemplate = modalScope.modal.template || 'components/modal/views/standard.html';
			//
			return $mdDialog.show({
				templateUrl: modalTemplate,
				scope: modalScope,
				controller: modalCtrl,
				parent: angular.element(document.body),
				fullscreen: modalScope.modal.fullScreen, // Only for -xs, -sm breakpoints.
				// parent: angular.element(document.body),
				// targetEvent: ev,
				clickOutsideToClose: true
			});
		}

		$rootScope.cancel = function(e) {
			$mdDialog.cancel();
		}

		// var isUrl = function(string) {
		// 	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		// 	return regexp.test(string);
		// };

		// Public API here
		return {
			read: {
				qr: function(cb) {
					cb = cb || angular.noop;
					var args = Array.prototype.slice.call(arguments);
					var session = args.shift();

					return function() {
						var readModal;
						Session.getById(session).then(function(res) {
							$rootScope.session = res;
							readModal = openModal({
								modal: {
									name: 'View QR',
									fullScreen: true,
									sizePercent: 30,
									form: 'components/modal/views/qr/read.html',
									buttons: [{
										classes: 'md-primary',
										text: 'Close',
										click: function(e) {
											$mdDialog.hide(e);
										}
									}]
								}
							}, 'modal-primary', null);
						});
					};
				},
				// lesson: function(cb) {
				// 	cb = cb || angular.noop;
				// 	return function() {
				// 		var readModal;
				// 		var args = Array.prototype.slice.call(arguments);
				// 		var lesson = args.shift();
				//
				// 		$rootScope._ = _;
				// 		// attach moment to rootScope
				// 		$rootScope.moment = moment;
				//
				// 		$rootScope.isAdmin = Auth.isAdmin;
				// 		$rootScope.isStudent = Auth.isStudent;
				//
				// 		var interval = 100; // for accuracy
				// 		var getTimer;
				// 		$rootScope.timer = '0:00:00';
				// 		$rootScope.timerRunning = false;
				// 		var timerReset = true;
				// 		var now, duration;
				//
				// 		var counter = function() {
				// 			duration = moment.duration(moment.utc().diff(now));
				// 			$rootScope.timer = Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss');
				// 		};
				//
				// 		$rootScope.startTimer = function() {
				// 			if (!$rootScope.timerRunning) {
				// 				if (timerReset) {
				// 					now = moment.utc();
				// 					timerReset = false;
				// 				}
				// 				$rootScope.timerRunning = true;
				// 				getTimer = $interval(counter, interval);
				// 			}
				// 		};
				//
				// 		$rootScope.resetTimer = function() {
				// 			$rootScope.timerRunning = false;
				// 			$interval.cancel(getTimer);
				// 			$rootScope.timer = '0:00:00';
				// 			timerReset = true;
				// 		};
				//
				//
				// 		$rootScope.pauseTimer = function() {
				// 			if (!$rootScope.timerRunning) {
				// 				$rootScope.timerRunning = true;
				// 				getTimer = $interval(counter, interval);
				// 			} else {
				// 				$rootScope.timerRunning = false;
				// 				$interval.cancel(getTimer);
				// 			}
				//
				// 		};
				//
				// 		$rootScope.trustSrc = function(src) {
				// 			return $sce.trustAsResourceUrl(src);
				// 		};
				//
				// 		// rootScope load for user
				// 		$rootScope.showQuestionSubmit = false;
				// 		$rootScope.fedback = true;
				//
				// 		$rootScope.session = {};
				//
				// 		// rootScope load for lesson/tutor
				// 		$rootScope.lessonHeight = $window.innerHeight - 10;
				// 		$rootScope.fullScreenToggle = false;
				// 		$rootScope.hideQuestions = false;
				// 		$rootScope.hideQuestionIcon = 'fa-arrow-right';
				// 		$rootScope.toggleBtnPosRight = 16;
				// 		$rootScope.toggleFullScreenIcon = 'fa-expand';
				// 		$rootScope.init = false;
				//
				// 		$rootScope.toggleFullScreen = function() {
				// 			if (!$rootScope.fullScreenToggle) { // Launch fullscreen for browsers that support it!
				// 				var element = document.getElementById('lesson-fullscreen');
				// 				if (element.requestFullScreen) {
				// 					element.requestFullScreen();
				// 				} else if (element.mozRequestFullScreen) {
				// 					element.mozRequestFullScreen();
				// 				} else if (element.webkitRequestFullScreen) {
				// 					element.webkitRequestFullScreen();
				// 				}
				// 				// $rootScope.lessonHeightMarginTop = '0em;';
				// 				$rootScope.lessonHeight = '890';
				// 				$rootScope.toggleFullScreenIcon = 'fa-compress';
				// 				$rootScope.fullScreenToggle = true;
				// 			} else { // Cancel fullscreen for browsers that support it!
				// 				if (document.exitFullscreen) {
				// 					document.exitFullscreen();
				// 				} else if (document.mozCancelFullScreen) {
				// 					document.mozCancelFullScreen();
				// 				} else if (document.webkitExitFullscreen) {
				// 					document.webkitExitFullscreen();
				// 				}
				// 				// $rootScope.lessonHeightMarginTop = '-1.4em;';
				// 				$rootScope.lessonHeight = '760';
				// 				$rootScope.toggleFullScreenIcon = 'fa-expand';
				// 				$rootScope.fullScreenToggle = false;
				// 			}
				// 		};
				//
				// 		$rootScope.toggleQuestions = function() {
				// 			if ($rootScope.hideQuestions) {
				// 				$rootScope.presViewSizeMd = 'col-md-9';
				// 				$rootScope.presViewSizeLg = 'col-lg-9';
				// 				$rootScope.hideQuestionIcon = 'fa-arrow-right';
				// 				$rootScope.hideQuestions = false;
				// 				$rootScope.toggleBtnPosRight = 16;
				//
				// 			} else {
				// 				$rootScope.presViewSizeMd = 'col-md-12';
				// 				$rootScope.presViewSizeLg = 'col-lg-12';
				// 				$rootScope.questionIconNumber = $rootScope.lesson.questions.length;
				// 				$rootScope.hideQuestionIcon = '';
				// 				$rootScope.hideQuestions = true;
				// 				$rootScope.toggleBtnPosRight = 16;
				//
				// 			}
				// 		};
				// 		$rootScope.lesson = lesson;
				//
				// 		$timeout(function() {
				// 			$rootScope.init = true;
				// 		}, 5000);
				//
				// 		readModal = openModal({
				// 			modal: {
				// 				name: 'createrUserForm',
				// 				dismissable: true,
				// 				template: 'components/modal/views/splash.html',
				// 				form: 'components/modal/views/lesson/preview.html',
				// 				title: '',
				// 				buttons: [{
				// 					classes: 'btn-primary',
				// 					text: 'Dismiss',
				// 					click: function(e) {
				// 						$rootScope.resetTimer();
				// 						readModal.close(e);
				// 					}
				// 				}]
				// 			}
				// 		}, 'modal-primary', 'fs');
				// 	};
				// },
				sessionContent: function(cb) {
					cb = cb || angular.noop;
					var args = Array.prototype.slice.call(arguments);
					var lesson = args.shift();
					var sessionid = args.shift();
					var me = Auth.getCurrentUser();

					return function() {
						var readModal;


						$rootScope.getFile = function(file) {
							Session.getFile({
								lesson: lesson._id,
								user: me._id,
								file: file,
								session: sessionid
							}).then(function( /*res*/ ) {});
						};

						Session.getOne(sessionid).then(function(res) {
							var lesson = res.lesson._id;
							Lesson.getOne(lesson).then(function(res) {
								for (var item in res.attachments) {
									res.attachments[item].name = res.attachments[item].loc.split('/').pop();
								}
								$rootScope.lesson = res; // need to elaborate on this

								readModal = openModal({
									modal: {
										name: 'showSessionContent',
										dismissable: true,
										form: 'components/modal/views/session/content.html',
										title: 'Lesson Content',
										buttons: [{
											classes: 'btn-primary',
											text: 'Dismiss',
											click: function(e) {
												readModal.close(e);
											}
										}]
									}
								}, 'modal-primary', 'md');
							});
						});
					};
				},
				feedback: function(cb) {
					cb = cb || angular.noop;

					return function() {
						var args = Array.prototype.slice.call(arguments);
						// attach momentJS to rootScope
						$rootScope.moment = moment;
						$rootScope._ = _;

						$rootScope.feedback = args.shift(); // gets feedback passed through from main view

						var readModal;

						$rootScope.showQuestions = false;
						$rootScope.showRegister = false;

						$rootScope.toggleQuestions = function() {
							$rootScope.showQuestions = !$rootScope.showQuestions;
						};

						$rootScope.toggleRegister = function() {
							$rootScope.showRegister = !$rootScope.showRegister;
						};

						// needs checking
						// cross check registered students against those expected,
						$rootScope.feedback.notRegistered = [];
						for (var g = 0; g < $rootScope.feedback.modules.length; g++) {
							for (var s = 0; s < $rootScope.feedback.modules[g].module.students.length; s++) {
								var registered = false;
								for (var u = 0; u < $rootScope.feedback.registered.length; u++) {
									if ($rootScope.feedback.registered[u].user._id ===
										$rootScope.feedback.modules[g].module.students[s].user._id) {
										registered = true;
									}
								}
								// if user wasn't registered, push them into notRegistered array
								if (!registered) {
									$rootScope.feedback.notRegistered.push(angular.copy($rootScope.feedback.modules[g].module.students[s]));
								}
							}
						}

						$rootScope.feedback.ratings = {
							one: 0,
							two: 0,
							three: 0,
							four: 0,
							five: 0
						};

						// get each users feedback and put into band
						_.some($rootScope.feedback.feedback, function(user) {
							if (parseInt(user.rating) === 1) {
								$rootScope.feedback.ratings.one++;
							} else if (parseInt(user.rating) === 2) {
								$rootScope.feedback.ratings.two++;
							} else if (parseInt(user.rating) === 3) {
								$rootScope.feedback.ratings.three++;
							} else if (parseInt(user.rating) === 4) {
								$rootScope.feedback.ratings.four++;
							} else {
								$rootScope.feedback.ratings.five++;
							}
						});

						readModal = openModal({
							modal: {
								name: 'FeedbackForm',
								dismissable: true,
								form: 'components/modal/views/feedback/read.html',
								title: '{{feedback.lesson.title}}: {{feedback.startTime| date:\'HH:mm\'}} - {{feedback.endTime| date:\'HH:mm\'}}, {{moment.utc(feedback.startTime).format("dddd Do MMMM YYYY")}}',
								buttons: [{
									classes: 'btn-primary',
									text: 'Close',
									click: function(e) {
										readModal.close(e);
									}
								}]
							}
						}, 'modal-primary', 'lg');
					};
				},
			},
			confirm: {
				leaveSession: function(msg, cb) {
					cb = cb || angular.noop;
					return function() {
						var confirmModal;
						$rootScope.leaveMsg = msg;

						console.info(msg);

						confirmModal = openModal({
							modal: {
								name: 'leaveSessionForm',
								dismissable: true,
								sizePercent: 30,
								form: 'components/modal/views/session/leave.html',
								title: 'Leaving Session',
								buttons: [{
									classes: 'md-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										$mdDialog.hide(false);
									}
								}, {
									classes: 'md-primary bold',
									text: 'Leave',
									click: function() {
										$mdDialog.hide(true);
									}
								}]
							}
						}, 'modal-danger', 'md');

						confirmModal.then(function(e) {
							cb(e);
						});
					};
				},
				leaveSessionNoFeedback: function(id, cb) {
					cb = cb || angular.noop;
					return function() {
						var confirmModal;
						var session = id;

						$rootScope.feedback = {
							rating: 0,
							comment: ''
						};

						confirmModal = openModal({
							modal: {
								name: 'leaveSessionNoFeedbackForm',
								dismissable: true,
								form: 'components/modal/views/session/leaveNoFeedback.html',
								title: 'Leaving Session',
								buttons: [{
									classes: 'btn-danger pull-left',
									text: 'No Thanks!',
									click: function(e) {
										$rootScope.submitted = false;
										confirmModal.close(e);
									}
								}, {
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										confirmModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: 'Submit',
									click: function(e) {
										var feedback = $rootScope.feedback;
										feedback.session = session; // attach session id to object
										feedback.user = Auth.getCurrentUser()._id; // attach user
										if (feedback.rating !== 0) {
											// send feedback to server here
											Session.sendFeedback(feedback, function() {
												confirmModal.close(e);
											});
										}

									}
								}]
							}
						}, 'modal-danger', 'md');

						confirmModal.then(function() {
							cb();
						});
					};
				}
			},
			create: {
				user: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var createModal, createdUser;
						// refresh validation on new modal open - remove details
						$rootScope.user = {
							name: '',
							email: ''
						};
						$rootScope.roles = {};
						// $rootScope.departments = {};

						$rootScope.depDropdownSel = function(target) {
							$rootScope.user.department = target;
						};
						$rootScope.userRoleDropdownSel = function(target) {
							$rootScope.user.role = target;
						};

						// use the Thing service to return back some constants
						Thing.getByName('userRoles').then(function(val) {
							$rootScope.roles = val.content;
							$rootScope.user.role = 'Select Role';
						});

						Thing.getByName('uniEmail').then(function(val) {
							// add Any to start of array
							$rootScope.uniEmail = val.content[0];
						});

						createModal = openModal({
							modal: {
								name: 'createrUserForm',
								dismissable: true,
								form: 'components/modal/views/user/create.html',
								title: 'Create User',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										// reset submit state
										$rootScope.submitted = false;
										createModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;

										if ($rootScope.user.role !== 'Select Role' && $rootScope.user.name !== '' && $rootScope.user.email !== '') {

											$rootScope.res.received = false;

											Auth.createUser({
													user: $rootScope.user
												})
												.then(function(res) {
													$rootScope.res.received = true;
													// reset submit state
													$rootScope.submitted = false;
													form.$setUntouched();
													form.$setPristine();
													createdUser = res.user;
													// user created, close the modal
													createModal.close(e);
												})
												.catch(function(err) {
													$rootScope.res.received = true;
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-success', null);

						createModal.then(function() {
							cb(createdUser);
						});
					};
				},
				feedback: function(id, cb) {
					cb = cb || angular.noop;
					return function() {
						var session = id;

						var createModal;
						$rootScope.feedback = {
							rating: 0,
							comment: ''
						};

						Session.getOne(session).then(function(res) {
							var lesson = res.lesson._id;
							Lesson.getOne(lesson).then(function(res) {
								$rootScope.lesson = res; // need to elaborate on this
								createModal = openModal({
									modal: {
										name: 'showSessionContent',
										dismissable: true,
										form: 'components/modal/views/session/feedback.html',
										title: 'Session Feedback',
										buttons: [{
											classes: 'btn-primary',
											text: 'Dismiss',
											click: function(e) {
												createModal.dismiss(e);
											}
										}, {
											classes: 'btn-success',
											text: 'Send',
											click: function(e) {
												var feedback = $rootScope.feedback;
												feedback.session = session; // attach session id to object
												feedback.user = Auth.getCurrentUser()._id; // attach user
												if (feedback.rating !== 0) {
													// send feedback to server here
													Session.sendFeedback(feedback, function() {
														createModal.close(e);
													});
												}
											}
										}]
									}
								}, 'modal-primary', 'md');

								createModal.then(function() {
									cb();
								});
							});
						});
					};
				},
				module: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var createModal, createdModule;

						$rootScope.module = {
							code: '',
							name: '',
							tutor: ''
						};

						// creates a unique access code everytime the modal is opened.
						// createUniqueAccessCode();
						createModal = openModal({
							modal: {
								name: 'createModuleForm',
								controller: 'ModuleCreateModalCtrl',
								sizePercent: 70,
								dismissable: true,
								fullScreen: true,
								form: 'components/modal/views/module/create.html',
								title: 'Creating Module...',
								buttons: [{
									classes: 'md-default',
									text: 'Cancel',
									click: function(e) {
										// reset submit state
										$rootScope.submitted = false;
										$rootScope.moduleAlreadyExists = false;
										$mdDialog.cancel();
									}
								}, {
									classes: 'md-primary bold',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;
										if (form.module.code !== '' && form.module.name !== '') {
											Module.create({
													code: form.module.code,
													name: form.module.name,
													tutors: form.selectedTutors
												})
												.then(function(res) {
													// $rootScope.res.received = true;
													// reset submit state
													$rootScope.submitted = false;
													$rootScope.moduleAlreadyExists = false;
													// form.$setUntouched();
													// form.$setPristine();

													// module created, close the modal
													$mdDialog.hide(res);
												})
												.catch(function(err) {
													$rootScope.res.received = true;
													$rootScope.errors = {};

													// if module already exists
													if (err.code === 11000) {
														form.code.$setValidity('mongoose', false);
														$rootScope.moduleAlreadyExists = true;
														// add placeholder back in if empty
														addPlaceholderInIfEmpty();
													} else {
														// Update validity of form fields that match the mongoose errors
														angular.forEach(err.errors, function(error, field) {
															form[field].$setValidity('mongoose', false);
															$rootScope.errors[field] = error.message;
														});
													}
												});
										} else {
											$rootScope.res.received = true;
											$rootScope.errors = {};
										}
									}
								}]
							}
						}, 'modal-success', 'lg');

						createModal.then(function(res) {
							cb(res, true);
						});
					};
				},
				moduleGroup: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var createModal, createdModule;

						$rootScope.me = Auth.getCurrentUser();

						// used to determine whether user wants to continue creating modules
						$rootScope.continuing = false;

						$rootScope.module = {
							_id: '',
							name: '',
							tutor: '',
							students: ''
						};

						// with placeholder
						$rootScope.importUsers = [{
							user: '01234567',
							forename: 'John',
							surname: 'Smith',
							placeholder: true
						}];

						$rootScope.formBackdrop = 'static';

						$rootScope.possibleTutors = [];
						$rootScope.selectedTutors = [{
							user: $rootScope.me._id,
							name: $rootScope.me.forename + ' ' + $rootScope.me.surname,
							email: $rootScope.me.email,
							role: $rootScope.me.role,
							currentUser: true
						}];

						$rootScope.removeTutor = function(user) {
							for (var tutor in $rootScope.selectedTutors) {
								if ($rootScope.selectedTutors[tutor] === user) {
									$rootScope.selectedTutors.splice(tutor, 1);
								}
							}
						};

						$rootScope.addRowToModuleTable = function() {
							$rootScope.importUsers.push({
								user: '01234567',
								forename: 'John',
								surname: 'Smith',
								placeholder: true
							});
						};
						$rootScope.deleteModuleTableRow = function(uid) {
							$rootScope.importUsers = $rootScope.importUsers.filter(function(item) {
								return item.user !== uid;
							});
							addPlaceholderInIfEmpty();
						};

						var addPlaceholderInIfEmpty = function() {
							if (_.isEmpty($rootScope.importUsers)) {
								$rootScope.importUsers.push({
									user: '01234567',
									forename: 'John',
									surname: 'Smith',
									placeholder: true
								});
							}
						};

						$rootScope.dissolveIfPlaceholder = function(user, placeholder) {
							if (placeholder) {
								user.user = '';
								user.forename = '';
								user.surname = '';
								user.placeholder = false;
							}
						};

						$rootScope.checkForSubmit = function(e) {
							// checking length to see if id has been sent through
							if (e.keyCode === 13 || e === 'Submit' || e._id) {
								// if name isn't on the list, break out of function
								if ($rootScope.possibleTutors.length === 0) {
									return;
								} else {
									// need to either get selected here, or select first
									if (!($rootScope.module.tutor instanceof Object)) {
										if (e === 'Submit') {
											// gets index of child with active class from typeahead property
											$rootScope.module.tutor = $rootScope.possibleTutors[angular.element(document.querySelector('[id*=\'typeahead\']')).find('.active').index()];
										}
									}
								}

								// only add if we have a tutor
								if ($rootScope.module.tutor instanceof Object) {
									$rootScope.selectedTutors.push($rootScope.module.tutor);
									$rootScope.selectedTutors.sort(function compare(a, b) {
										if (a.name < b.name) {
											return -1;
										}
										if (a.name > b.name) {
											return 1;
										}
										return 0;
									});
								}

								$rootScope.possibleTutors = [];
								$rootScope.module.tutor = '';
							}
						};

						$rootScope.searchPossibleTutors = function() {
							Module.getTutors({
								user: $rootScope.me._id,
								search: $rootScope.module.tutor
							}).then(function(res) {
								// reset before continuing
								$rootScope.possibleTutors = [];
								// filter through possibleTutors here, check against already existing tutors and only allow them to stay if they don't exist
								for (var x = 0; x < res.length; x++) {
									var isIn = false;
									for (var y = 0; y < $rootScope.selectedTutors.length; y++) {
										if (res[x]._id === $rootScope.selectedTutors[y].user) {
											isIn = true;
										}
									}
									if (!isIn && res[x]._id !== $rootScope.me._id) {
										// only used internally, _id is the only referenced part in module model
										$rootScope.possibleTutors.push({
											user: res[x]._id,
											name: res[x].forename + ' ' + res[x].surname,
											email: res[x]._id,
											role: res[x]._id
										});
									}
								}
							});
						};

						// creates a unique access code everytime the modal is opened.
						// createUniqueAccessCode();
						createModal = openModal({
							modal: {
								name: 'createrModuleForm',
								sizePercent: 70,
								dismissable: true,
								backdrop: $rootScope.formBackdrop,
								form: 'components/modal/views/module/create.html',
								title: 'Creating module...',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										// reset submit state
										$rootScope.submitted = false;
										$rootScope.continuing = false;
										$rootScope.moduleAlreadyExists = false;
										createModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: 'Create & Continue',
									click: function(e, form) {
										$rootScope.submitted = true;
										$rootScope.continuing = false;
										$rootScope.res.received = false;

										// filter students for placeholder
										$rootScope.importUsers = $rootScope.importUsers.filter(function(item) {
											return item.id !== '01234567' &&
												item.forename !== 'John' &&
												item.surname !== 'Smith';
										});

										if ($rootScope.module._id !== '' && $rootScope.module.name !== '') {
											Module.create({
													_id: $rootScope.module._id,
													name: $rootScope.module.name,
													tutors: $rootScope.selectedTutors,
													students: $rootScope.importUsers
												})
												.then(function(res) {
													$rootScope.res.received = true;
													// reset submit state
													$rootScope.submitted = false;
													$rootScope.moduleAlreadyExists = false;
													form.$setUntouched();
													form.$setPristine();
													createdModule = res;
													$rootScope.continuing = true;
													createModal.close(e);
												})
												.catch(function(err) {
													$rootScope.res.received = true;
													$rootScope.continuing = false;
													$rootScope.errors = {};

													// if module already exists
													if (err.code === 11000) {
														form.id.$setValidity('mongoose', false);
														$rootScope.moduleAlreadyExists = true;
														// add placeholder back in if empty
														addPlaceholderInIfEmpty();
													} else {
														// Update validity of form fields that match the mongoose errors
														angular.forEach(err.errors, function(error, field) {
															form[field].$setValidity('mongoose', false);
															$rootScope.errors[field] = error.message;
														});
													}
												});
										} else {
											$rootScope.res.received = true;
											$rootScope.errors = {};
											// add placeholder back in if empty
											addPlaceholderInIfEmpty();
										}
									}
								}, {
									classes: 'btn-success',
									text: 'Create & Finish',
									click: function(e, form) {
										$rootScope.submitted = true;
										$rootScope.continuing = false;
										$rootScope.res.received = false;

										// filter students for placeholder
										$rootScope.importUsers = $rootScope.importUsers.filter(function(item) {
											return (item.id !== '01234567' &&
													item.forename !== 'John' &&
													item.surname !== 'Smith') ||
												item.id !== '' ||
												item.forename !== '' ||
												item.surname !== '';
										});

										if ($rootScope.module._id !== '' && $rootScope.module.name !== '') {
											Module.create({
													_id: $rootScope.module._id,
													name: $rootScope.module.name,
													tutors: $rootScope.selectedTutors,
													students: $rootScope.importUsers
												})
												.then(function(res) {
													$rootScope.res.received = true;
													// reset submit state
													$rootScope.submitted = false;
													$rootScope.moduleAlreadyExists = false;
													form.$setUntouched();
													form.$setPristine();
													createdModule = res;
													// user created, close the modal
													createModal.close(e);
												})
												.catch(function(err) {
													$rootScope.res.received = true;
													$rootScope.errors = {};

													// if module already exists
													if (err.code === 11000) {
														form.id.$setValidity('mongoose', false);
														$rootScope.moduleAlreadyExists = true;
														// add placeholder back in if empty
														addPlaceholderInIfEmpty();
													} else {
														// Update validity of form fields that match the mongoose errors
														angular.forEach(err.errors, function(error, field) {
															form[field].$setValidity('mongoose', false);
															$rootScope.errors[field] = error.message;
														});
													}
												});
										} else {
											$rootScope.res.received = true;
											$rootScope.errors = {};
											// add placeholder back in if empty
											addPlaceholderInIfEmpty();
										}
									}
								}]
							}
						}, 'modal-success', 'lg');

						$rootScope.showCsvData = function(res) {
							if ($rootScope.importUsers[0].placeholder) {
								$rootScope.importUsers = [];
							}
							for (var y = 0; y < res.length; y++) {
								var existsAlready = false;
								for (var x = 0; x < $rootScope.importUsers.length; x++) {
									if ($rootScope.importUsers[x].user === res[y].user) {
										existsAlready = true;
									}
								}
								if (!existsAlready) {
									$rootScope.importUsers.push(res[y]);
								}
							}
							// add placeholder back in if empty
							addPlaceholderInIfEmpty();
							$timeout(function() {
								$('.csv-dropzone').focus();
							});
						};

						createModal.then(function() {
							cb(createdModule, $rootScope.continuing);
						});
					};
				},
				lesson: function(cb) {
					cb = cb || angular.noop;
					var createModal, createdLesson;
					$rootScope.submitted = false;

					return function() {
						createModal = openModal({
							modal: {
								name: 'createrUserForm',
								controller: 'LessonCreateModalCtrl',
								sizePercent: 70,
								dismissable: true,
								fullScreen: true,
								form: 'components/modal/views/lesson/create.html',
								title: 'Creating Lesson...',
								buttons: [{
									classes: 'md-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										$mdDialog.cancel();
									}
								}, {
									classes: 'md-primary bold',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;
										if (form.lesson.title) {
											// setup vars to be sent across to API
											var collabs = [];
											// push each selected collaborator into array
											for (var i = 0; i < form.selectedCollaborators.length; i++) {
												collabs.push({
													user: form.selectedCollaborators[i]._id
												});
											}

											// remove this entry, and add the array collection
											delete form.lesson.collaborator;
											form.lesson['collaborators'] = collabs;

											$rootScope.res.received = false;

											Lesson.createLesson({
													data: form.lesson
												})
												.then(function(res) {
													createdLesson = res;

													$rootScope.dropzone[0].dropzone.options.url += createdLesson._id + '/files';

													if (!_.isEmpty($rootScope.dropzone[0].dropzone.getAcceptedFiles())) {
														$rootScope.dropzone[0].dropzone.processQueue();
													} else {
														// lesson created with no files, close the modal
														$rootScope.res.received = true;
														$rootScope.submitted = false;
														// form.$setUntouched();
														// form.$setPristine();
														$mdDialog.hide(form.lesson);
													}
												})
												.catch(function(err) {
													$rootScope.errors = {};
													$rootScope.res.received = true;

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						});

						$rootScope.uploadSuccess = function(res) {
							$rootScope.res.received = true;
							$mdDialog.hide(res);
						};

						createModal.then(function(res) {
							cb(res);
						}, function() {
							// on err?
						});
					};
				},
				runtime: function(cb) {
					cb = cb || angular.noop;
					var createModal, createdRuntime;
					$rootScope.submitted = false;

					return function() {
						createModal = openModal({
							modal: {
								name: 'createRuntimeForm',
								controller: 'RuntimeCreateModalCtrl',
								sizePercent: 40,
								dismissable: true,
								fullScreen: true,
								form: 'components/modal/views/session/create-runtime.html',
								title: 'Adding runtime...',
								buttons: [{
									classes: 'md-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										$mdDialog.cancel();
									}
								}, {
									classes: 'md-primary bold',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;
										console.info(form);
										$mdDialog.hide(form);
									}
								}]
							}
						});

						createModal.then(function(res) {
							cb(res);
						}, function() {
							// on err?
						});
					};
				}
			},
			update: {
				user: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var args = Array.prototype.slice.call(arguments),
							updateModal, updatedUser;
						var user = args.shift();
						// refresh validation on new modal open - remove details
						$rootScope.roles = {};
						$rootScope.departments = {};
						$rootScope.updatedUser = angular.copy(user);

						$rootScope.depDropdownSel = function(target) {
							$rootScope.updatedUser.department = target;
						};
						$rootScope.userRoleDropdownSel = function(target) {
							$rootScope.updatedUser.role = target;
						};

						// use the Thing service to return back some constants
						Thing.getByName('userRoles').then(function(val) {
							$rootScope.roles = val.content;
						});
						// Department.get().then(function(val) {
						// 	// loop through, and create key pairs to pass on scope variable
						// 	val.forEach(function(dep) {
						// 		var subs = [];
						// 		dep.subdepartment.forEach(function(subdep) {
						// 			subs.push(subdep.name);
						// 		});
						// 		$rootScope.departments[dep.name] = subs;
						// 	});
						//
						// 	// add to start of array
						// 	$rootScope.updatedUser.department = user.department;
						// });

						Thing.getByName('uniEmail').then(function(val) {
							// add Any to start of array
							$rootScope.uniEmail = val.content[0];
							// remove uniEmail standard from users Email
							$rootScope.userTempEmail = $rootScope.updatedUser.email.split(val.content[0])[0];
						});


						updateModal = openModal({
							modal: {
								name: 'updateUserForm',
								dismissable: true,
								title: 'Update User',
								form: 'components/modal/views/user/update.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-warning',
									text: 'Update',
									click: function(e, form) {
										$rootScope.submitted = true;

										if ($rootScope.updatedUser.role !== 'Select Role' && $rootScope.updatedUser.department !== 'Select Department' && $rootScope.updatedUser.name) {

											Auth.updateUser({
													user: $rootScope.updatedUser
												})
												.then(function(res) {
													updatedUser = res.user;
													// user created, close the modal
													$rootScope.submitted = false;
													form.$setUntouched();
													form.$setPristine();
													updateModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-warning', null);

						updateModal.then(function() {
							cb(updatedUser);
						});
					};
				},
				module: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var args = Array.prototype.slice.call(arguments),
							updateModal, updatedUser;
						var user = args.shift();
						// refresh validation on new modal open - remove details
						$rootScope.roles = {};
						$rootScope.departments = {};
						$rootScope.updatedUser = angular.copy(user);

						$rootScope.depDropdownSel = function(target) {
							$rootScope.updatedUser.department = target;
						};
						$rootScope.userRoleDropdownSel = function(target) {
							$rootScope.updatedUser.role = target;
						};

						// use the Thing service to return back some constants
						Thing.getByName('userRoles').then(function(val) {
							$rootScope.roles = val.content;
						});
						// Department.get().then(function(val) {
						// 	// loop through, and create key pairs to pass on scope variable
						// 	val.forEach(function(dep) {
						// 		var subs = [];
						// 		dep.subdepartment.forEach(function(subdep) {
						// 			subs.push(subdep.name);
						// 		});
						// 		$rootScope.departments[dep.name] = subs;
						// 	});
						//
						// 	// add to start of array
						// 	$rootScope.updatedUser.department = user.department;
						// });

						Thing.getByName('uniEmail').then(function(val) {
							// add Any to start of array
							$rootScope.uniEmail = val.content[0];
							// remove uniEmail standard from users Email
							$rootScope.userTempEmail = $rootScope.updatedUser.email.split(val.content[0])[0];
						});


						updateModal = openModal({
							modal: {
								name: 'updateUserForm',
								dismissable: true,
								title: 'Update Module',
								form: 'components/modal/views/module/update.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-warning',
									text: 'Update',
									click: function(e, form) {
										$rootScope.submitted = true;

										if ($rootScope.updatedUser.role !== 'Select Role' && $rootScope.updatedUser.department !== 'Select Department' && $rootScope.updatedUser.name) {

											Auth.updateUser({
													user: $rootScope.updatedUser
												})
												.then(function(res) {
													updatedUser = res.user;
													// user created, close the modal
													$rootScope.submitted = false;
													form.$setUntouched();
													form.$setPristine();
													updateModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-warning', null);

						updateModal.then(function() {
							cb(updatedUser);
						});
					};
				},
				lesson: function(cb) {
					cb = cb || angular.noop;
					return function() {
						//   var args = Array.prototype.slice.call(arguments),
						// 	updateModal, updatedUser;
						//   var user = args.shift();
						//   // refresh validation on new modal open - remove details
						//   $rootScope.roles = {};
						//   $rootScope.departments = {};
						//   $rootScope.updatedUser = angular.copy(user);

						var args = Array.prototype.slice.call(arguments),
							updateModal, updatedLesson;
						var lesson = args.shift();
						$rootScope.updatedLesson = angular.copy(lesson);
						$rootScope.me = Auth.getCurrentUser();
						// $rootScope.lesson = {
						//   startTime: new Date(),
						//   endTime: new Date(new Date().getTime() + 60 * 60000),
						//   createdBy: $rootScope.me.name,
						//   qActAllowance: 10,
						// };
						// refresh validation on new modal open - remove details
						updateModal = openModal({
							modal: {
								name: 'updateLessonForm',
								dismissable: true,
								title: 'Update Lesson',
								form: 'components/modal/views/lesson/update.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-warning',
									text: 'Update',
									click: function( /*e, form*/ ) {
										// $rootScope.submitted = true;

										/*
										$rootScope.submitted = false;
										form.$setUntouched();
										form.$setPristine();
										*/
										//
										// if ($rootScope.updatedUser.role !== 'Select Role' && $rootScope.updatedUser.department !== 'Select Department' && $rootScope.updatedUser.name) {
										//
										// 	Auth.updateUser({
										// 			user: $rootScope.updatedUser
										// 		})
										// 		.then(function(res) {
										// 			updatedUser = res.user;
										// 			// user created, close the modal
										// 			updateModal.close(e);
										// 		})
										// 		.catch(function(err) {
										// 			$rootScope.errors = {};
										//
										// 			// Update validity of form fields that match the mongoose errors
										// 			angular.forEach(err.errors, function(error, field) {
										// 				form[field].$setValidity('mongoose', false);
										// 				$rootScope.errors[field] = error.message;
										// 			});
										// 		});
										// }
									}
								}]
							}
						}, 'modal-warning', 'lg');

						updateModal.then(function() {
							cb(updatedLesson);
						});
					};
				},
				session: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var args = Array.prototype.slice.call(arguments),
							updateModal, updatedSession;
						var session = args.shift();

						$rootScope.updatedSession = angular.copy(session);

						$rootScope.selectedModules = [];

						$rootScope.updatedSession.startTime = moment.utc(session.startTime).format('DD/MM/YYYY HH:mm');
						$rootScope.updatedSession.endTime = moment.utc(session.endTime).format('DD/MM/YYYY HH:mm');


						for (var module in session.modules) {
							$rootScope.selectedModules.push(session.modules[module].module);
						}


						updateModal = openModal({
							modal: {
								name: 'updateDeleteForm',
								dismissable: true,
								title: 'Update Session',
								form: 'components/modal/views/session/updateDelete.html',
								buttons: [{
									classes: 'btn-danger pull-left',
									text: 'Delete',
									click: function(e /*, form*/ ) {
										// $rootScope.submitted = false;
										// form.$setUntouched();
										// form.$setPristine();
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-warning',
									text: 'Update',
									click: function(e, form) {
										$rootScope.submitted = true;

										if ($rootScope.updatedUser.role !== 'Select Role' && $rootScope.updatedUser.department !== 'Select Department' && $rootScope.updatedUser.name) {

											Auth.updateUser({
													user: $rootScope.updatedUser
												})
												.then(function(res) {
													updatedSession = res.session;
													$rootScope.submitted = false;
													form.$setUntouched();
													form.$setPristine();
													// session updated, close the modal
													updateModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-warning', 'md');

						updateModal.then(function() {
							cb(updatedSession);
						});
					};
				}
			},
			/* Confirmation modals */
			delete: {

				/**
				 * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
				 * @param  {Function} del - callback, ran when delete is confirmed
				 * @return {Function}     - the function to open the modal (ex. myModalFn)
				 */
				user: function(cb) {
					cb = cb || angular.noop;
					/**
					 * Open a delete confirmation modal
					 * @param  {String} name   - name or info to show on modal
					 * @param  {All}           - any additional args are passed straight to del callback
					 */
					return function() {
						var args = Array.prototype.slice.call(arguments),
							user = args.shift(),
							deleteModal;
						$rootScope.userToDelete = angular.copy(user);
						if (user._id === Auth.getCurrentUser()._id) {
							deleteModal = openModal({
								modal: {
									name: 'deleteUserForm',
									dismissable: true,
									sizePercent: 30,
									title: 'Warning',
									form: 'components/modal/views/user/cannot-delete.html',
									buttons: [{
										classes: 'btn-warning',
										text: 'OK',
										click: function(e, form) {
											$rootScope.submitted = false;
											form.$setUntouched();
											form.$setPristine();
											deleteModal.close(e);
										}
									}]
								}
							}, 'modal-warning');

							deleteModal.then(function() {
								cb(null);
							});
						} else {
							deleteModal = openModal({
								modal: {
									name: 'deleteConf',
									dismissable: true,
									sizePercent: 30,
									title: 'Confirm Delete',
									form: 'components/modal/views/user/delete.html',
									buttons: [{
										classes: 'btn-default',
										text: 'Cancel',
										click: function(e) {
											$rootScope.submitted = false;
											deleteModal.dismiss(e);
										}
									}, {
										classes: 'btn-danger',
										text: 'Delete',
										click: function(e, form) {
											$rootScope.submitted = false;
											form.$setUntouched();
											form.$setPristine();
											deleteModal.close(e);
										}
									}]
								}
							}, 'modal-danger', null);

							deleteModal.then(function() {
								cb(user);
							});
						}
					};
				},
				module: function(cb) {
					cb = cb || angular.noop;
					/**
					 * Open a delete confirmation modal
					 * @param  {String} name   - name or info to show on modal
					 * @param  {All}           - any additional args are passed straight to del callback
					 */
					return function() {
						var args = Array.prototype.slice.call(arguments),
							user = args.shift(),
							deleteModal;
						deleteModal = openModal({
							modal: {
								name: 'deleteConf',
								dismissable: true,
								sizePercent: 30,
								title: 'Confirm Delete',
								form: 'components/modal/views/module/delete.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										deleteModal.dismiss(e);
									}
								}, {
									classes: 'btn-danger',
									text: 'Delete',
									click: function(e, form) {
										$rootScope.submitted = false;
										form.$setUntouched();
										form.$setPristine();
										deleteModal.close(e);
									}
								}]
							}
						}, 'modal-danger', null);

						deleteModal.then(function() {
							cb(user);
						});
					};
				},
				lesson: function(cb) {
					cb = cb || angular.noop;
					/**
					 * Open a delete confirmation modal
					 * @param  {String} name   - name or info to show on modal
					 * @param  {All}           - any additional args are passed straight to del callback
					 */
					return function() {
						var args = Array.prototype.slice.call(arguments),
							lesson = args.shift(),
							deleteModal;

						$rootScope.lessonToDelete = angular.copy(lesson);
						deleteModal = openModal({
							modal: {
								name: 'deleteConf',
								dismissable: true,
								sizePercent: 30,
								title: 'Confirm Delete',
								form: 'components/modal/views/lesson/delete.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										$rootScope.submitted = false;
										$mdDialog.cancel();
									}
								}, {
									classes: 'btn-danger',
									text: 'Delete',
									click: function(e, form) {
										$rootScope.submitted = false;
										$mdDialog.hide(e);
									}
								}]
							}
						}, 'modal-danger', null);

						deleteModal.then(function() {
							cb(lesson);
						});

					};
				}
			}
		};
	});