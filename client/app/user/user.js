'use strict';

angular.module('uniQaApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('groups', {
        url: '/my/groups',
        templateUrl: 'app/user/groups/groups.html',
        controller: 'GroupCtrl'
      })
      .state('lectures', {
        url: '/my/lectures',
        templateUrl: 'app/user/lectures/tutor/lectures.html',
        controller: 'LectureTutCtrl',
        authenticate: true
      })
      .state('questions', {
        url: '/my/questions',
        templateUrl: 'app/user/questions/tutor/questions.html',
        controller: 'QuestionCtrl',
        authenticate: true
      })
      .state('startLecture', {
        url: '/lecture/start',
        templateUrl: 'app/user/lectures/start/lectures.html',
        controller: 'LectureStartCtrl',
        authenticate: true
      });
  });