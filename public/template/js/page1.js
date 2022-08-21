var app = angular.module('myapp', ['ui.bootstrap']);

app.controller('page1Controller', function ($scope, $http, $timeout, $location) {
    init();

    function init() {
        $scope.list = {};
        $scope.chat = "";
        var url = $location.path();
        var newString = url.replace("/", "");
        // $http.get("index.html?id=" + newString + "")
        //     .success(function (response) { $scope.information = response.driver; });
        $scope.user = newString;
        // $scope.newchat_form = true;
        // $scope.showchat_form = true;

        // $scope.Toggle_newchat = function () {
        //     // init();
        //     $('#newchat').slideToggle();
        //     $('#showchat').css('display', 'none');
        // }
        // $scope.Toggle_showchat = function () {
        //     // init();
        //     $('#showchat').slideToggle();
        //     $('#newchat').css('display', 'none');

        // }



        $http.get('php/a_get_chat.php').success(function (data) {
            $scope.list = data;
        });

    }

    // $scope.inputchat = function (chat) {
    //     $http.post('php/a_save_chat.php', {
    //         "chat": chat
    //         // "mainID": $scope.mainID
    //     }).success(function (data) {
    //         if (data == true) {
    //             init();
    //         }
    //     });
    // }


});
