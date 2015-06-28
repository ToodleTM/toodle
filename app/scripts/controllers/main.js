'use strict';

angular.module('toodleApp')
    .controller('MainCtrl', function ($scope, $http, $location) {
        $scope.tournamentName = '';
        _paq.push(['setDocumentTitle', 'Home']);
        _paq.push(['trackPageView']);

        $scope.hideLocalAlerts = function(){
            $scope.tourneyCreationKo = false;
            $scope.tourneyCreationOk = false;
        };

        $scope.createTourney = function () {
            $scope.hideLocalAlerts();
            $http.post('/api/tournament/', {tournamentName: $scope.tournamentName, players: []})
                .success(function (res) {
                    $scope.adminURL = res.adminURL;
                    $scope.signupURL = res.signupURL;
                    $location.path('/');
                    $scope.tournamentCreated = true;
                    $scope.tourneyCreationOk = true;
                    $scope.tournamentName = '';
                })
                .error(function (err) {
                    $scope.errorMessage = err.errors.tournamentName.message;
                    $scope.tourneyCreationKo = true;
                });
        };
    });
