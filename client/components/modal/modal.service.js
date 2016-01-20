'use strict';

angular.module('uniQaApp')
  .factory('Modal', function($rootScope, $modal, Auth, Department, Thing) {

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

    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
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
              val.forEach(function(obj) {
                $rootScope.departments[obj.name] = obj.subdepartments;
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
        }
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
              val.forEach(function(obj) {
                $rootScope.departments[obj.name] = obj.subdepartments;
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
        }
      }
    };
  });