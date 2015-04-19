'use strict';

angular.module('toodleApp')
    .controller('NavbarCtrl', function ($scope, $location, $translate, $cookies, $cookieStore, $http, $window) {
        $scope.selectedLanguage = $cookies['toodle-lang'] && $cookies['toodle-lang'] !== 'undefined' ?JSON.parse($cookies['toodle-lang']):'en';
        $scope.userName ='';
        $scope.userIcon = '';
        $scope.login = function(){
            $window.location = '/login?returnUrl='+$location.$$absUrl;
        };

        $scope.logout = function(){
            $window.location = '/logout?returnUrl='+$location.$$absUrl;
        };
        $http.get('get-session-data').success(function(data){
            $scope.userName = data.displayName;
            $scope.userIcon = data._json['profile_image_url'];
        }).error(function(){
        });

        $scope.switchLanguage = function(newLang){
            $scope.selectedLanguage = newLang;
            $translate.use(newLang);
            $cookieStore.put('toodle-lang', newLang);
            $('#activeLanguage').attr('src', './images/flags/'+$scope.selectedLanguage+'.svg');
        };
        $scope.switchLanguage($scope.selectedLanguage);

        $('#languageSelector ul li a').click(function(e){
            e.preventDefault();
            $scope.switchLanguage($(this).attr('language'));
            $scope.$apply();
        });

        $('#languageSelector a').click(function(e){
            e.preventDefault();
        });
    });
