'use strict';

angular.module('toodleApp')
    .controller('NavbarCtrl', function ($scope, $location, $translate, $cookies, $cookieStore, $http, $window) {
        $scope.selectedLanguage = $cookies['toodle-lang'] && $cookies['toodle-lang'] !== 'undefined' ?JSON.parse($cookies['toodle-lang']):'en';
        $scope.userName ='';
        $scope.userIcon = '';
        $scope.login = function(provider){
            $window.location = '/login?type='+provider+'&returnUrl='+$location.$$absUrl;
        };

        $scope.logout = function(){
            $window.location = '/logout?returnUrl='+$location.$$absUrl;
        };
        $http.get('/get-session-data').success(function(data){
            $scope.userName = data.displayName;
            $scope.userIcon = data.pictureUrl;
        }).error(function(){
        });

        $scope.switchLanguage = function(newLang){
            $scope.selectedLanguage = newLang;
            $translate.use(newLang);
            $cookieStore.put('toodle-lang', newLang);
        };
        $scope.switchLanguage($scope.selectedLanguage);
    });
