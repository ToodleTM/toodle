'use strict';

angular.module('toodleApp')
    .controller('MainCtrl', function ($scope, $http, $location) {
        $scope.tournamentName = '';
        _paq.push(['setDocumentTitle', 'Home']);
        _paq.push(['trackPageView']);
        $scope.createTourney = function () {
            $('#tourneyCreationKo').fadeOut();
            $('#tourneyCreationOk').fadeOut();
            $http.post('/api/tournament/', {tournamentName: $scope.tournamentName, players: []})
                .success(function (res) {
                    $scope.adminURL = res.adminURL;
                    $scope.signupURL = res.signupURL;
                    $location.path('/');
                    $scope.tournamentCreated = true;
                    $('#tourneyCreationOk').fadeIn();
                    $scope.tournamentName = '';
                })
                .error(function (err) {
                    $scope.errorMessage = err.errors.tournamentName.message;
                    $('#tourneyCreationKo').fadeIn();
                });
        };
    });
