'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = "";
        $scope.playerList = null;

        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            if($scope.tournamentInfo.game){
                $http.get('/views/resources/factions.json').success(function(data){
                    $scope.factions = data[$scope.tournamentInfo.game];
                });
            }
            updateMatchesToReport();
            updateMatchesToUnreport()
        });

        function updateMatchesToReport() {
            $http.get('/api/tournament/matchesToReport?id=' + $scope.tournamentInfo.signupID)
                .success(function (data) {
                    $scope.gamesToReport = data;
                    if (data.length > 0) {
                        $scope.firstGameToReport = $scope.gamesToReport[0];
                        $scope.number = $scope.firstGameToReport.number;
                        $scope.score1 = 0;
                        $scope.score2 = 0;
                    }
                })
                .error(function () {
                });
        }

        function updateMatchesToUnreport() {
            $http.get('/api/tournament/matchesToUnreport?id=' + $scope.tournamentInfo.signupID)
                .success(function (data) {
                    $scope.gamesToUnreport = data;
                    if (data.length > 0) {
                        $scope.gameToUnreport = $scope.gamesToUnreport[0];
                        $scope.unreportNumber = $scope.gameToUnreport.number;
                    }
                })
                .error(function (err) {
                });
        }

        $scope.enterTournament = function () {
            $("#registrationKo").hide();
            $("#registrationOk").hide();
            $("#inputNick").val('');
            $http.put('/api/update-tournament/play', {signupID: $scope.tournamentInfo.signupID, nick: $scope.nick, faction:$scope.faction}).success(function(data){
                $("#registrationOk").fadeIn();
                $scope.playerList = data.players;
            }).error(function(error){
                $("#registrationKo").fadeIn();
                $scope.errorMessage = error.message;
            });
        };

        $scope.reportMatch = function () {
            $("#tourneyReportingOk").hide();
            $("#tourneyReportingKo").hide();
            $http.post('/api/tournament/reportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.firstGameToReport.number,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $("#tourneyReportingKo").fadeIn();
            });
        };

        $scope.unreportMatch = function () {
            $("#tourneyReportingOk").hide();
            $("#tourneyReportingKo").hide();
            $http.post('/api/tournament/unreportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.number
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $("#tourneyReportingKo").fadeIn();
            });
        };
    }
);
