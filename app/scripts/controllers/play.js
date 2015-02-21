'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        _paq.push(['setDocumentTitle', 'Enrollment Page']);
        _paq.push(['trackPageView']);
        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            if($scope.tournamentInfo.game){
                $http.get('/views/resources/factions.json').success(function(data){
                    $scope.factions = data[$scope.tournamentInfo.game];
                });
            }
            updateMatchesToReport();
            updateMatchesToUnreport();
        }).error(function(){
            $('#content').hide();
            $('#notFound').show();
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
                .error(function () {});
        }

        $scope.playerCanReport = function(){
            return $scope.tournamentInfo ? $scope.tournamentInfo.userPrivileges > 1: false;
        };

        $scope.playerCanUnreport = function(){
            return $scope.tournamentInfo ? $scope.tournamentInfo.userPrivileges > 2 : false;
        };

        $scope.enterTournament = function () {
            $('#registrationKo').hide();
            $('#registrationOk').hide();
            $('#inputNick').val('');
            $http.put('/api/update-tournament/play', {signupID: $scope.tournamentInfo.signupID, nick: $scope.nick, faction:$scope.faction}).success(function(data){
                $('#registrationOk').fadeIn();
                $scope.playerList = data.players;
            }).error(function(error){
                $scope.errorMessage = 'play.register.errors.'+error.message;
                $('#registrationKo').fadeIn();
            });
        };

        $scope.reportMatch = function () {
            $('#tourneyReportingOk').hide();
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/reportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.firstGameToReport.number,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $('#tourneyReportingOk').show();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = 'admin.actions.reporting.errors.'+data.message;
                $('#tourneyReportingKo').fadeIn();
            });
        };

        $scope.unreportMatch = function () {
            $('#tourneyReportingOk').hide();
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/unreportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.number
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $('#tourneyReportingOk').show();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $('#tourneyReportingKo').fadeIn();
            });
        };
    }
);
