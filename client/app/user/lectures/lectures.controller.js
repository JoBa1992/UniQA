'use strict';

angular.module('uniQaApp')
  .controller('LectureTutCtrl', function($scope, $http, Auth, Lecture, Modal) {

    $scope.cTime = new Date(); // get current date
    $scope.noQueryResults = false;

    $scope.myLectures = {};
    $scope.myLectureCount = 0;
    $scope.resultsPerPage = 10;
    $scope.currentPage = 1;
    $scope.totalPages = 8;

    var me = Auth.getCurrentUser();
    Lecture.getMyTotal({
      createdBy: me._id
    }).then(function(res) {
      $scope.myLectureCount = res.count == 0 ? 0 : res.count;
      $scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
    });

    $scope.refreshLectures = function(pageRequest) {
      if ($scope.currentPage > 1 && !pageRequest) {
        $scope.currentPage = 1;
      }
      Lecture.getForMe({
        createdBy: me._id,
        page: $scope.currentPage,
        paginate: $scope.resultsPerPage
      }).then(function(res) {
        // reset this once filters are used. Need to look at removing this object altogether
        if (res.count == 0) {
          //no results
          $scope.noQueryResults = true;
        } else {
          $scope.myLectures = res;
          //   console.info(res);
        }
      });
    };
    var refreshLectureStats = function() {
      Lecture.getMyTotal({
        createdBy: me._id
      }).then(function(res) {
        $scope.myLectureCount = res.count == 0 ? 0 : res.count;
        $scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
      });
    };

    $scope.changePaginationPage = function(page) {
      if (page != $scope.currentPage && page > 0 && page <= $scope.totalPages) {
        $scope.currentPage = page;
        $scope.refreshLectures(true);
      }
    };

    Lecture.getForMe({
      createdBy: me._id,
      page: $scope.currentPage,
      paginate: $scope.resultsPerPage
    }).then(function(res) {
      // reset this once filters are used. Need to look at removing this object altogether
      if (res.count == 0) {
        //no results
        $scope.noQueryResults = true;
      } else {
        $scope.myLectures = res;
        console.info(res);
      }
    });
    //
    // $scope.isDisabledDate = function(currentDate, mode) {
    //   return mode === 'day' && (currentDate.getDay() === 0 || currentDate.getDay() === 6);
    // };

    $scope.openCreateLectureModal = Modal.create.lecture(function(lecture) { // callback when modal is confirmed
      $scope.refreshLectures();
      refreshLectureStats();
    });
    $scope.openUpdateLectureModal = Modal.update.lecture(function(lecture) { // callback when modal is confirmed
      $scope.refreshLectures();
    });
    $scope.openDeleteLectureModal = Modal.delete.lecture(function(lecture) {
      // when modal is confirmed, callback
      if (lecture) {
        Lecture.remove({
          _id: lecture._id
        });
        $scope.refreshLectures();
        refreshLectureStats();
      }
    });

    $scope.editMinutes = function(datetime, minutes) {
      return new Date(datetime).getTime() + minutes * 60000;
    };
  });