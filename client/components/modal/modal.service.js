'use strict';

angular.module('uniQaApp')
	.factory('Modal', function($rootScope, $modal, $parse, $window, $location, Auth, Thing, Group, Lecture, Session) {

		// Use the User $resource to fetch all users
		$rootScope.user = {};
		$rootScope.errors = {};
		$rootScope.form = {};

		$rootScope.res = {
			received: true
		}

		/**
		 * Opens a modal
		 * @param  {Object} scope      - an object to be merged with modal's scope
		 * @param  {String} modalClass - (optional) class(es) to be applied to the modal
		 * @return {Object}            - the instance $modal.open() returns
		 */
		function openModal(scope, modalClass, modalSize) {
			var modalScope = $rootScope.$new();
			scope = scope || {};
			modalClass = modalClass || 'modal-default';
			modalSize = modalSize || 'md';


			angular.extend(modalScope, scope);

			return $modal.open({
				templateUrl: 'components/modal/views/modal.html',
				windowClass: modalClass,
				scope: modalScope,
				size: modalSize
			});
		}

		var isUrl = function(string) {
			var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
			return regexp.test(string);
		}

		// Public API here
		return {
			read: {
				qr: function(cb) {
					cb = cb || angular.noop;
					var args = Array.prototype.slice.call(arguments);
					var session = args.shift();

					return function() {
						var readModal;
						var me = Auth.getCurrentUser();
						console.info(session);
						Session.getOne(session).then(function(res) {
							$rootScope.session = res;
							console.info(res);
							readModal = openModal({
								modal: {
									name: 'createrUserForm',
									dismissable: true,
									form: 'components/modal/views/qr/read.html',
									title: 'Show QR',
									buttons: [{
										classes: 'btn-primary',
										text: 'Dismiss',
										click: function(e) {
											readModal.close(e);
										}
									}]
								}
							}, 'modal-primary', null);
						});
					};
				},
				sessionContent: function(cb) {
					cb = cb || angular.noop;
					var args = Array.prototype.slice.call(arguments);
					var lecture = args.shift();
					var sessionid = args.shift();
					var me = Auth.getCurrentUser();

					return function() {
						var readModal;

						console.info(lecture);

						$rootScope.getFile = function(file) {
							Session.getFile({
								lecture: lecture._id,
								user: me._id,
								file: file,
								session: sessionid
							}).then(function(res) {
								// console.info(res);
							});
						};

						Session.getOne(sessionid).then(function(res) {
							var lecture = res.lecture._id;
							Lecture.getOne(lecture).then(function(res) {
								for (var item in res.attachments) {
									res.attachments[item].name = res.attachments[item].loc.split('/').pop();
								}
								$rootScope.lecture = res; // need to elaborate on this

								readModal = openModal({
									modal: {
										name: 'showSessionContent',
										dismissable: true,
										form: 'components/modal/views/session/content.html',
										title: 'Lecture Content',
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
						// attach momentJS to scope
						$rootScope.moment = moment;

						$rootScope.feedback = args.shift(); // gets feedback passed through from main view

						var readModal;
						var me = Auth.getCurrentUser();

						$rootScope.showQuestions = false;

						$rootScope.toggleQuestions = function() {
							$rootScope.showQuestions = !$rootScope.showQuestions;
						}



						console.info($rootScope.feedback);

						$rootScope.feedback.ratings = {
							one: 0,
							two: 0,
							three: 0,
							four: 0,
							five: 0
						}

						// get each users feedback and put into band
						_.some($rootScope.feedback.feedback, function(user) {
							// get each amount
							if (user.rating == 1) {
								$rootScope.feedback.ratings.one++;
							} else if (user.rating == 2) {
								$rootScope.feedback.ratings.two++;
							} else if (user.rating == 3) {
								$rootScope.feedback.ratings.three++;
							} else if (user.rating == 4) {
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
								title: '{{feedback.lecture.title}}: {{feedback.startTime| date:\'HH:mm\'}} - {{feedback.endTime| date:\'HH:mm\'}}, {{moment.utc(feedback.startTime).format("dddd Do MMMM YYYY")}}',
								buttons: [{
									classes: 'btn-primary',
									text: 'Close',
									click: function(e) {
										readModal.close(e);
									}
								}]
							}
						}, 'modal-primary', 'lg');
						// });
					};
				},
			},
			confirm: {
				leaveSession: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var confirmModal;

						confirmModal = openModal({
							modal: {
								name: 'leaveSessionForm',
								dismissable: true,
								form: 'components/modal/views/session/leave.html',
								title: 'Leaving Session',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										confirmModal.dismiss(e);
									}
								}, {
									classes: 'btn-danger',
									text: 'Leave',
									click: function(e, form) {
										confirmModal.close(e);
									}
								}]
							}
						}, 'modal-danger', 'md');

						confirmModal.result.then(function() {
							cb();
						});
					};
				}
			},
			import: {
				user: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var importModal;
						var me = Auth.getCurrentUser();
						$rootScope.importViewData = false;
						$rootScope.importBtnText = 'Next...';
						$rootScope.importCancelText = 'Cancel';
						$rootScope.importUsers = [];

						Thing.getByName('uniEmail').then(function(val) {
							// add Any to start of array
							$rootScope.uniEmail = val.content[0];
						});


						// $rootScope.showCsvData = function(res) {
						// 	console.info(res);
						// 	// console.info("hit success on file upload");
						// };

						function CSVToArray(strData, strDelimiter) {
							// Check to see if the delimiter is defined. If not,
							// then default to comma.
							strDelimiter = (strDelimiter || ",");
							// Create a regular expression to parse the CSV values.
							var objPattern = new RegExp((
								// Delimiters.
								"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
								// Quoted fields.
								"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
								// Standard fields.
								"([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
							// Create an array to hold our data. Give the array
							// a default empty first row.
							var arrData = [
								[]
							];
							// Create an array to hold our individual pattern
							// matching groups.
							var arrMatches = null;
							// Keep looping over the regular expression matches
							// until we can no longer find a match.
							while (arrMatches = objPattern.exec(strData)) {
								// Get the delimiter that was found.
								var strMatchedDelimiter = arrMatches[1];
								// Check to see if the given delimiter has a length
								// (is not the start of string) and if it matches
								// field delimiter. If id does not, then we know
								// that this delimiter is a row delimiter.
								if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
									// Since we have reached a new row of data,
									// add an empty row to our data array.
									arrData.push([]);
								}
								// Now that we have our delimiter out of the way,
								// let's check to see which kind of value we
								// captured (quoted or unquoted).
								if (arrMatches[2]) {
									// We found a quoted value. When we capture
									// this value, unescape any double quotes.
									var strMatchedValue = arrMatches[2].replace(
										new RegExp("\"\"", "g"), "\"");
								} else {
									// We found a non-quoted value.
									var strMatchedValue = arrMatches[3];
								}
								// Now that we have our value string, let's add
								// it to the data array.
								arrData[arrData.length - 1].push(strMatchedValue);
							}
							// Return the parsed data.
							return (arrData);
						}

						function CSVToJSON(csv) {
							var array = CSVToArray(csv);
							var objArray = [];
							for (var i = 1; i < array.length; i++) {
								objArray[i - 1] = {};
								for (var k = 0; k < array[0].length && k < array[i].length; k++) {
									var key = array[0][k];
									objArray[i - 1][key] = array[i][k]
								}
							}

							var json = JSON.stringify(objArray);
							var str = json.replace(/},/g, "},\r\n");

							return str;
						}

						$rootScope.deleteImportableUser = function(userid) {
							console.info(userid);
							angular.forEach($rootScope.importUsers, function(u, i) {
								if (u.id === userid) {
									$rootScope.importUsers.splice(i, 1);
								}
							});
						}

						importModal = openModal({
							modal: {
								name: 'createrUserForm',
								dismissable: true,
								form: 'components/modal/views/user/import.html',
								title: 'Import Users',
								buttons: [{
									classes: 'btn-default',
									text: '{{importCancelText}}',
									click: function(e) {
										if ($rootScope.importViewData) {
											$rootScope.importBtnText = 'Next...';
											$rootScope.importCancelText = 'Cancel';
											$rootScope.importViewData = false;
										} else {
											importModal.dismiss(e);
										}

									}
								}, {
									classes: 'btn-success',
									text: '{{importBtnText}}',
									click: function(e, form) {
										if ($rootScope.dropzone[0].dropzone.files[0]) {
											// if dropzone has files in it

											// when importing via csv, data just needs to be attached into a json object, the user can then look through it and make any ammendments, and then when they click save the second time, it'll send it off to the server as a multiple creation.

											// only access if first success click on this modal
											if (!$rootScope.importViewData) {
												$rootScope.res.received = false;
												var input = $rootScope.dropzone[0].dropzone;

												// if more than 1 file exists
												if (input.files[1]) {
													input.files.forEach(function(item) {
														var reader = new FileReader();
														reader.onload = function() {
															var text = reader.result;

															var usersToImport = JSON.parse(CSVToJSON(reader.result));
															// $rootScope.importUsers = JSON.parse(CSVToJSON(reader.result));

															// convert userid into email address
															for (var user in usersToImport) {
																usersToImport[user].email = String.fromCharCode(usersToImport[user].id.charCodeAt(0) + 48) + usersToImport[user].id.substring(1, usersToImport[user].id.length);
																$rootScope.importUsers.push(usersToImport[user]);
															}
														};

														reader.readAsText(item);
													});
												} else {
													var reader = new FileReader();
													reader.onload = function() {
														var text = reader.result;

														var usersToImport = JSON.parse(CSVToJSON(reader.result));

														// convert userid into email address
														for (var user in usersToImport) {
															usersToImport[user].email = String.fromCharCode(usersToImport[user].id.charCodeAt(0) + 48) + usersToImport[user].id.substring(1, usersToImport[user].id.length);
															$rootScope.importUsers.push(usersToImport[user]);
														}
													};

													reader.readAsText(input.files[0]);
												}
												$rootScope.importViewData = true;
												$rootScope.importCancelText = 'Back';
												$rootScope.importBtnText = 'Save';
												$rootScope.res.received = true;
												console.info("Importing Data");
											} else {
												console.info("Ammending & Saving");
												$rootScope.res.received = false;
												Auth.createUsers({
														users: $rootScope.importUsers
													})
													.then(function(res) {
														$rootScope.res.received = true;
														importModal.close(e);
													})
													.catch(function(err) {
														$rootScope.res.received = true;
														$rootScope.errors = {};

														// Update validity of form fields that match the mongoose errors
														angular.forEach(err.errors, function(error, field) {
															//console.info(form[field]);
															form[field].$setValidity('mongoose', false);
															$rootScope.errors[field] = error.message;
														});
													});
											}
										}
									}
								}]
							}
						}, 'modal-success', 'lg');

						importModal.result.then(function() {
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
						// Department.get().then(function(val) {
						// 	val.forEach(function(dep) {
						// 		var subs = [];
						// 		dep.subdepartment.forEach(function(subdep) {
						// 			subs.push(subdep.name);
						// 		});
						// 		$rootScope.departments[dep.name] = subs;
						// 	});
						// 	// add to start of array
						// 	$rootScope.user.department = 'Select Department';
						// });

						Thing.getByName('uniEmail').then(function(val) {
							// add Any to start of array
							$rootScope.uniEmail = val.content[0];
						});

						// creates a unique access code everytime the modal is opened.
						// createUniqueAccessCode();
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
										createModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;
										// form.$setPristine();
										// form.$setValidity();
										// form.$setUntouched();
										if ($rootScope.user.role !== 'Select Role' && $rootScope.user.department !== 'Select Department' && $rootScope.user.name && $rootScope.user.email && $rootScope.user.passcode) {

											$rootScope.res.received = false;

											Auth.createUser({
													user: $rootScope.user
												})
												.then(function(res) {
													$rootScope.res.received = true;
													createdUser = res.user;
													// user created, close the modal
													createModal.close(e);
												})
												.catch(function(err) {
													$rootScope.res.received = true;
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														//console.info(form[field]);
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-success', null);

						createModal.result.then(function() {
							cb(createdUser);
						});
					};
				},
				feedback: function(id, cb) {
					cb = cb || angular.noop;
					return function() {
						var args = Array.prototype.slice.call(arguments);
						var session = id;

						var createModal;
						$rootScope.feedback = {
							rating: 0,
							comment: ''
						};

						Session.getOne(session).then(function(res) {
							var lecture = res.lecture._id;
							Lecture.getOne(lecture).then(function(res) {
								$rootScope.lecture = res; // need to elaborate on this
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
												if (feedback.rating != 0) {
													// send feedback to server here
													Session.sendFeedback(feedback, function() {
														createModal.close(e);
													})
												}
											}
										}]
									}
								}, 'modal-primary', 'md');

								createModal.result.then(function() {
									cb();
								});
							});
						});
					};
				},
				group: function(cb) {
					cb = cb || angular.noop;
					return function() {
						var createModal, createdUser;
						// refresh validation on new modal open - remove details
						$rootScope.me = Auth.getCurrentUser();
						$rootScope.lecture = {
							startTime: new Date(),
							endTime: new Date(new Date().getTime() + 60 * 60000),
							createdBy: $rootScope.me.name,
							qActAllowance: 10,
						};

						$rootScope.groupLevels = [4, 5, 6, 7];

						// $rootScope.group = {
						// 	name: '',
						// 	email: ''
						// };

						createModal = openModal({
							modal: {
								name: 'createrUserForm',
								dismissable: true,
								form: 'components/modal/views/group/create.html',
								title: 'Create Group',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										createModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;
										// form.$setPristine();
										// form.$setValidity();
										// form.$setUntouched();
										if ($rootScope.user.role !== 'Select Role' && $rootScope.user.department !== 'Select Department' && $rootScope.user.name && $rootScope.user.email && $rootScope.user.passcode) {

											Auth.createUser({
													user: $rootScope.user
												})
												.then(function(res) {
													createdUser = res.user;
													// user created, close the modal
													createModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														//console.info(form[field]);
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-success', null);

						createModal.result.then(function() {
							cb(createdUser);
						});
					};
				},
				lecture: function(cb) {
					cb = cb || angular.noop;

					return function() {
						var createModal, createdLecture;
						var me = Auth.getCurrentUser();
						$rootScope.lecture = {
							title: '',
							type: 'Select Type',
							url: '',
							tempPreview: '',
							desc: '',
							collaborator: '',
							files: []
						};
						$rootScope.preview = {
							loading: false
						}

						$rootScope.lectureTypes = [];
						$rootScope.lectureDescHeight = 220;
						$rootScope.possibleCollaborators = [];
						$rootScope.selectedCollaborators = [];

						// get back types of lectures available
						Thing.getByName('lectureTypes').then(function(val) {
							$rootScope.lectureTypes = val.content;
						});

						$rootScope.lectureTypeDropdownSel = function(type) {
							if (type === 'URL') {
								$rootScope.lectureDescHeight = 150;
							} else {
								$rootScope.lectureDescHeight = 220;
								// reset url/prev vars
								$rootScope.lecture.url = '';
								$rootScope.lecture.tempPreview = '';
							}
							$rootScope.lecture.type = type;
						};

						$rootScope.genPreview = function() {
							// if http is present, rip it out, server adds it
							if ($rootScope.lecture.url.indexOf('http://') > -1) {
								// take anything after http
								$rootScope.lecture.url = $rootScope.lecture.url.split('http://').pop();
							}
							if ($rootScope.lecture.url.indexOf('https://') > -1) {
								// take anything after http
								$rootScope.lecture.url = $rootScope.lecture.url.split('https://').pop();
							}

							if ($rootScope.lecture.url && isUrl('http://' + $rootScope.lecture.url)) {
								$rootScope.preview.loading = true;

								Lecture.generatePreview({
									url: $rootScope.lecture.url
								}).then(function(res) {
									// only returns one element
									if (_.isEmpty(res)) {
										$rootScope.lecture.tempPreview = {
											err: true
										}
									}
									// attach with base64 tag
									$rootScope.lecture.tempPreview = 'data:image/png;base64,' + res;
									$rootScope.preview = {
										loading: false
									}
								});
							} else {
								if (!isUrl('http://' + $rootScope.lecture.url)) {
									//throw error
								}
							}
						};

						// stop enter key triggering DropzoneJS
						angular.element($window).on('keydown', function(e) {
							if (e.keyCode == 13) {
								e.preventDefault();
							}
						});

						$rootScope.removeCollaborator = function(user) {
							for (var tutor in $rootScope.selectedCollaborators) {
								if ($rootScope.selectedCollaborators[tutor] == user) {
									$rootScope.selectedCollaborators.splice(tutor, 1);
								}
							}
						};

						$rootScope.searchPossibleCollaborators = function(e) {
							// checking length to see if id has been sent through
							if (e.keyCode == 13 || e == 'Submit' || e._id) {
								// if name isn't on the list, break out of function
								if ($rootScope.possibleCollaborators.length == 0) {
									return;
								} else {
									// need to either get selected here, or select first
									if (!($rootScope.lecture.collaborator instanceof Object)) {
										if (e == 'Submit') {
											// gets index of child with active class from typeahead property
											$rootScope.lecture.collaborator = $rootScope.possibleCollaborators[angular.element(document.querySelector("[id*='typeahead']")).find('.active').index()];
										}
									}
								}

								// only add if we have a collaborator
								if ($rootScope.lecture.collaborator instanceof Object) {
									$rootScope.selectedCollaborators.push($rootScope.lecture.collaborator)
								}
								$rootScope.possibleCollaborators = [];
								$rootScope.lecture.collaborator = '';
							} else {
								Group.getPossibleCollabs({
									user: me._id,
									search: $rootScope.lecture.collaborator
								}).then(function(res) {
									// reset before continuing
									$rootScope.possibleCollaborators = [];
									// filter through possibleCollaborators here, check against already existing collaborators and only allow them to stay if they don't exist
									for (var x = 0; x < res.collaborators.length; x++) {
										var isIn = false;
										for (var y = 0; y < $rootScope.selectedCollaborators.length; y++) {
											if (res.collaborators[x]._id == $rootScope.selectedCollaborators[y]._id) {
												isIn = true;
											}
										}
										if (!isIn) {
											$rootScope.possibleCollaborators.push(res.collaborators[x]);
										}
									}
								});
							}

						};

						createModal = openModal({
							modal: {
								name: 'createrUserForm',
								dismissable: true,
								form: 'components/modal/views/lecture/create.html',
								title: 'Create Lecture',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										createModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: 'Create',
									click: function(e, form) {
										$rootScope.submitted = true;
										if ($rootScope.lecture.title && $rootScope.lecture.desc) {
											// setup vars to be sent across to API
											var collabs = [];
											// push each selected collaborator into array
											for (var i = 0; i < $rootScope.selectedCollaborators.length; i++) {
												collabs.push({
													user: $rootScope.selectedCollaborators[i]._id
												})
											}

											// set createdBy to the ID for model
											$rootScope.lecture.author = me._id;

											// remove this entry, and add the array collection
											delete $rootScope.lecture.collaborator;
											$rootScope.lecture.collaborators = collabs;

											$rootScope.res.received = false;

											Lecture.createLecture({
													data: $rootScope.lecture
												})
												.then(function(res) {
													createdLecture = res;

													$rootScope.dropzone[0].dropzone.options.url += createdLecture._id;

													if (!_.isEmpty($rootScope.dropzone[0].dropzone.getAcceptedFiles())) {
														$rootScope.dropzone[0].dropzone.processQueue();
													} else {
														// lecture created with no files, close the modal
														createModal.close(e);
													}
												})
												.catch(function(err) {
													$rootScope.errors = {};

													$rootScope.res.received = true;

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														//console.info(form[field]);
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-success', 'lg');

						$rootScope.uploadSuccess = function(response) {
							$rootScope.res.received = true;
							createModal.close();
						}

						createModal.result.then(function() {
							cb(createdLecture);
						});
					};
				},
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
													updateModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														//console.info(form[field]);
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-warning', null);

						updateModal.result.then(function() {
							cb(updatedUser);
						});
					};
				},
				group: function(cb) {
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
								title: 'Update Group',
								form: 'components/modal/views/group/update.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
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
													updateModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														//console.info(form[field]);
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-warning', null);

						updateModal.result.then(function() {
							cb(updatedUser);
						});
					};
				},
				lecture: function(cb) {
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
							updateModal, updatedLecture;
						var lecture = args.shift();
						$rootScope.updatedLecture = angular.copy(lecture);
						$rootScope.me = Auth.getCurrentUser();
						// $rootScope.lecture = {
						//   startTime: new Date(),
						//   endTime: new Date(new Date().getTime() + 60 * 60000),
						//   createdBy: $rootScope.me.name,
						//   qActAllowance: 10,
						// };
						// refresh validation on new modal open - remove details
						updateModal = openModal({
							modal: {
								name: 'updateLectureForm',
								dismissable: true,
								title: 'Update Lecture',
								form: 'components/modal/views/lecture/update.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-warning',
									text: 'Update',
									click: function() {
										$rootScope.submitted = true;
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
										// 				//console.info(form[field]);
										// 				form[field].$setValidity('mongoose', false);
										// 				$rootScope.errors[field] = error.message;
										// 			});
										// 		});
										// }
									}
								}]
							}
						}, 'modal-warning', 'lg');

						updateModal.result.then(function() {
							cb(updatedLecture);
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

						$rootScope.selectedGroups = [];

						$rootScope.updatedSession.startTime = moment.utc(session.startTime).format("DD/MM/YYYY HH:mm");
						$rootScope.updatedSession.endTime = moment.utc(session.endTime).format("DD/MM/YYYY HH:mm");


						for (var group in session.groups) {
							$rootScope.selectedGroups.push(session.groups[group].group)
						}

						console.info(session);

						updateModal = openModal({
							modal: {
								name: 'updateDeleteForm',
								dismissable: true,
								title: 'Update Session',
								form: 'components/modal/views/session/updateDelete.html',
								buttons: [{
									classes: 'btn-danger pull-left',
									text: 'Delete',
									click: function(e) {
										updateModal.dismiss(e);
									}
								}, {
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
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
													updateModal.close(e);
												})
												.catch(function(err) {
													$rootScope.errors = {};

													// Update validity of form fields that match the mongoose errors
													angular.forEach(err.errors, function(error, field) {
														//console.info(form[field]);
														form[field].$setValidity('mongoose', false);
														$rootScope.errors[field] = error.message;
													});
												});
										}
									}
								}]
							}
						}, 'modal-warning', 'md');

						updateModal.result.then(function() {
							cb(updatedUser);
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
									title: 'Warning',
									form: 'components/modal/views/user/cannot-delete.html',
									buttons: [{
										classes: 'btn-warning',
										text: 'OK',
										click: function(e) {
											deleteModal.close(e);
										}
									}]
								}
							}, 'modal-warning');

							deleteModal.result.then(function() {
								cb(null);
							});
						} else {
							deleteModal = openModal({
								modal: {
									name: 'deleteConf',
									dismissable: true,
									title: 'Confirm Delete',
									form: 'components/modal/views/user/delete.html',
									buttons: [{
										classes: 'btn-default',
										text: 'Cancel',
										click: function(e) {
											deleteModal.dismiss(e);
										}
									}, {
										classes: 'btn-danger',
										text: 'Delete',
										click: function(e) {
											deleteModal.close(e);
										}
									}]
								}
							}, 'modal-danger', null);

							deleteModal.result.then(function() {
								cb(user);
							});
						}
					};
				},
				group: function(cb) {
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
								title: 'Confirm Delete',
								form: 'components/modal/views/group/delete.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										deleteModal.dismiss(e);
									}
								}, {
									classes: 'btn-danger',
									text: 'Delete',
									click: function(e) {
										deleteModal.close(e);
									}
								}]
							}
						}, 'modal-danger', null);

						deleteModal.result.then(function() {
							cb(user);
						});
					};
				},
				lecture: function(cb) {
					cb = cb || angular.noop;
					/**
					 * Open a delete confirmation modal
					 * @param  {String} name   - name or info to show on modal
					 * @param  {All}           - any additional args are passed straight to del callback
					 */
					return function() {
						var args = Array.prototype.slice.call(arguments),
							lecture = args.shift(),
							deleteModal;

						$rootScope.lectureToDelete = angular.copy(lecture);
						deleteModal = openModal({
							modal: {
								name: 'deleteConf',
								dismissable: true,
								title: 'Confirm Delete',
								form: 'components/modal/views/lecture/delete.html',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										deleteModal.dismiss(e);
									}
								}, {
									classes: 'btn-danger',
									text: 'Delete',
									click: function(e) {
										deleteModal.close(e);
									}
								}]
							}
						}, 'modal-danger', null);

						deleteModal.result.then(function() {
							cb(lecture);
						});

					};
				}
			}
		};
	});