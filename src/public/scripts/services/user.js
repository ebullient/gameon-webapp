'use strict';

/**
 * User service. Wraps fetch to/from server and local storage to deal
 * with information about the user/player.
 *
 * @ngdoc service
 * @name playerApp.user
 * @description
 * # user
 * Factory in the playerApp.
 */
angular.module('playerApp')
  .factory('user',
  [          '$log','$state','API','$http',
    function ($log,  $state,  API,  $http) {

    var generatedNames = [];
    var generatedColors = [];

    var profile = {};

    var rules = {};
    rules.nameRule = "At least 3 characters, no spaces.";
    rules.namePattern = /^\w{3,}$/;
    rules.colorRule = "At least 3 characters, no spaces.";
    rules.colorPattern = /^\w{3,}$/;

    var load = function(id,name) {

      $log.debug('quering token %o',localStorage.token);

      //we're using the id from the token introspect as our player db id.
      profile.id = id;

      // Load the user's information from the DB and/or session
      // Load needs to come from the Auth token
      var playerURL = API.PROFILE_URL + profile.id;
      var parameters = {};
      var q;

      // Fetch data about the user
      $log.debug('fetch data from %o', playerURL);
      q = $http({
        method : 'GET',
        url : playerURL,
        cache : false,
        params : parameters
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

        var tmp = angular.fromJson(response.data);
        $log.debug('profile: %o', tmp);

        angular.extend(profile, tmp);

        return true;
      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

        // User can't be found, which is fine, we can go build one!
        profile.name = name.replace(/ /g , '_');

        return false;
      });

      return q;
    };

    var create = function() {
      $log.debug("Creating user with: %o", profile);
      // CREATE -- needs to test for ID uniqueness.. so only go on to
      // the next state if all data could validate properly.

      $http({
        method : 'POST',
        url : API.PROFILE_URL,
        cache : false,
        data : profile
      }).then(function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);
        $state.go('play.room');

      }, function(response) {
        $log.debug(response.status + ' ' + response.statusText + ' ' + playerURL);

        // go to the sad state.. (Can't find the player information, and can't save it either)
        $state.go('default.yuk');
      });
    };

    var update = function(startOver) {
        $log.debug("Updating user with: %o %o", startOver, profile);
      // Update user

    };

    var generateName = function() {
      $log.debug('generate a name: %o', generatedNames);
      var name = generatedNames.pop();

      if (typeof name === 'undefined') {
        // no generated names (all used up). Let's grab some more.
        var url = API.PROFILE_URL + 'names';

        $http({
          method : 'GET',
          url : url,
          cache : false
        }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + url);

          var tmp = angular.fromJson(response.data);
          profile.name = tmp.names.pop();
          generatedNames = tmp.names;

        }, function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + url);

          profile.name = 'FrostedCupcake';
        });
      } else {
        profile.name = name;
      }
    };

    var generateColor = function() {
      $log.debug('generate a color: %o', generatedColors);
      var color = generatedColors.pop();

      if (typeof color === 'undefined') {
        // no generated colors (all used up). Let's grab some more.
        var url = API.PROFILE_URL + 'colors';

        $http({
          method : 'GET',
          url : url,
          cache : false
        }).then(function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + url);

          var tmp = angular.fromJson(response.data);
          profile.favoriteColor = tmp.colors.pop();
          generatedColors = tmp.colors;

        }, function(response) {
          $log.debug(response.status + ' ' + response.statusText + ' ' + url);

          profile.favoriteColor = 'Tangerine';
        });
      } else {
        profile.favoriteColor = color;
      }
    };

    return {
        profile: profile,
        rules: rules,
        load: load,
        create: create,
        update: update,
        generateName: generateName,
        generateColor: generateColor
    };
  }]);
