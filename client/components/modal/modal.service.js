'use strict';

angular.module('uniQaApp')
  .factory('Modal', function($rootScope, $modal, Auth) {

    // Use the User $resource to fetch all users
    $rootScope.user = {};
    $rootScope.universities = ["Select University", "Sheffield Hallam", "Sheffield University"]
    $rootScope.user.university = $rootScope.universities[0];
    $rootScope.userRoles = ["Select Role", "student", "teacher"]
    $rootScope.user.role = $rootScope.userRoles[0];

    $rootScope.uniDropdownSel = function(target) {
      $rootScope.user.university = target;
    };
    $rootScope.userTypeDropdownSel = function(target) {
      $rootScope.user.role = target;
    };

    // global constant access-code length
    var AC_LENGTH = 8;

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
      return true;
    }
    //
    function createUniqueAccessCode(callback) {
      var accessCode = genAccessCode(AC_LENGTH);
      isAccessCodeUnique(accessCode, function(unique) {
        if (unique) {
          $rootScope.user.passcode = accessCode;
          console.info(accessCode);
        //return accessCode
        } else {
          createUniqueAccessCode();
        }
      });
    }
    // create new user entry in collection
    // module.exports.createAuthUser = function(req, res) {
    //     var username = req.body.username;
    //     var password = req.body.password;
    //     if (username && password) {
    //         var newApiUser = new ApiUser(req.body);
    //         createUniqueKey(function(apiKey) {
    //             newApiUser.key = apiKey;
    //             newApiUser.save(function(err, authUser) {
    //                 if (err) {
    //                     res.json({
    //                         error: {
    //                             error: "Problem creating authorized API user",
    //                             details: err
    //                         }
    //                     });
    //                 } else {
    //                     //User has been created
    //                     //console.log('New user created for API usage: ' + authUser.username);
    //                     res.json(authUser);
    //                 }
    //             });
    //         });
    //     } else {
    //         res.json({
    //             error: "Problem creating authorized API user: No username or password supplied."
    //         });
    //     }
    // };

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
              createModal;
            createUniqueAccessCode();
            createModal = openModal({
              modal: {
                dismissable: true,
                title: 'Create User',
                html: '<form class="form" name="form" ng-submit="register(form)" novalidate>' +
                  '<div class="form-group" ng-class="{ \'has-success\': form.name.$valid && submitted,\'has-error\': form.name.$invalid && submitted }">' +
                  '<label>Name</label>' +
                  '<input type="text" name="name" class="form-control" ng-model="user.name" required/>' +
                  '<p class="help-block" ng-show="form.name.$error.required && submitted">A name is required</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': user.role!=\'Select Role\' && submitted,\'has-error\': user.role==\'Select Role\' && submitted }">' +
                  '<label>Account Type</label>' +
                  '<div class="dropdown reg-dropdown">' +
                  '<button class="btn btn-inverse dropdown-toggle form-control" name="type" ng-model="userRoles" type="button" data-toggle="dropdown">{{user.role}}' +
                  '<span class="caret"></span>' +
                  '</button>' +
                  '<ul class="dropdown-menu"> ' +
                  '<li>' +
                  '<a ng-repeat="roles in userRoles" ng-click="userTypeDropdownSel(roles)" style="text-transform: capitalize;">{{roles}}</a>' +
                  '</li>' +
                  '</ul>' +
                  '</div>' +
                  '<p class="help-block" ng-show="user.role==\'Select Role\' && submitted">Please select a user type</p>' +
                  '<p class="help-block" ng-show="form.roles.$error.mongoose">{{ errors.roles }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': user.university!=\'Select University\' && submitted,\'has-error\': user.university==\'Select University\' && submitted }">' +
                  '<label>University</label>' +
                  '<div class="dropdown reg-dropdown">' +
                  '<button class="btn btn-inverse dropdown-toggle form-control" name="university" type="button" data-toggle="dropdown">{{user.university}}<span class="caret"></span></button>' +
                  '<ul class="dropdown-menu">' +
                  '<li ng-repeat="university in universities">' +
                  '<a ng-click="uniDropdownSel(university)">{{university}}</a>' +
                  '</li>' +
                  '</ul>' +
                  '</div>' +
                  '<p class="help-block" ng-show="user.university==\'Select University\' && submitted">Please select a university</p>' +
                  '<p class="help-block" ng-show="form.user.university.$error.mongoose">{{ errors.user.university }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': form.email.$valid && submitted,\'has-error\': form.email.$invalid && submitted }">' +
                  '<label>Email</label>' +
                  '<input type="email" name="email" class="form-control" ng-model="user.email" required mongoose-error/>' +
                  '<p class="help-block" ng-show="form.email.$error.email && submitted">Email address provided does not match the university format</p>' +
                  '<p class="help-block" ng-show="form.email.$error.required && submitted">Please enter your email address</p>' +
                  '<p class="help-block" ng-show="form.email.$error.mongoose">{{ errors.email }}</p>' +
                  '</div>' +
                  '<div class="form-group" ng-class="{ \'has-success\': form.passcode.$valid && submitted,\'has-error\': form.passcode.$invalid && submitted }">' +
                  '<label>Access Code</label>' +
                  '<input type="passcode" name="passcode" class="form-control" ng-model="user.passcode" value="{{user.passcode}}" maxlength=8 required readonly mongoose-error/>' +
                  '<p class="help-block" ng-show="(form.passcode.$error.minlength || form.passcode.$error.required) && submitted">Passcodes are 8 characters long.</p>' +
                  '<p class="help-block" ng-show="form.passcode.$error.mongoose">{{ errors.passcode }}</p>' +
                  '</div>' +
                  '</form>',
                buttons: [{
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    createModal.dismiss(e);
                  }
                }, {
                  classes: 'btn-success',
                  text: 'Create',
                  click: function(e) {
                    console.info($rootScope);
                    $rootScope.submitted = true;
                    if ($rootScope.user.role != "Select Role"
                      && $rootScope.user.university != "Select University"
                      && $rootScope.user.name
                      && $rootScope.user.email
                      && $rootScope.user.passcode) {

                      Auth.adminRegister({
                        user: $rootScope.user
                      })
                        .then(function() {
                          // user created, close the modal
                          createModal.close(e);
                        })
                        .catch(function(err) {
                          err = err.data;
                          $rootScope.errors = {};

                          // Update validity of form fields that match the mongoose errors
                          angular.forEach(err.errors, function(error, field) {
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
              cb();
            });
          };
        }
      },
      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(cb) {
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
                  dismissable: true,
                  title: 'Warning',
                  html: '<p>You cannot delete your own user</p>',
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
                  dismissable: true,
                  title: 'Confirm Delete',
                  html: '<p>Are you sure you want to delete <strong>' + user.name + '</strong> ?</p>',
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
