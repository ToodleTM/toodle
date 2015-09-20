'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http, $modal, $translatePartialLoader, $translate) {
        $translatePartialLoader.addPart('app/play');
        $translate.refresh();
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
        }).error(function(){
            $scope.hideContent = true;
            $scope.notFound = true;
        });

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

        $scope.toggleCollapse = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
    }
);
