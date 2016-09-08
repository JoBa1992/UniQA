'use strict';

angular.module('uniQaApp')
	.controller('ModuleListCtrl', function($scope, $http, $location, Auth, Module, Modal) {
		$scope.title = 'Module Management';
		$scope.moduleOption = 'User';
		var currentUser = Auth.getCurrentUser;

		Module.getMyAssocModules({
			user: currentUser()._id
		}).then(function(res) {
			attachModGroupsStudCount(res.modules);
			$scope.userModules = res.modules;
			$scope.userModCount = res.count;
		});

		Module.getExplorableModules({
			user: currentUser()._id
		}).then(function(res) {
			attachModGroupsStudCount(res.modules);
			$scope.explorableModules = res.modules;
			$scope.explorModCount = res.count;
		});

		// attaches module group count by ref
		var attachModGroupsStudCount = function(modules) {
			for (var x = 0; x < modules.length; x++) {
				var modGroupStudCount = 0;
				for (var y = 0; y < modules[x].groups.length; y++) {
					modGroupStudCount += modules[x].groups[y].group.students.length;
				}
				modules[x].groupStudCount = modGroupStudCount;
			}
		}

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