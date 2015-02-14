'use strict';
angular.module('toodleApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'pascalprecht.translate',
    'angularFileUpload',
    'ngCookies'
])
    .config(function ($routeProvider, $locationProvider, $httpProvider, $translateProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/main',
                controller: 'MainCtrl'
            })
            .when('/admin/:id', {
                templateUrl: 'partials/admin',
                controller: 'AdminCtrl'
            })
            .when('/play/:id', {
                templateUrl:'partials/play',
                controller:'PlayCtrl'
            })
            .when('/bracket/:id', {
                templateUrl:'partials/bracket',
                controller:'BracketCtrl'
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
    .run(function ($rootScope) { // $rootScope, $location
        $rootScope.hideAlerts = function(){
            $('.app-alert').fadeOut();
        };
    });
