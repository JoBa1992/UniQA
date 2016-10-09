'use strict';

angular.module('UniQA')
	.controller('ModuleListCtrl', function($scope, $http, $location, Auth, Module, Modal) {
		$scope.currentNavItem = 'userMods';

		$scope.userModsLoaded = false;
		$scope.explorableModsLoaded = false;
		$scope.userModules = [];
		$scope.explorableModules = [];

		var currentUser = Auth.getCurrentUser;
		var isTutor = Auth.isTutor;

		Module.getMyAssocModules({
			user: currentUser()._id
		}).then(function(res) {
			$scope.userModsLoaded = true;
			if (res.modules && res.modules.length > 0) {
				attachModGroupsStudCount(res.modules);
				$scope.userModules = res.modules;
			} else {
				$scope.userModules = [];
			}
		}).catch(function(err) {
			console.info(err);
		});

		Module.getExplorableModules({
			user: currentUser()._id
		}).then(function(res) {
			$scope.explorableModsLoaded = true;
			if (res.modules && res.modules.length > 0) {
				attachModGroupsStudCount(res.modules);
				$scope.explorableModules = res.modules;
			} else {
				$scope.explorableModules = [];
			}
		}).catch(function(err) {
			console.info(err);
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

		$scope.openCreateModal = Modal.create.module(function(res, continuing) {
			if (continuing) {
				// TEMP: Attaching 0 group count to mod
				res.modGroupStudCount = 0;
				$scope.userModules.push(res);
				// need to sort user modules here
				// return $scope.openCreateModal();
			} else {
				return $location.path('/modules/' + res._id);
			}

		});
	});