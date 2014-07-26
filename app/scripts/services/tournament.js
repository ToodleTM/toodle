'use strict';

angular.module('ezBracketApp')
  .factory('Tournament', function ($resource) {
    return $resource('/api/tournament/:id', {
      id: '@id'
    }, { //parameters default
      update: {
        method: 'PUT',
        params: {}
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
