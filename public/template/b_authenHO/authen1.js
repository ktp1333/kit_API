var app = angular.module('myApp', []);
app.controller('authenController', function ($scope, $http) {
    $scope.Ward = '';
    $scope.password = '';
    $scope.error = '';
    // $http.post("config/php/get_ward.php", {
    // })
    //     .then(function (response) {
    //         $scope.Ward = response.data;
    //     });

    $scope.login = function (password) {


        // if (password == "admin" ) {
        $scope.error = '';
        $http.post('authenHO/authen.php', {
            "password": password
        }).success(function (data) {

            switch (data.update) {
                case 'a1':
                    window.location = "doctor/index.html";
                    break;
                case 'a2':
                    window.location = "ward/index.html";
                    break;
                case 'a3':
                    window.location = "ward/index1_ward.html#?ward=cashier";
                    break;
                case 'a4':
                    window.location = "ward/index1_ward.html#?ward=pharma";
                    break;
                case 'a5':
                    window.location = "cashier_mobile/index.html";
                    break;
                case 'a6':
                    window.location = "pharma_mobile/index_pharmamobile.html";
                    break;
                case 'a7':
                    window.location = "rep_time/rep_time.html";
                    break;
                default:
                    $scope.error = " incorrected password ";
                    break;
            }
        });
        // } else if ( password == "sup") {
        //     $scope.error = '';
        //     $http.post('authen/authen.php', {
        //         "ward": Ward,
        //         "password": password
        //     }).success(function (data) {

        //     });
        //     window.location = "sup/index_sup.html";

        // } else {
        //     $scope.error = "password incorrect.";
        // }
    }


})