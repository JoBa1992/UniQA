angular.module('UniQA')
	.controller('LessonCreateModalCtrl', function($scope, $window, $q, $timeout, Auth, Thing, Module, Modal) {
		var pendingSearch, cancelSearch = angular.noop;
		var cachedQuery, lastSearch;

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
			possibleCollaborators: loadContacts(),
			selectedCollaborators: []
		};
		loadContacts();
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

		var debounceSearch = function() {
			var now = new Date().getMilliseconds();
			$scope.lastSearch = $scope.lastSearch || now;

			return ((now - $scope.lastSearch) < 300);
		};

		/**
		 * Create filter function for a query string
		 */
		function createFilterFor(query) {
			var lowercaseQuery = angular.lowercase(query);

			return function filterFn(contact) {
				return (contact._lowername.indexOf(lowercaseQuery) != -1);;
			};

		}

		function refreshDebounce() {
			lastSearch = 0;
			pendingSearch = null;
			cancelSearch = angular.noop;
		}

		$scope.querySearch = function(criteria) {
			cachedQuery = cachedQuery || criteria;
			return cachedQuery ? $scope.form.possibleCollaborators.filter(createFilterFor(cachedQuery)) : [];
		}

		$scope.delayedQuerySearch = function(criteria) {
			cachedQuery = criteria;
			if (!pendingSearch || !debounceSearch()) {
				cancelSearch();

				return pendingSearch = $q(function(resolve, reject) {
					// Simulate async search... (after debouncing)
					cancelSearch = reject;
					$timeout(function() {

						resolve($scope.querySearch());

						refreshDebounce();
					}, Math.random() * 500, true)
				});
			}

			return pendingSearch;
		}

		function loadContacts() {
			Module.getTutors({
				user: me._id,
				search: ''
			}).then(function(res) {
				$scope.form.possibleCollaborators = res.map(function(c, index) {
					var contact = {
						_id: c._id,
						role: c.role,
						fullName: c.forename + ' ' + c.surname,
						email: c.username.toLowerCase(),
						image: '/assets/images/placeholders/profile.jpg'
					};
					contact._lowername = contact.fullName.toLowerCase();
					return contact;
				});
			}).catch(function(err) {
				$scope.form.possibleCollaborators = [];
			});
		}
	});