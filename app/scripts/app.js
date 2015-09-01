'use strict';
var app = angular.module('toodleApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'pascalprecht.translate',
    'angularFileUpload',
    'ui.bootstrap'
]);

app.config(function ($routeProvider, $locationProvider, $httpProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main',
            controller: 'MainCtrl'
        })
        .when('/admin/:id', {
            templateUrl: 'partials/admin',
            controller: 'AdminCtrl'
        })
        .when('/playersRegistration/:id', {
            controller: 'PlayersRegistrationCtrl',
            templateUrl: 'partials/playersRegistration.html'
        })
        .when('/admin/preconfigure/:id', {
            templateUrl:'partials/preconfigureTournament',
            controller:'PreconfigureTournamentCtrl'
        })
        .when('/play/:id', {
            templateUrl: 'partials/play',
            controller: 'PlayCtrl'
        })
        .when('/tournaments', {
            templateUrl:'partials/tournamentListing',
            controller:'MyTournamentsCtrl'
        })
        .when('/why', {
            templateUrl:'partials/pages/why.html'
        })
        .when('/about', {
            templateUrl:'partials/pages/about.html'
        })
        .when('/privacy', {
            templateUrl:'partials/pages/privacy.html'
        })
        .when('/tos', {
            templateUrl:'partials/pages/tos.html'
        })
        .when('/whats-new', {
            templateUrl: 'partials/pages/whatsNew.html'
        })
        .when('/csv-howto', {
            templateUrl:'partials/pages/csv.html'
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.html5Mode(true);

    // Initialize angular-translate
    $translateProvider.useStaticFilesLoader({
        prefix: 'i18n/',
        suffix: '.json'
    });

    $translateProvider.preferredLanguage('en');
    $translateProvider.useCookieStorage();

    // Intercept 401s and redirect you to login
    $httpProvider.interceptors.push(['$q', '$location', function ($q, $location) {
        return {
            'responseError': function (response) {
                if (response.status === 401) {
                    $location.path('/login');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        };
    }]);
})
    .run(function ($rootScope) {
        $rootScope.hideAlerts = function () {
            $('.app-alert').fadeOut();
        };
    });

app.directive('whenReady', ['$interpolate', function($interpolate) {
    return {
        restrict: 'A',
        priority: Number.MIN_SAFE_INTEGER, // execute last, after all other directives if any.
        link: function($scope, $element, $attributes) {
            var expressions = $attributes.whenReady.split(';');
            var waitForInterpolation = false;
            var hasReadyCheckExpression = false;

            function evalExpressions(expressions) {
                expressions.forEach(function(expression) {
                    $scope.$eval(expression);
                });
            }

            if ($attributes.whenReady.trim().length === 0) { return; }

            if ($attributes.waitForInterpolation && $scope.$eval($attributes.waitForInterpolation)) {
                waitForInterpolation = true;
            }

            if ($attributes.readyCheck) {
                hasReadyCheckExpression = true;
            }

            if (waitForInterpolation || hasReadyCheckExpression) {
                requestAnimationFrame(function checkIfReady() {
                    var isInterpolated = false;
                    var isReadyCheckTrue = false;

                    if (waitForInterpolation && $element.text().indexOf($interpolate.startSymbol()) >= 0) { // if the text still has {{placeholders}}
                        isInterpolated = false;
                    }
                    else {
                        isInterpolated = true;
                    }

                    if (hasReadyCheckExpression && !$scope.$eval($attributes.readyCheck)) { // if the ready check expression returns false
                        isReadyCheckTrue = false;
                    }
                    else {
                        isReadyCheckTrue = true;
                    }

                    if (isInterpolated && isReadyCheckTrue) { evalExpressions(expressions); }
                    else { requestAnimationFrame(checkIfReady); }

                });
            }
            else {
                evalExpressions(expressions);
            }
        }
    };
}]);

angular.module('toodleApp').controller('ModalToggleStartCtrl', function ($scope, $modalInstance, tournamentInfo, allowConfigureBeforeStart) {
    $scope.tournamentInfo = tournamentInfo;
    $scope.allowConfigureBeforeStart = allowConfigureBeforeStart;
    $scope.toggleStart = function (configureOnly) {
        $modalInstance.close(configureOnly);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('toodleApp').controller('ModalPreconfigureCtrl', function ($scope, $modalInstance, tournamentInfo) {
    $scope.tournamentInfo = tournamentInfo;
    $scope.preconfigure = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('toodleApp').controller('ModalReportCtrl', function ($scope, $modalInstance, firstGameToReport) {
    $scope.firstGameToReport = firstGameToReport;
    $scope.score1 = $scope.firstGameToReport.score1 ? $scope.firstGameToReport.score1 : 0;
    $scope.score2 = $scope.firstGameToReport.score2 ? $scope.firstGameToReport.score2 : 0;
    $scope.matchComplete = false;
    $scope.forfeitSlot = null;

    $scope.reportMatch = function () {
        $modalInstance.close([$scope.score1 || 0, $scope.score2 || 0, $scope.scoreIsFinal && $scope.matchComplete, $scope.forfeitSlot]);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.toggleForfeit = function(slotNumber){
        if($scope.forfeitSlot && $scope.forfeitSlot === slotNumber) {
            $scope.forfeitSlot = null;
        } else {
            $scope.forfeitSlot = slotNumber;
        }
    };

    $scope.emptyScore1IfValueIsZero = function(){
        if($scope.score1 === 0 || $scope.score1 === '0'){
            $scope.score1 = '';
        }
    };
    $scope.emptyScore2IfValueIsZero = function () {
        if ($scope.score2 === 0 || $scope.score2 === '0') {
            $scope.score2 = '';
        }
    };

    $scope.isScoreFinal = function () {
        $scope.scoreIsFinal = $scope.score1 !== '' && $scope.score2 !== '' && $scope.score1 !== $scope.score2;
    };
    $scope.isScoreFinal();
});

angular.module('toodleApp').controller('ModalUnreportCtrl', function ($scope, $modalInstance, gameToUnreport) {
    $scope.gameToUnreport = gameToUnreport;
    $scope.unreportMatch = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});