var app = angular.module('myapp', ['ui.bootstrap']);

app.controller('indexmainController', function ($scope, $http, $timeout, $location) {
    var url = $location.path();
    var newString = url.replace("/", "");
    // $http.get("index.html?id=" + newString + "")
    //     .success(function (response) { $scope.information = response.driver; });
       $scope.user = newString;
});
