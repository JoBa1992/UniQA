/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

Thing.find({}).remove(function() {
  Thing.create({
    name: 'uniName',
    content: 'Sheffield Hallam'
  }, {
    name: 'uniEmail',
    content: '@shu.ac.uk'
  }, {
    name: 'uniDepartments',
    content: {
      'Admin': ['Admin'],
      'Development and Society': ['Natural and Built Environment', 'SIOE', 'Psychology, Sociology and Politics', 'Humanities', 'Law and Criminology', 'TESOL Centre'],
      'ACES': ['Computing', 'Engineering and Mathematics', 'SIA', 'Media Arts and Communication'],
      'Health and Wellbeing': ['Allied Health Professions', 'Biosciences', 'Nursing and Midwifery', 'Sport and Physical Activity Academy', 'Social Work and Social Care'],
      'Business': ['Finance, Accounting and Business Systems', 'Management', 'Service Sector Management'],
    }
  }, {
    name: 'userRoles',
    content: ['admin', 'tutor', 'student']
  }, {
    name: 'accessCodeLen',
    content: 10
  });
});

User.find({}).remove(function() {
  User.create({
    role: 'admin',
    name: 'JoBa',
    email: 'JoBa@uniqa.co.uk',
    password: 'Josh1992',
    department: 'Admin'
  }, {
    role: 'tutor',
    name: 'Test Teacher',
    email: 'teacher@shu.ac.uk',
    password: 'tutor',
    department: 'Computing'
  }, {
    name: 'Test Student',
    role: 'student',
    email: 'student@shu.ac.uk',
    password: 'student',
    department: 'Humanities'
  }, {
    name: 'JD',
    role: 'student',
    email: 'jd@shu.ac.uk',
    password: 'jd',
    department: 'SIA'
  }, {
    name: 'Jack McGlone',
    role: 'student',
    email: 'jack.mcblown@shu.ac.uk',
    password: 'mcblown',
    department: 'Media Arts and Communication'
  }, {
    name: 'Chode Skimpson',
    role: 'student',
    email: 'chad.simpson@shu.ac.uk',
    password: 'Chode',
    department: 'Nursing and Midwifery'
  }, function() {
    console.log('finished populating users');
  }
  );
});
