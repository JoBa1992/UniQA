'use strict';

angular.module('uniQaApp')
	.controller('AdminGroupCtrl', function($scope, $http, Auth, Group, Modal) {
		$scope.title = 'Group Management';


		// Check for when query returns no groups
		$scope.isEmpty = function(obj) {
			//   console.info(obj);
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					return false;
				}
			}
			return true;
		};

		Group.get().then(function(res) {
			$scope.groups = res.groups;
			$scope.count = res.count;
			$scope.unassigned = res.unassigned;
		});

		//
		$scope.openCreateGroupModal = Modal.create.group(function(group) { // callback when modal is confirmed
			$scope.groups.push(group);
		});

		$scope.openUpdateGroupModal = Modal.update.group(function(group) { // callback when modal is confirmed
			//   $scope.refreshUserList();
		});

		$scope.openDeleteGroupModal = Modal.delete.group(function(group) {
			//   // when modal is confirmed, callback
			if (group) {
				Group.remove({
					id: group._id
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