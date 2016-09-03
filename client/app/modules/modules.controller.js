'use strict';

angular.module('uniQaApp')
	.controller('ModulesCtrl', function($scope, $http, $location, Auth, Module, Modal) {
		$scope.title = 'Module Management';


		// Check for when query returns no modules
		$scope.isEmpty = function(obj) {
			//   console.info(obj);
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					return false;
				}
			}
			return true;
		};

		Module.get().then(function(res) {
			$scope.modules = res.modules;
			$scope.count = res.count;
			console.info(res);
		});

		$scope.routeToModuleChild = function(id) {
			$location.path('/modules/' + id);
		};
		$scope.openCreateModal = Modal.create.module(function() {

		});

		// 	// opens correct model according to last result
		// 	if (optionResult === 'import') {
		// 		Modal.import.module(function() {})();
		// 	} else if (optionResult === 'manual') {
		//
		// 	}
		// });

		$scope.openUpdateModal = Modal.update.module(function() { // callback when modal is confirmed
			//   $scope.refreshUserList();
		});

		$scope.openImportModal = Modal.import.module(function() { // callback when modal is confirmed
			// refreshUserStats();
			// $scope.refreshUserList();
		});

		$scope.openDeleteModal = Modal.delete.module(function(module) {
			//   // when modal is confirmed, callback
			if (module) {
				Module.remove({
					id: module._id
				});
			}

			//   //     // this no longer works for $scope.users... it doesn't splice off the one - check it out
			//   //     // angular.forEach($scope.users, function(u, i) {
			//   //     //   console.info("does " + u + " == " + user);
			//   //     //   if (u === user) {
			//   //     //     $scope.users.splice(i, 1);
			//   //     //   }
			//   //     // });
			//   //     refreshUserStats();
			//   //     $scope.users = User.query(); // bodge for foreach not working
			//   //     $scope.refreshUserList();
			//   //   }
			// });
		});
	});