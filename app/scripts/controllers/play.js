'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http, $modal) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.inputs = {nick:'', faction:null};
        $scope.playerList = null;
        $scope.isCollapsed = true;
        $scope.hideContent = false;
        $scope.notFound = false;
        _paq.push(['setDocumentTitle', 'Enrollment Page']);
        _paq.push(['trackPageView']);
        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            $http.get('api/available-engines').success(function(engines){
                $scope.availableEngines = engines;
                engines.forEach(function(item){
                    if(item.name === data.engine){
                        $scope.engine = item;
                    }
                });
            }).error(function() {
            });
            $http.get('/views/resources/factions.json').success(function (factionsMap) {
                var factionsArray = [];
                for (var key in factionsMap) {
                    for (var item in factionsMap[key]) {
                        factionsArray.push({
                            name: key + ' - ' + factionsMap[key][item],
                            tracker: factionsMap[key][item].toLowerCase()
                        });
                    }
                }
                $scope.factions = factionsArray;
            });
            updateMatchesToReport();
            updateMatchesToUnreport();
        }).error(function(){
            $scope.hideContent = true;
            $scope.notFound = true;
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
            return $scope.tournamentInfo.userPrivileges > 1;
        };

        $scope.playerCanUnreport = function(){
            return $scope.tournamentInfo.userPrivileges > 2;
        };

        $scope.enterTournament = function () {
            $scope.registrationOkDisplay = false;
            $scope.registrationKoDisplay = false;

            var params = {signupID: $scope.tournamentInfo.signupID, nick: $scope.inputs.nick};
            if($scope.inputs.faction){
                params.faction = $scope.inputs.faction.tracker;
            }
            $http.patch('/api/update-tournament/play', params)
                .success(function(data){
                    $scope.registrationOkDisplay = true;
                    $scope.playerList = data.players;
                    $scope.inputs.nick = '';
                    document.getElementById('inputNick').focus();
                }).error(function(error){
                    $scope.inputs.nick = '';
                    $scope.errorMessage = 'play.register.errors.'+error.message;
                    $scope.registrationKoDisplay = true;
                });
        };

        $scope.report = function () {
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/reportTemplate.html',
                controller: 'ModalReportCtrl',
                resolve: {
                    firstGameToReport: function () {
                        return $scope.firstGameToReport;
                    }
                }
            });

            modalInstance.result.then(function (scores) {
                $scope.score1 = scores[0];
                $scope.score2 = scores[1];
                $scope.reportMatch();
            }, function () {
            });
        };

        $scope.unreport = function () {
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/unreportTemplate.html',
                controller: 'ModalUnreportCtrl',
                resolve: {
                    gameToUnreport: function () {
                        return $scope.gameToUnreport;
                    }
                }
            });

            modalInstance.result.then(function () {

                $scope.unreportMatch();
            }, function () {
            });
        };

        $scope.reportMatch = function () {
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
                $scope.errorMessage = 'admin.actions.reporting.errors.'+data.message;
            });
        };

        $scope.unreportMatch = function () {
            $http.post('/api/tournament/unreportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.number
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
            });
        };

        $scope.toggleCollapse = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
    }
);
