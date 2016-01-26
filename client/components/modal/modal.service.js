'use strict';

angular.module('uniQaApp')
  .factory('Modal', function($rootScope, $modal, Auth, Department, Thing, Lecture) {

    // Use the User $resource to fetch all users
    $rootScope.user = {};
    $rootScope.errors = {};
    $rootScope.form = {};

    Thing.getByName("accessCodeLen").then(function(val) {
      // only returns one element
      $rootScope.accessCodeLen = val.content[0];
    });

    //
    function genAccessCode(length) {
      var key = '';
      var randomchar = function() {
        var num = Math.floor(Math.random() * 62);
        if (num < 10)
          return num; //1-10
        if (num < 36)
          return String.fromCharCode(num + 55); //A-Z
        return String.fromCharCode(num + 61); //a-z
      };
      while (length--) {
        key += randomchar();
      }
      return key;
    }
    //
    function isAccessCodeUnique(key, callback) {
      // ApiUser.find({
      //     key: key
      // }, function(err, authUser) {
      //     // if authenticated user exists (find returns back an empty set,
      //     // so check to see if it has any elements)
      //     if (!authUser[0]) {
      //         // if it does, go to next middleware
      //         callback(true);
      //         return true;
      //     } else {
      //         // if it doesn't, send back error
      //         callback(false);
      //     }
      // });
      callback(true);
    }
    //
    function createUniqueAccessCode(callback) {
      var accessCode = genAccessCode($rootScope.accessCodeLen);
      isAccessCodeUnique(accessCode, function(unique) {
        if (unique) {
          $rootScope.user.passcode = accessCode;
        } else {
          createUniqueAccessCode();
        }
      });
    }

    $rootScope.genNewQR = function(updatedLecture) {
      console.log("boomtown");
    }

    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass, modalSize) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';
      modalSize = modalSize || 'md';


      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope,
        size: modalSize
      });
    }

    // Public API here
    return {
      create: {
        user: function(cb) {
          cb = cb || angular.noop;
          return function() {
            var args = Array.prototype.slice.call(arguments),
              createModal, createdUser;
            // refresh validation on new modal open - remove details
            $rootScope.user = {
              name: "",
              email: ""
            };
            $rootScope.roles = {};
            $rootScope.departments = {};

            $rootScope.depDropdownSel = function(target) {
              $rootScope.user.department = target;
            };
            $rootScope.userRoleDropdownSel = function(target) {
              $rootScope.user.role = target;
            };

            // use the Thing service to return back some constants
            Thing.getByName("userRoles").then(function(val) {
              $rootScope.roles = val.content;
              $rootScope.user.role = 'Select Role';
            });
            Department.get().then(function(val) {
              // loop through, and create key pairs to pass on scope variable
              /*
              val.forEach(function(dep) {
				var subs = [];
				dep.subdepartment.forEach(function(subdep) {
				  subs.push(subdep.name);
				});
				$rootScope.departments[dep.name] = subs;
              });
              */
              val.forEach(function(dep) {
                var subs = [];
                dep.subdepartment.forEach(function(subdep) {
                  subs.push(subdep.name);
                });
                $rootScope.departments[dep.name] = subs;
              });
              // add to start of array
              $rootScope.user.department = 'Select Department';
            });

            Thing.getByName("uniEmail").then(function(val) {
              // add Any to start of array
              $rootScope.uniEmail = val.content[0];
            });

            // creates a unique access code everytime the modal is opened.
            createUniqueAccessCode();
            createModal = openModal({
              modal: {
                name: "createrUserForm",
                dismissable: true,
                title: 'Create User',
                form: '<div class="form-group" ng-class="{ \'has-success\': form.name.$valid && submitted,\'has-error\': form.name.$invalid && submitted }">' +
                  '<label>Name</label>' +
                  '<input type="text" name="name" class="form-control" ng-model="user.name" required/>' +
                  '<p class="help-block" ng-show="form.name.$error.required && submitted">A name is required</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': user.role!=\'Select Role\' && submitted,\'has-error\': user.role==\'Select Role\' && submitted }">' +
                  '<label>Account Type</label>' +
                  '<div class="dropdown reg-dropdown">' +
                  '<button class="btn btn-inverse dropdown-toggle form-control" style="text-transform: capitalize;" name="type" ng-model="roles" type="button" data-toggle="dropdown">{{user.role}}' +
                  '<span class="caret"></span>' +
                  '</button>' +
                  '<ul class="dropdown-menu"> ' +
                  '<li>' +
                  '<a ng-repeat="roles in roles" ng-click="userRoleDropdownSel(roles)" style="text-transform: capitalize;">{{roles}}</a>' +
                  '</li>' +
                  '</ul>' +
                  '</div>' +
                  '<p class="help-block" ng-show="user.role==\'Select Role\' && submitted">Please select a user type</p>' +
                  '<p class="help-block" ng-show="form.roles.$error.mongoose">{{ errors.roles }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': user.department!=\'Select Department\' && submitted,\'has-error\': user.department==\'Select Department\' && submitted }">' +
                  '<label>Department</label>' +
                  '<div class="dropdown reg-dropdown">' +
                  '<button class="btn btn-inverse dropdown-toggle form-control" name="department" type="button" data-toggle="dropdown">{{user.department}}<span class="caret"></span></button>' +
                  '<ul class="dropdown-menu scrollable-menu" role="menu">' +
                  '<li ng-repeat="(key,val) in departments">' +
                  '<a class="dropdown-header disabled dropdown-header-custom" ng-click="$event.preventDefault()">{{key}}</a>' +
                  '<a ng-repeat="subVals in departments[key]" ng-click="depDropdownSel(subVals)">{{departments[key][$index]}}</a>' +
                  '</li>' +
                  '</ul>' +
                  '</div>' +
                  '<p class="help-block" ng-show="user.department==\'Select Department\' && submitted">Please select a department</p>' +
                  '<p class="help-block" ng-show="form.user.department.$error.mongoose">{{ errors.user.department }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': form.email.$valid && submitted,\'has-error\': form.email.$invalid && submitted }">' +
                  '<label>Email</label>' +
                  '<div class="input-group">' +
                  '<input type="text" name="email" class="form-control" aria-describedby="basic-addon2" ng-model="user.email" required mongoose-error>' +
                  '<span class="input-group-addon" id="basic-addon2">{{uniEmail}}</span>' +
                  '</div>' +
                  '<p class="help-block" ng-show="form.email.$error.email && submitted">Email address provided does not match the department format</p>' +
                  '<p class="help-block" ng-show="form.email.$error.required && submitted">Please enter your email address</p>' +
                  '<p class="help-block" name="emailVal" ng-show="form.email.$error.mongoose">{{ errors.email }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': form.passcode.$valid && submitted,\'has-error\': form.passcode.$invalid && submitted }">' +
                  '<label>Access Code</label>' +
                  '<input type="passcode" name="passcode" class="form-control" ng-model="user.passcode" value="{{user.passcode}}" maxlength=10 required readonly mongoose-error/>' +
                  '<p class="help-block" ng-show="(form.passcode.$error.minlength || form.passcode.$error.required) && submitted">Passcodes are 10 characters long.</p>' +
                  '<p class="help-block" ng-show="form.passcode.$error.mongoose">{{ errors.passcode }}</p>' +
                  '</div>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    createModal.dismiss(e);
                  }
                }, {
                  classes: 'btn-success',
                  text: 'Create',
                  click: function(e, form) {
                    $rootScope.submitted = true;
                    // form.$setPristine();
                    // form.$setValidity();
                    // form.$setUntouched();
                    if ($rootScope.user.role != "Select Role" && $rootScope.user.department != "Select Department" && $rootScope.user.name && $rootScope.user.email && $rootScope.user.passcode) {

                      Auth.createUser({
                          user: $rootScope.user
                        })
                        .then(function(res) {
                          createdUser = res.user;
                          // user created, close the modal
                          createModal.close(e);
                        })
                        .catch(function(err) {
                          $rootScope.errors = {};

                          // Update validity of form fields that match the mongoose errors
                          angular.forEach(err.errors, function(error, field) {
                            //console.info(form[field]);
                            form[field].$setValidity('mongoose', false);
                            $rootScope.errors[field] = error.message;
                          });
                        });
                    }
                  }
                }]
              }
            }, 'modal-success');

            createModal.result.then(function(event) {
              cb(createdUser);
            });
          };
        },
        lecture: function(cb) {
          cb = cb || angular.noop;
          return function() {
            var args = Array.prototype.slice.call(arguments),
              createModal, createdLecture;
            $rootScope.me = Auth.getCurrentUser();
            $rootScope.lecture = {
              startTime: new Date(),
              endTime: new Date(new Date().getTime() + 60 * 60000),
              createdBy: $rootScope.me.name,
              qActAllowance: 10,
            };
            // refresh validation on new modal open - remove details

            createModal = openModal({
              modal: {
                name: "createrUserForm",
                size: "lg",
                dismissable: true,
                title: 'Create Lecture',
                form: '<div class="container-fluid">' +
                  '<div class="row">' +
                  '<div class="form-group col-xs-8 col-sm-6 col-md-3 col-lg-3 col-xs-offset-2 col-sm-offset-3 col-md-offset-0 col-lg-offset-0 pull-left">' +
                  '<img src="assets/images/placeholders/uniqa-qr.png" style="border:2px solid #343D48;border-radius:2px;width:100%;" alt="QR Example" class="img-responsive"/>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.name.$valid && submitted,\'has-error\': form.name.$invalid && submitted }">' +
                  '<label>Lecture Name</label>' +
                  '<input type="text" name="name" class="form-control" ng-model="lecture.name" required mongoose-error>' +
                  '<p class="help-block" ng-show="form.name.$error.required && submitted">Lecture must have a name</p>' +
                  '<p class="help-block" name="nameVal" ng-show="form.name.$error.mongoose">{{ errors.name }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.desc.$valid && submitted,\'has-error\': form.desc.$invalid && submitted }">' +
                  '<label>Lecture Description</label>' +
                  '<textarea class="form-control" name="desc" rows="2" ng-model="lecture.desc" style="max-height:100px;" required mongoose-error></textarea>' +
                  '<p class="help-block" ng-show="form.desc.$error.required && submitted">Lecture must have a description</p>' +
                  '<p class="help-block" name="descVal" ng-show="form.desc.$error.mongoose">{{ errors.desc }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.createdBy.$valid && submitted,\'has-error\': form.createdBy.$invalid && submitted }">' +
                  '<label>Created By</label>' +
                  '<input type="text" name="createdBy" class="form-control" ng-model="lecture.createdBy" disabled required mongoose-error>' +
                  '<p class="help-block" ng-show="form.createdBy.$error.required && submitted">Something was not right there.</p>' +
                  '<p class="help-block" name="createdByVal" ng-show="form.createdBy.$error.mongoose">{{ errors.createdBy }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.startTime.$valid && submitted,\'has-error\': form.startTime.$invalid && submitted }">' +
                  '<label>Start Time</label>' +
                  '<div class="dropdown">' +
                  '<div class="input-group">' +
                  '<input type="text" class="form-control" data-ng-model="lecture.startTime">' +
                  '<span class="input-group-addon">' +
                  '<i class="glyphicon glyphicon-calendar"></i>' +
                  '</span>' +
                  '</div>' +
                  '</div>' +
                  '<p class="help-block" ng-show="form.startTime.$error.startTime && submitted">Add some validation here</p>' +
                  '<p class="help-block" ng-show="form.startTime.$error.required && submitted">Add some validation here</p>' +
                  '<p class="help-block" name="startTimeVal" ng-show="form.startTime.$error.mongoose">{{ errors.startTime }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.endTime.$valid && submitted,\'has-error\': form.endTime.$invalid && submitted }">' +
                  '<label>End Time</label>' +
                  '<div class="dropdown">' +
                  '<div class="input-group">' +
                  '<input type="text" class="form-control" data-ng-model="lecture.endTime">' +
                  '<span class="input-group-addon">' +
                  '<i class="glyphicon glyphicon-calendar"></i>' +
                  '</span>' +
                  '</div>' +
                  '</div>' +
                  '<p class="help-block" ng-show="form.endTime.$error.endTime && submitted">Add some validation here</p>' +
                  '<p class="help-block" ng-show="form.endTime.$error.required && submitted">Add some validation here</p>' +
                  '<p class="help-block" name="endTimeVal" ng-show="form.endTime.$error.mongoose">{{ errors.endTime }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.qActAllowance.$valid && submitted,\'has-error\': (form.qActAllowance.$invalid && submitted) || (form.qActAllowance < 0) || (form.qActAllowance > 60) }">' +
                  '<label>Question Time Allowance Variation</label>' +
                  '<input type="number" name="qActAllowance" class="form-control" step="5" ng-model="lecture.qActAllowance" value="{{user.qActAllowance}}" max="60" min="0" required mongoose-error/>' +
                  '<p class="help-block" ng-show="(form.qActAllowance.$error.minlength || form.qActAllowance.$error.required) && (form.qActAllowance < 0) || (form.qActAllowance > 60) && submitted">Must be between 0 and 60</p>' +
                  '<p class="help-block" ng-show="form.qActAllowance.$error.mongoose">{{ errors.qActAllowance }}</p>' +
                  '</div>' +
                  '</div>' +
                  '</div>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    createModal.dismiss(e);
                  }
                }, {
                  classes: 'btn-success',
                  text: 'Create',
                  click: function(e, form) {
                    $rootScope.submitted = true;
                    // form.$setPristine();
                    // form.$setValidity();
                    // form.$setUntouched();
                    if ($rootScope.lecture.name && $rootScope.lecture.desc) {
                      // set createdBy to the ID for model
                      $rootScope.lecture.createdBy = $rootScope.me._id;
                      Lecture.createLecture({
                          lecture: $rootScope.lecture
                        })
                        .then(function(res) {
                          createdLecture = res.lecture;
                          // lecture created, close the modal
                          createModal.close(e);
                        })
                        .catch(function(err) {
                          $rootScope.errors = {};

                          // Update validity of form fields that match the mongoose errors
                          angular.forEach(err.errors, function(error, field) {
                            //console.info(form[field]);
                            form[field].$setValidity('mongoose', false);
                            $rootScope.errors[field] = error.message;
                          });
                        });
                    }
                  }
                }]
              }
            }, 'modal-success', 'lg');

            createModal.result.then(function(event) {
              cb(createdLecture);
            });
          };
        },
      },
      update: {
        user: function(cb) {
          cb = cb || angular.noop;
          return function() {
            var args = Array.prototype.slice.call(arguments),
              updateModal, updatedUser;
            var user = args.shift();
            // refresh validation on new modal open - remove details
            $rootScope.roles = {};
            $rootScope.departments = {};
            $rootScope.updatedUser = angular.copy(user);

            $rootScope.depDropdownSel = function(target) {
              $rootScope.updatedUser.department = target;
            };
            $rootScope.userRoleDropdownSel = function(target) {
              $rootScope.updatedUser.role = target;
            };

            // use the Thing service to return back some constants
            Thing.getByName("userRoles").then(function(val) {
              $rootScope.roles = val.content;
            });
            Department.get().then(function(val) {
              // loop through, and create key pairs to pass on scope variable
              val.forEach(function(dep) {
                var subs = [];
                dep.subdepartment.forEach(function(subdep) {
                  subs.push(subdep.name);
                });
                $rootScope.departments[dep.name] = subs;
              });

              // add to start of array
              $rootScope.updatedUser.department = user.department;
            });

            Thing.getByName("uniEmail").then(function(val) {
              // add Any to start of array
              $rootScope.uniEmail = val.content[0];
              // remove uniEmail standard from users Email
              $rootScope.userTempEmail = $rootScope.updatedUser.email.split(val.content[0])[0];
            });


            updateModal = openModal({
              modal: {
                name: "updateUserForm",
                dismissable: true,
                title: 'Update User',
                form: '<div class="form-group" ng-class="{ \'has-success\': form.name.$valid && submitted,\'has-error\': form.name.$invalid && submitted }">' +
                  '<label>Name</label>' +
                  '<input type="text" name="name" class="form-control" ng-model="updatedUser.name" required/>' +
                  '<p class="help-block" ng-show="form.name.$error.required && submitted">A name is required</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': updatedUser.role!=\'Select Role\' && submitted,\'has-error\': updatedUser.role==\'Select Role\' && submitted }">' +
                  '<label>Account Type</label>' +
                  '<div class="dropdown reg-dropdown">' +
                  '<button class="btn btn-inverse dropdown-toggle form-control" style="text-transform: capitalize;" name="type" ng-model="roles" type="button" data-toggle="dropdown">{{updatedUser.role}}' +
                  '<span class="caret"></span>' +
                  '</button>' +
                  '<ul class="dropdown-menu"> ' +
                  '<li>' +
                  '<a ng-repeat="roles in roles" ng-click="userRoleDropdownSel(roles)" style="text-transform: capitalize;">{{roles}}</a>' +
                  '</li>' +
                  '</ul>' +
                  '</div>' +
                  '<p class="help-block" ng-show="updatedUser.role==\'Select Role\' && submitted">Please select a user type</p>' +
                  '<p class="help-block" ng-show="form.roles.$error.mongoose">{{ errors.roles }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': updatedUser.department!=\'Select Department\' && submitted,\'has-error\': updatedUser.department==\'Select Department\' && submitted }">' +
                  '<label>Department</label>' +
                  '<div class="dropdown reg-dropdown">' +
                  '<button class="btn btn-inverse dropdown-toggle form-control" name="department" type="button" data-toggle="dropdown">{{updatedUser.department}}<span class="caret"></span></button>' +
                  '<ul class="dropdown-menu scrollable-menu" role="menu">' +
                  '<li ng-repeat="(key,val) in departments">' +
                  '<a class="dropdown-header disabled dropdown-header-custom" ng-click="$event.preventDefault()">{{key}}</a>' +
                  '<a ng-repeat="subVals in departments[key]" ng-click="depDropdownSel(subVals)">{{departments[key][$index]}}</a>' +
                  '</li>' +
                  '</ul>' +
                  '</div>' +
                  '<p class="help-block" ng-show="updatedUser.department==\'Select Department\' && submitted">Please select a department</p>' +
                  '<p class="help-block" ng-show="form.updatedUser.department.$error.mongoose">{{ errors.updatedUser.department }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': form.email.$valid && submitted,\'has-error\': form.email.$invalid && submitted }">' +
                  '<label>Email</label>' +
                  '<div class="input-group">' +
                  '<input type="text" name="email" class="form-control" aria-describedby="basic-addon2" ng-model="userTempEmail" required mongoose-error disabled>' +
                  '<span class="input-group-addon" id="basic-addon2">{{uniEmail}}</span>' +
                  '</div>' +
                  '<p class="help-block" ng-show="form.email.$error.email && submitted">Email address provided does not match the department format</p>' +
                  '<p class="help-block" ng-show="form.email.$error.required && submitted">Please enter your email address</p>' +
                  '<p class="help-block" name="emailVal" ng-show="form.email.$error.mongoose">{{ errors.email }}</p>' +
                  '</div>' +

                  '<button class="btn btn-danger " ng-click="requestReset(updatedUser)" ng-if="!updatedUser.passcode" disabled>' +
                  '<span class="glyphicon glyphicon-share-alt"></span>  Request Password Reset</button>' +
                  '<button class="btn btn-danger " ng-click="requestPasscode(updatedUser)" ng-if="updatedUser.passcode" disabled>' +
                  '<span class="glyphicon glyphicon-share-alt"></span>  Send new passcode</button>' +
                  '</div>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    updateModal.dismiss(e);
                  }
                }, {
                  classes: 'btn-warning',
                  text: 'Update',
                  click: function(e, form) {
                    $rootScope.submitted = true;

                    if ($rootScope.updatedUser.role != "Select Role" && $rootScope.updatedUser.department != "Select Department" && $rootScope.updatedUser.name) {

                      Auth.updateUser({
                          user: $rootScope.updatedUser
                        })
                        .then(function(res) {
                          updatedUser = res.user;
                          // user created, close the modal
                          updateModal.close(e);
                        })
                        .catch(function(err) {
                          $rootScope.errors = {};

                          // Update validity of form fields that match the mongoose errors
                          angular.forEach(err.errors, function(error, field) {
                            //console.info(form[field]);
                            form[field].$setValidity('mongoose', false);
                            $rootScope.errors[field] = error.message;
                          });
                        });
                    }
                  }
                }]
              }
            }, 'modal-warning');

            updateModal.result.then(function(event) {
              cb(updatedUser);
            });
          };
        },
        lecture: function(cb) {
          cb = cb || angular.noop;
          return function() {
            //   var args = Array.prototype.slice.call(arguments),
            // 	updateModal, updatedUser;
            //   var user = args.shift();
            //   // refresh validation on new modal open - remove details
            //   $rootScope.roles = {};
            //   $rootScope.departments = {};
            //   $rootScope.updatedUser = angular.copy(user);

            var args = Array.prototype.slice.call(arguments),
              updateModal, updatedLecture;
            var lecture = args.shift();
            $rootScope.updatedLecture = angular.copy(lecture);
            $rootScope.me = Auth.getCurrentUser();
            // $rootScope.lecture = {
            //   startTime: new Date(),
            //   endTime: new Date(new Date().getTime() + 60 * 60000),
            //   createdBy: $rootScope.me.name,
            //   qActAllowance: 10,
            // };
            // refresh validation on new modal open - remove details
            updateModal = openModal({
              modal: {
                name: "updateLectureForm",
                dismissable: true,
                title: 'Update Lecture',
                form: '<div class="container-fluid">' +
                  '<div class="row">' +
                  '<div class="form-group col-xs-8 col-sm-6 col-md-3 col-lg-3 col-xs-offset-2 col-sm-offset-3 col-md-offset-0 col-lg-offset-0 pull-left" style="background-color:#FFF;padding:0;">' +
                  '<ext-svg data-content="updatedLecture.qr.svg"></ext-svg>' +
                  '<div class="form-group col-md-12 top-buffer">' +
                  '<p class="text-center text-primary"><strong>Access Code: {{updatedLecture.altAccess}}</strong></p>' +
                  //   '<button type="button" class="btn btn-primary center-block" ng-click="genNewQR(updatedLecture)">Regenerate QR</button>' +
                  '</div>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.name.$valid && submitted,\'has-error\': form.name.$invalid && submitted }">' +
                  '<label>Lecture Name</label>' +
                  '<input type="text" name="name" class="form-control" ng-model="updatedLecture.name" required mongoose-error>' +
                  '<p class="help-block" ng-show="form.name.$error.required && submitted">Lecture must have a name</p>' +
                  '<p class="help-block" name="nameVal" ng-show="form.name.$error.mongoose">{{ errors.name }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.desc.$valid && submitted,\'has-error\': form.desc.$invalid && submitted }">' +
                  '<label>Lecture Description</label>' +
                  '<textarea class="form-control" name="desc" rows="2" ng-model="updatedLecture.desc" style="max-height:100px;" required mongoose-error></textarea>' +
                  '<p class="help-block" ng-show="form.desc.$error.required && submitted">Lecture must have a description</p>' +
                  '<p class="help-block" name="descVal" ng-show="form.desc.$error.mongoose">{{ errors.desc }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.createdBy.$valid && submitted,\'has-error\': form.createdBy.$invalid && submitted }">' +
                  '<label>Created By</label>' +
                  '<input type="text" name="createdBy" class="form-control" ng-model="updatedLecture.createdBy.name" disabled required mongoose-error>' +
                  '<p class="help-block" ng-show="form.createdBy.$error.required && submitted">Something was not right there.</p>' +
                  '<p class="help-block" name="createdByVal" ng-show="form.createdBy.$error.mongoose">{{ errors.createdBy }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.startTime.$valid && submitted,\'has-error\': form.startTime.$invalid && submitted }">' +
                  '<label>Start Time</label>' +
                  '<div class="dropdown">' +
                  '<div class="input-group">' +
                  '<input type="text" class="form-control" data-ng-model="updatedLecture.startTime">' +
                  '<span class="input-group-addon">' +
                  '<i class="glyphicon glyphicon-calendar"></i>' +
                  '</span>' +
                  '</div>' +
                  '</div>' +
                  '<p class="help-block" ng-show="form.startTime.$error.startTime && submitted">Add some validation here</p>' +
                  '<p class="help-block" ng-show="form.startTime.$error.required && submitted">Add some validation here</p>' +
                  '<p class="help-block" name="startTimeVal" ng-show="form.startTime.$error.mongoose">{{ errors.startTime }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.endTime.$valid && submitted,\'has-error\': form.endTime.$invalid && submitted }">' +
                  '<label>End Time</label>' +
                  '<div class="dropdown">' +
                  '<div class="input-group">' +
                  '<input type="text" class="form-control" data-ng-model="updatedLecture.endTime">' +
                  '<span class="input-group-addon">' +
                  '<i class="glyphicon glyphicon-calendar"></i>' +
                  '</span>' +
                  '</div>' +
                  '</div>' +
                  '<p class="help-block" ng-show="form.endTime.$error.endTime && submitted">Add some validation here</p>' +
                  '<p class="help-block" ng-show="form.endTime.$error.required && submitted">Add some validation here</p>' +
                  '<p class="help-block" name="endTimeVal" ng-show="form.endTime.$error.mongoose">{{ errors.endTime }}</p>' +
                  '</div>' +
                  '<div class="form-group col-xs-12 col-sm-12 col-md-9 col-lg-9 pull-right" ng-class="{ \'has-success\': form.qActAllowance.$valid && submitted,\'has-error\': (form.qActAllowance.$invalid && submitted) || (form.qActAllowance < 0) || (form.qActAllowance > 60) }">' +
                  '<label>Question Time Allowance Variation</label>' +
                  '<input type="number" name="qActAllowance" class="form-control" step="5" ng-model="updatedLecture.qActAllowance" value="{{updatedLecture.qActiveAllowance}}" max="60" min="0" required mongoose-error/>' +
                  '<p class="help-block" ng-show="(form.qActAllowance.$error.minlength || form.qActAllowance.$error.required) && (form.qActiveAllowance < 0) || (form.qActiveAllowance > 60) && submitted">Must be between 0 and 60</p>' +
                  '<p class="help-block" ng-show="form.qActiveAllowance.$error.mongoose">{{ errors.qActiveAllowance }}</p>' +
                  '</div>' +
                  '</div>' +
                  '</div>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    updateModal.dismiss(e);
                  }
                }, {
                  classes: 'btn-warning',
                  text: 'Update',
                  click: function(e, form) {
                    $rootScope.submitted = true;

                    if ($rootScope.updatedUser.role != "Select Role" && $rootScope.updatedUser.department != "Select Department" && $rootScope.updatedUser.name) {

                      Auth.updateUser({
                          user: $rootScope.updatedUser
                        })
                        .then(function(res) {
                          updatedUser = res.user;
                          // user created, close the modal
                          updateModal.close(e);
                        })
                        .catch(function(err) {
                          $rootScope.errors = {};

                          // Update validity of form fields that match the mongoose errors
                          angular.forEach(err.errors, function(error, field) {
                            //console.info(form[field]);
                            form[field].$setValidity('mongoose', false);
                            $rootScope.errors[field] = error.message;
                          });
                        });
                    }
                  }
                }]
              }
            }, 'modal-warning', 'lg');

            updateModal.result.then(function(event) {
              cb(updatedUser);
            });
          };
        }
      },
      /* Confirmation modals */
      delete: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        user: function(cb) {
          cb = cb || angular.noop;
          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
              user = args.shift(),
              deleteModal;
            if (user._id == Auth.getCurrentUser()._id) {
              deleteModal = openModal({
                modal: {
                  name: "deleteUserForm",
                  dismissable: true,
                  title: 'Warning',
                  form: '<p>You cannot delete your own user through this method. <br><br>You can find options like this by accessing the following link: <a ng-click="deleteModal.close(e)" href="/profile/settings">Profile Settings</a></p>',
                  buttons: [{
                    classes: 'btn-warning',
                    text: 'OK',
                    click: function(e) {
                      deleteModal.close(e);
                    }
                  }]
                }
              }, 'modal-warning');

              deleteModal.result.then(function(event) {
                cb(null);
              });
            } else {
              deleteModal = openModal({
                modal: {
                  name: "deleteConf",
                  dismissable: true,
                  title: 'Confirm Delete',
                  form: '<p>Are you sure you want to delete <strong>' + user.name + '</strong> ?</p>',
                  buttons: [{
                    classes: 'btn-default',
                    text: 'Cancel',
                    click: function(e) {
                      deleteModal.dismiss(e);
                    }
                  }, {
                    classes: 'btn-danger',
                    text: 'Delete',
                    click: function(e) {
                      deleteModal.close(e);
                    }
                  }]
                }
              }, 'modal-danger');

              deleteModal.result.then(function(event) {
                cb(user);
              });
            }
          };
        },
        lecture: function(cb) {
          cb = cb || angular.noop;
          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
              lecture = args.shift(),
              deleteModal;
            deleteModal = openModal({
              modal: {
                name: "deleteConf",
                dismissable: true,
                title: 'Confirm Delete',
                form: '<p>Are you sure you want to delete <strong>' + lecture.name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }, {
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              cb(lecture);
            });

          };
        }
      }
    };
  });