'use strict';

angular.module('toodleApp')
    .controller('TournamentsListCtrl', function ($scope, $location, $translate, $http, $translatePartialLoader) {
        $translatePartialLoader.addPart('app/tournamentsList');
        $translate.refresh();
        $scope.currentPage = 1;
        $scope.paginatedTournaments = {};
        $http.get('/api/tournament-list/count')
            .success(function (data) {
                $scope.maxPages = data;
                $scope.updateTournamentsList();
            })
            .error(function () {
            });

        $scope.updateTournamentsList = function () {
            if (!$scope.paginatedTournaments[$scope.currentPage]) {
                $http.get('/api/tournament-list/list?pageNumber=' + $scope.currentPage)
                    .success(function (tournaments) {
                        tournaments.forEach(function (tournament) {
                            tournament.formattedStartDate = tournament.startDate ? moment(tournament.startDate).format('YYYY-MM-DD') : '';
                            tournament.formattedCreationDate = tournament.creationTimestamp ? moment(tournament.creationTimestamp).format('YYYY-MM-DD') : '';
                        });
                        $scope.paginatedTournaments[$scope.currentPage] = tournaments;
                        $scope.tournamentsToDisplay = $scope.paginatedTournaments[$scope.currentPage];
                    })
                    .error(function () {
                    });
            } else {
                $scope.tournamentsToDisplay = $scope.paginatedTournaments[$scope.currentPage];
            }
        };
    });
