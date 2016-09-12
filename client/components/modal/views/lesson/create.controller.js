angular.module('UniQA')
	.controller('LessonCreateModalCtrl', function($scope, $window, Auth, Thing, Lesson, Modal) {
		var me = Auth.getCurrentUser();
		$scope.form = {
			lesson: {
				title: '',
				author: me._id,
				type: 'Select Type',
				url: '',
				tempPreview: '',
				desc: '',
				collaborator: '',
				files: []
			},
			possibleCollaborators: [],
			selectedCollaborators: []
		};
		$scope.lessonTypes = [];

		// get back types of lessons available
		Thing.getByName('lessonTypes').then(function(val) {
			$scope.lessonTypes = val.content;
		});

		$scope.lessonTypeDropdownSel = function(type) {
			if (type === 'URL') {
				$scope.lessonDescHeight = 150;
			} else {
				$scope.lessonDescHeight = 220;
				// reset url/prev vars
				$scope.lesson.url = '';
				$scope.lesson.tempPreview = '';
			}
			$scope.lesson.type = type;
		};

		// stop enter key triggering DropzoneJS
		angular.element($window).on('keydown', function(e) {
			if (e.keyCode === 13) {
				e.preventDefault();
			}
		});

		$scope.removeCollaborator = function(user) {
			for (var tutor in $scope.form.selectedCollaborators) {
				if ($scope.form.selectedCollaborators[tutor] === user) {
					$scope.form.selectedCollaborators.splice(tutor, 1);
				}
			}
		};

		$scope.searchPossibleCollaborators = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// if name isn't on the list, break out of function
				if ($scope.form.possibleCollaborators.length === 0) {
					return;
				} else {
					// need to either get selected here, or select first
					if (!($scope.lesson.collaborator instanceof Object)) {
						if (e === 'Submit') {
							// gets index of child with active class from typeahead property
							$scope.lesson.collaborator = $scope.form.possibleCollaborators[angular.element(document.querySelector('[id*=\'typeahead\']')).find('.active').index()];
						}
					}
				}

				// only add if we have a collaborator
				if ($scope.lesson.collaborator instanceof Object) {
					$scope.form.selectedCollaborators.push($scope.lesson.collaborator);
				}
				$scope.form.possibleCollaborators = [];
				$scope.lesson.collaborator = '';
			} else {
				Module.getPossibleCollabs({
					user: me._id,
					search: $scope.lesson.collaborator
				}).then(function(res) {
					// reset before continuing
					$scope.form.possibleCollaborators = [];
					// filter through form.possibleCollaborators here, check against already existing collaborators and only allow them to stay if they don't exist
					for (var x = 0; x < res.collaborators.length; x++) {
						var isIn = false;
						for (var y = 0; y < $scope.form.selectedCollaborators.length; y++) {
							if (res.collaborators[x]._id === $scope.form.selectedCollaborators[y]._id) {
								isIn = true;
							}
						}
						if (!isIn) {
							$scope.form.possibleCollaborators.push(res.collaborators[x]);
						}
					}
				});
			}

		};
	});