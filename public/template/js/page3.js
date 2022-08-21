var app = angular.module('myapp', ['ui.bootstrap']);

app.controller('page3Controller', function ($scope, $http, $timeout, $location) {
    init();

    function init() {
        $scope.list = {};
        $scope.suggestion = "";
        $scope.notice = "";
        var url = $location.path();
        var newString = url.replace("/", "");
        // $http.get("index.html?id=" + newString + "")
        //     .success(function (response) { $scope.information = response.driver; });
        $scope.user = newString;
        $http.get('php/a_get_suggestion.php').success(function (data) {
            $scope.list = data;
        });

    }

    $scope.inputsuggestion = function (suggestion, user) {
        $http.post('php/a_save_suggestion.php', {
            "suggestion": suggestion,
            "user": user,
            // "mainID": $scope.mainID
        }).success(function (data) {
            if (data == true) {
                init();
                $scope.notice = "Message has been send !!";
            }
        });
    }

    // $scope.selecticd = function (icd, icddesc, drcode, option) {
    //     $scope.icd = icd,
    //         $scope.p2header = icddesc;
    //     $http.post(option, {
    //         "icd": $scope.icd,
    //         "drcode": $scope.drcode
    //     }).success(function (response) {
    //         $scope.eachdata = response;

    //         $scope.gettotal = 0;
    //         $scope.eachdata_rc = $scope.eachdata.length;

    //         for (var i = 0; i < $scope.eachdata.length; i++) {
    //             var sumtotal = $scope.eachdata[i];
    //             $scope.gettotal += (parseFloat(sumtotal.totalall) / $scope.eachdata.length);
    //                          $scope.gettotal = parseInt($scope.gettotal);
    //             $scope.sumtotal10m = (parseInt($scope.gettotal * 0.0009) * 1000);
    //             $scope.sumtotal10p = (parseInt($scope.gettotal * 0.0011) * 1000);
    //         }

    //     });
    // }



});
