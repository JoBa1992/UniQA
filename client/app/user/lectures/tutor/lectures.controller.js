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

    $scope.refreshLectures = function() {
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
        }
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
      }
    });
    $scope.isDisabledDate = function(currentDate, mode) {
      return mode === 'day' && (currentDate.getDay() === 0 || currentDate.getDay() === 6);
    };
    $scope.openCreateLectureModal = Modal.create.lecture(function(lecture) { // callback when modal is confirmed
      $scope.refreshLectures();
    });
    // $scope.openUpdateLectureModal = Modal.update.lecture(function(lecture) { // callback when modal is confirmed
    //   $scope.refreshLectures();
    // });
    // $scope.openDeleteLectureModal = Modal.delete.lecture(function(lecture) {
    //   // when modal is confirmed, callback
    //   if (lecture) {
    //     // Lecture.remove({
    //     //   id: lecture._id
    //     // });
    //     $scope.refreshLectures();
    //   }
    // });

    $scope.editMinutes = function(datetime, minutes) {
      return convertToDate(datetime).getTime() + minutes * 60000;
    };
  });
//
// function calculateAge(dob) {
//   var userDOB = new Date(dob),
//     now = new Date();
//   var years = now.getFullYear() - userDOB.getFullYear();
//   userDOB.setFullYear(userDOB.getFullYear() + years);
//   if (userDOB > now) {
//     years--;
//     userDOB.setFullYear(userDOB.getFullYear() - 1);
//   }
//   var days = (now.getTime() - userDOB.getTime()) / (3600 * 24 * 1000);
//   return Math.floor(years + days / (isLeapYear(now.getFullYear()) ? 366 : 365));
// }
//
// function isLeapYear(year) {
//   var date = new Date(year, 1, 28);
//   date.setDate(date.getDate() + 1);
//   return date.getMonth() == 1;
// }


function convertToDate(dateTime) {
  if (dateTime) {
    dateTime = String(dateTime).split(" ");
    var date = dateTime[0];
    date = date.split("/");
    dateTime = dateTime[1];
    dateTime = dateTime.split(":");
    var d = date[0],
      mn = date[1] - 1,
      y = date[2];
    var h = dateTime[0],
      m = dateTime[1];
    return new Date(Date.UTC(y, mn, d, h, m));
  }
  return null;
};
// function isValidDOB(dob){
//     var now = new Date();
//     return dob < now ? true : false;
// }