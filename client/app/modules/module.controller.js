'use strict';

angular.module('UniQA')
	.controller('ModuleCtrl', function($scope, $stateParams, Auth, Module, Modal) {
		$scope.module = {};
		$scope.moduleLoaded = false;
		$scope.editState = false;

		var updateModule = function() {
			console.info("Updating Module");
		};

		Module.getByID($stateParams.moduleid).then(function(res) {
			$scope.module = res;
			$scope.moduleLoaded = true;
		});

		$scope.toggleEditState = function() {
			if ($scope.editState) {
				updateModule();
			}
			return $scope.editState = !$scope.editState;
		}

		$scope.openDeleteModal = Modal.delete.module(function(module) {
			// when modal is confirmed, callback
			if (module) {
				Module.remove({
					id: module._id
				}, function() {
					$location.path('/modules');
				});
			}
		});
	});