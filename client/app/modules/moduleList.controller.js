'use strict';

angular.module('UniQA')
	.controller('ModuleListCtrl', function($scope, $rootScope, $http, $location, Auth, Module, Modal) {
		$rootScope.pageHeadTitle = 'Module Mgr';
		$rootScope.showTopNav = true;
		$scope.noUserResults = false;
		$scope.noExplorableResults = false;

		var currentUser = Auth.getCurrentUser;

		Module.getMyAssocModules({
			user: currentUser()._id
		}).then(function(res) {
			if (res.modules && res.modules.length > 0) {
				$scope.noUserResults = false;
				attachModGroupsStudCount(res.modules);
				$scope.userModules = res.modules;
				$scope.userModCount = res.count;
			} else {
				$scope.noUserResults = true;
				console.info('no results for user returned');
			}
		}).catch(function(err) {
			console.info(err);
		});

		Module.getExplorableModules({
			user: currentUser()._id
		}).then(function(res) {
			if (res.modules && res.modules.length > 0) {
				$scope.noExplorableResults = false;
				attachModGroupsStudCount(res.modules);
				$scope.explorableModules = res.modules;
				$scope.explorModCount = res.count;
			} else {
				$scope.noExplorableResults = true;
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

		$rootScope.openCreateModal = Modal.create.module(function(createModule, continuing) {
			if (continuing) {
				$scope.userModules.push(createModule);
				return $scope.openCreateModal();
			} else {
				return $location.path('/modules/' + createModule._id);
			}

		});
	});