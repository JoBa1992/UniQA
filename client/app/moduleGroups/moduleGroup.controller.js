'use strict';

angular.module('UniQA')
	.controller('ModuleGroupCtrl', function($scope, $http, $location, Auth, Module, Modal) {
		$scope.title = 'Module Management';
		$scope.moduleOption = 'User';
		var currentUser = Auth.getCurrentUser;

		console.info(currentUser()._id);
		Module.getMyAssocModules({
			user: currentUser()._id
		}).then(function(res) {
			$scope.userModules = res.modules;
			$scope.userModCount = res.count;
		});

		Module.getExplorableModules({
			user: currentUser()._id
		}).then(function(res) {
			$scope.explorableModules = res.modules;
			$scope.explorModCount = res.count;
		});

		$scope.routeToModuleChild = function(id) {
			$location.path('/modules/' + id);
		};

		$scope.isModuleOptionActive = function(param) {
			if ($scope.moduleOption === param) {
				return true;
			}
			return false;
		};

		$scope.changeModuleSubNav = function(newVal) {
			$scope.moduleOption = newVal;
		};

		$scope.openCreateModal = Modal.create.module(function(createModule, continuing) {
			if (continuing) {
				$scope.userModules.push(createModule);
				return $scope.openCreateModal();
			} else {
				return $location.path('/modules/' + createModule._id);
			}

		});
	});