'use strict';

angular.module('toodleApp')
    .factory('Tournament', function ($resource) {
        return $resource('/api/tournament/admin/:id', {
            id: '@id'
        }, { //parameters default
            update: {
                method: 'PUT',
                params: {}
            },
            get: {
                method: 'GET',
                params: {
                    id: '@id'
                }
            }
        });
    });


