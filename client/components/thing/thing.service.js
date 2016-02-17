'use strict';

angular.module('uniQaApp')
	.factory('Thing', function Thing($http, $q) {
		return {

			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			getByName: function(query, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/things?name=' + query)
					.success(function(data) {
						deferred.resolve(data);
						return cb();
					}).error(function(err) {
						deferred.reject(err);
						return cb(err);
					}.bind(this));
				return deferred.promise;
			},
			//
			//   /**
			//    * Delete access token and user info
			//    *
			//    * @param  {Function}
			//    */
			//   logout: function() {
			//     $cookieStore.remove('token');
			//     currentUser = {};
			//   },
			//
			//   userAuthenticate: function(user, callback) {
			//     var cb = callback || angular.noop;
			//     var deferred = $q.defer();
			//
			//     $http.post('/api/users', user).success(function(data) {
			//       deferred.resolve(data);
			//       return cb();
			//     }).error(function(err) {
			//       this.logout();
			//       deferred.reject(err);
			//       return cb(err);
			//     }.bind(this));
			//     return deferred.promise;
			//   },
			//
			//   /**
			//    * Create a new user
			//    *
			//    * @param  {Object}   user     - user info
			//    * @param  {Function} callback - optional
			//    * @return {Promise}
			//    */
			//   createUser: function(obj, callback) {
			//     var cb = callback || angular.noop;
			//     var deferred = $q.defer();
			//     var user = obj.user;
			//
			//     $http.post('/api/users', user).success(function(data) {
			//       deferred.resolve(data);
			//       return cb();
			//     }).error(function(err) {
			//       deferred.reject(err);
			//       return cb(err);
			//     }.bind(this));
			//     return deferred.promise;
			//   },
			//
			//   /**
			//    * Change password
			//    *
			//    * @param  {String}   oldPassword
			//    * @param  {String}   newPassword
			//    * @param  {Function} callback    - optional
			//    * @return {Promise}
			//    */
			//   changePassword: function(oldPassword, newPassword, callback) {
			//     var cb = callback || angular.noop;
			//
			//     return User.changePassword({
			//       id: currentUser._id
			//     }, {
			//       oldPassword: oldPassword,
			//       newPassword: newPassword
			//     }, function(user) {
			//       return cb(user);
			//     }, function(err) {
			//       return cb(err);
			//     }).$promise;
			//   },
			//
			//   /**
			//    * Gets all available info on authenticated user
			//    *
			//    * @return {Object} user
			//    */
			//   getCurrentUser: function() {
			//     return currentUser;
			//   },
			//
			//   /**
			//    * Check if a user is logged in
			//    *
			//    * @return {Boolean}
			//    */
			//   isLoggedIn: function() {
			//     return currentUser.hasOwnProperty('role');
			//   },
			//
			//   /**
			//    * Waits for currentUser to resolve before checking if user is logged in
			//    */
			//   isLoggedInAsync: function(cb) {
			//     if (currentUser.hasOwnProperty('$promise')) {
			//       currentUser.$promise.then(function() {
			//         cb(true);
			//       }).catch(function() {
			//         cb(false);
			//       });
			//     } else if (currentUser.hasOwnProperty('role')) {
			//       cb(true);
			//     } else {
			//       cb(false);
			//     }
			//   },
			//
			//   /**
			//    * Check user type
			//    *
			//    * @return {Boolean}
			//    */
			//   isAdmin: function() {
			//     return currentUser.role === 'admin';
			//   },
			//   isTeacher: function() {
			//     return currentUser.role === 'teacher';
			//   },
			//   isStudent: function() {
			//     return currentUser.role === 'student';
			//   },
			//
			//   /**
			//    * Get auth token
			//    */
			//   getToken: function() {
			//     return $cookieStore.get('token');
			//   }
		};
	});