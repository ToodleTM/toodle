'use strict';

angular.module('toodleApp')
    .controller('MyTournamentsCtrl', function ($scope, $location, $translate, $cookies, $cookieStore, $http) {
        $scope.tournamentUsersToDisplay = [];
        $scope.searchType = $location.$$search.type;
        $http.get('/my/tournaments?type='+$scope.searchType)
            .success(function (data) {
                $scope.tournamentUsersToDisplay = data[$scope.searchType];
            })
            .error(function(){
                $scope.tournamentUsersToDisplay = [];
            });
    });
