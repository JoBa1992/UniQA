angular.module('UniQA')
	.controller('ModuleCreateModalCtrl', function($scope, $window, $q, $timeout, Auth, Thing, Module, Modal) {
		var pendingSearch, cancelSearch = angular.noop;
		var cachedQuery, lastSearch;

		var me = Auth.getCurrentUser();
		var isTutor = Auth.isTutor;

		$scope.form = {
			module: {
				code: '',
				name: '',
				tutor: ''
			},
			possibleTutors: loadTutors(),
			selectedTutors: []
		};

		var addUserToTutorListIfTutor = function() {
			if (isTutor()) {
				var contact = {
					user: me._id,
					role: 'tutor',
					fullName: me.forename + ' ' + me.surname,
					email: me.username.toLowerCase(),
					noDelete: true,
					image: '/assets/images/placeholders/profile.jpg'
				};
				contact._lowername = contact.fullName.toLowerCase();
				$scope.form.selectedTutors.push(contact);
			}
		}();

		loadTutors();

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
			return cachedQuery ? $scope.form.possibleTutors.filter(createFilterFor(cachedQuery)) : [];
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

		function loadTutors() {
			Module.getTutors({
				user: me._id,
				search: ''
			}).then(function(res) {
				$scope.form.possibleTutors = res.map(function(c, index) {
					var contact = {
						user: c._id,
						role: c.role,
						fullName: c.forename + ' ' + c.surname,
						email: c.username.toLowerCase(),
						image: '/assets/images/placeholders/profile.jpg'
					};
					contact._lowername = contact.fullName.toLowerCase();
					return contact;
				});
			}).catch(function(err) {
				$scope.form.possibleTutors = [];
			});
		}
	});