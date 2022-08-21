var app = angular.module('myApp', []);
app.controller('authenController', function ($scope, $http, $location, globalSetting) {
    moment.locale("th");

    $scope.password = '';
    $scope.error = '';
    $scope.login = login;



    function login( password) {
        if (password == "a") {
            window.location = "/db";
        } else if (password == "b") {
            window.location = "/bi";
        } else {
            $scope.error = "password incorrect.";
        }
    }
})