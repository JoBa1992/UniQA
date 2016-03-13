'use strict';

angular.module('uniQaApp')
	.factory('Modal', function($rootScope, $modal, $parse, Auth, Thing, Group, Lecture, Session) {

		// Use the User $resource to fetch all users
		$rootScope.user = {};
		$rootScope.errors = {};
		$rootScope.form = {};

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
											readModal.dismiss(e);
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
					var session = args.shift();
					return function() {
						var readModal;

						Session.getOne(session).then(function(res) {
							var lecture = res.lecture._id;
							Lecture.getOne(lecture).then(function(res) {
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
												readModal.dismiss(e);
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
						var session = args.shift();

						console.info(session);

						var readModal;
						var me = Auth.getCurrentUser();

						Lecture.getForMe({
							createdBy: me._id,
							page: 1,
							paginate: 10
						}).then(function(res) {
							$rootScope.lecture = res[0]; // need to elaborate on this
							readModal = openModal({
								modal: {
									name: 'createrUserForm',
									dismissable: true,
									form: 'components/modal/views/feedback/read.html',
									title: 'Feedback',
									buttons: [{
										classes: 'btn-primary',
										text: 'Dismiss',
										click: function(e) {
											readModal.dismiss(e);
										}
									}]
								}
							}, 'modal-primary', 'lg');
						});
					};
				},
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
												console.info("Importing Data");
											} else {
												console.info("Ammending & Saving");
												Auth.createUsers({
														users: $rootScope.importUsers
													})
													.then(function(res) {
														importModal.close(e);
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
							type: '',
							url: '',
							preview: '',
							desc: '',
							collaborators: [],
							files: []
						};
						$rootScope.preview = {
							loading: false
						}
						$rootScope.lectureTypes = [];
						$rootScope.lectureDescHeight = 220;

						// get back types of lectures available
						Thing.getByName('lectureTypes').then(function(val) {
							val.content.unshift("Select Type");
							$rootScope.lectureTypes = val.content;
							// set first value
							$rootScope.lecture.type = val.content[0];
						});

						$rootScope.lectureTypeDropdownSel = function(type) {
							if (type === 'URL') {
								$rootScope.lectureDescHeight = 150;
							} else {
								$rootScope.lectureDescHeight = 220;
								// reset url/prev vars
								$rootScope.lecture.url = '';
								$rootScope.lecture.preview = '';
							}
							$rootScope.lecture.type = type;
						};

						$rootScope.genPreview = function() {

							// if http is present, rip it out, server adds it
							if ($rootScope.lecture.url.indexOf('http://') > -1) {
								// take anything after http
								$rootScope.lecture.url = $rootScope.lecture.url.split('http://')[1];
							}
							if ($rootScope.lecture.url) {
								$rootScope.preview.loading = true;

								Lecture.generatePreview({
									url: $rootScope.lecture.url
								}).then(function(res) {
									// only returns one element
									if (_.isEmpty(res)) {
										$rootScope.lecture.preview = {
											err: true
										}
									}
									// attach with base64 tag
									$rootScope.lecture.preview = 'data:image/png;base64,' + res;
									$rootScope.preview = {
										loading: false
									}
								});
							}
						};

						$rootScope.searchPossibleCollaborators = function() {
							Group.getPossibleCollabs({
								user: me._id
							}).then(function(res) {
								console.info(res);
							});
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
										// form.$setPristine();
										// form.$setValidity();
										// form.$setUntouched();
										if ($rootScope.lecture.name && $rootScope.lecture.desc) {
											// set createdBy to the ID for model
											$rootScope.lecture.createdBy = $rootScope.me._id;
											Lecture.createLecture({
													lecture: $rootScope.lecture
												})
												.then(function(res) {
													createdLecture = res.lecture;
													// lecture created, close the modal
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
						}, 'modal-success', 'lg');

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