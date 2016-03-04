'use strict';

angular.module('uniQaApp')
	.factory('Modal', function($rootScope, $modal, Auth, Thing, Lecture) {

		// Use the User $resource to fetch all users
		$rootScope.user = {};
		$rootScope.errors = {};
		$rootScope.form = {};

		// Thing.getByName('accessCodeLen').then(function(val) {
		// 	// only returns one element
		// 	$rootScope.accessCodeLen = val.content[0];
		// });
		//
		// //
		// function genAccessCode(length) {
		// 	var key = '';
		// 	var randomchar = function() {
		// 		var num = Math.floor(Math.random() * 62);
		// 		if (num < 10) {
		// 			return num; //1-10
		// 		}
		// 		if (num < 36) {
		// 			return String.fromCharCode(num + 55); //A-Z
		// 		}
		// 		return String.fromCharCode(num + 61); //a-z
		// 	};
		// 	while (length--) {
		// 		key += randomchar();
		// 	}
		// 	return key;
		// }
		// //
		// function isAccessCodeUnique(key, callback) {
		// 	// ApiUser.find({
		// 	//     key: key
		// 	// }, function(err, authUser) {
		// 	//     // if authenticated user exists (find returns back an empty set,
		// 	//     // so check to see if it has any elements)
		// 	//     if (!authUser[0]) {
		// 	//         // if it does, go to next middleware
		// 	//         callback(true);
		// 	//         return true;
		// 	//     } else {
		// 	//         // if it doesn't, send back error
		// 	//         callback(false);
		// 	//     }
		// 	// });
		// 	callback(true);
		// }
		//
		// function createUniqueAccessCode() {
		// 	var accessCode = genAccessCode($rootScope.accessCodeLen);
		// 	isAccessCodeUnique(accessCode, function(unique) {
		// 		if (unique) {
		// 			$rootScope.user.passcode = accessCode;
		// 		} else {
		// 			createUniqueAccessCode();
		// 		}
		// 	});
		// }

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
					return function() {
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

						importModal = openModal({
							modal: {
								name: 'createrUserForm',
								dismissable: true,
								form: 'components/modal/views/user/import.html',
								title: 'Import Users',
								buttons: [{
									classes: 'btn-default',
									text: 'Cancel',
									click: function(e) {
										importModal.dismiss(e);
									}
								}, {
									classes: 'btn-success',
									text: '{{importBtnText}}',
									click: function(e, form) {
										// if first btn click, data has been dropped into zone

										// when importing via csv, data just needs to be attached into a json object, the user can then look through it and make any ammendments, and then when they click save the second time, it'll send it off to the server as a multiple creation.
										if (!$rootScope.importViewData) {
											$rootScope.importViewData = true;
											$rootScope.importBtnText = 'Save';
											console.info("Importing Data");
										} else {
											console.info("Ammending & Saving");
											importModal.dismiss(e);
										}



										// importModal.dismiss(e);
										// $rootScope.submitted = true;
										// // form.$setPristine();
										// // form.$setValidity();
										// // form.$setUntouched();
										// if ($rootScope.user.role !== 'Select Role' && $rootScope.user.department !== 'Select Department' && $rootScope.user.name && $rootScope.user.email && $rootScope.user.passcode) {
										//
										// 	Auth.createUser({
										// 			user: $rootScope.user
										// 		})
										// 		.then(function(res) {
										// 			createdUser = res.user;
										// 			// user created, close the modal
										// 			createModal.close(e);
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
						}, 'modal-success', 'lg');
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
						$rootScope.me = Auth.getCurrentUser();
						$rootScope.lecture = {
							startTime: new Date(),
							endTime: new Date(new Date().getTime() + 60 * 60000),
							createdBy: $rootScope.me.name,
							qActAllowance: 10,
						};
						// refresh validation on new modal open - remove details

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