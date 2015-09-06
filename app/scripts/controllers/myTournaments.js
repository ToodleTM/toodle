'use strict';

angular.module('toodleApp')
    .controller('MyTournamentsCtrl', function ($scope, $location, $translate, $http, $translatePartialLoader) {
        $translatePartialLoader.addPart('app/tournaments');
        $translate.refresh();
        $scope.tournamentUsersToDisplay = [];
        $scope.searchType = $location.$$search.type;
        $http.get('/api/my/tournaments?type='+$scope.searchType)
            .success(function (data) {
                $scope.tournamentUsersToDisplay = data[$scope.searchType];
            })
            .error(function(){
                $scope.tournamentUsersToDisplay = [];
            });
    });
