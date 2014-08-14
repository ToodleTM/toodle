'use strict';

angular.module('toodleApp')
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
                    id: '@id'
                }
            }
        });
    })
    .factory('TournamentPlay', function($resource){
        return $resource('/api/update-tournament/play', {}, {
            update:{
                method:'PUT',
                params:{}
            }
        });
    }

);


