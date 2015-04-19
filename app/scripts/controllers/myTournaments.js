'use strict';

angular.module('toodleApp')
    .controller('MyTournamentsCtrl', function ($scope, $location, $translate, $cookies, $cookieStore, $http) {
        $scope.tournamentUsersToDisplay = [];
        $http.get('/my/tournaments?type='+$location.$$search.type)
            .success(function (data) {
                $scope.tournamentUsersToDisplay = data[$location.$$search.type];
            })
            .error(function(){
                $scope.tournamentUsersToDisplay = [];
            });
    });
