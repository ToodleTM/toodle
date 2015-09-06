'use strict';

angular.module('toodleApp')
    .controller('NavbarCtrl', function ($scope, $location, $translate, $cookieStore, $http, $window, $translatePartialLoader) {
        $translatePartialLoader.addPart('app/navbar');
        $translatePartialLoader.addPart('doc/about');
        $translate.refresh();
        $scope.selectedLanguage = $cookieStore.get('toodle-lang') ? $cookieStore.get('toodle-lang') : 'en';
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
