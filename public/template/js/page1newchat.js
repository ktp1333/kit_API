var app = angular.module('myapp', []);

app.controller('page1Controller', function ($scope, $http, $timeout, $location) {
    init();

    function init() {
        $scope.list = {};
        $scope.chat = "";
        $scope.notice = "";
        var url = $location.path();
        var newString = url.replace("/", "");
        // $http.get("index.html?id=" + newString + "")
        //     .success(function (response) { $scope.information = response.driver; });
        $scope.user = newString;
    }

    $scope.inputchat = function (chat, user) {
        $http.post('php/a_save_chat.php', {
            "chat": chat,
            "user": user
        }).success(function (data) {
            if (data == true) {
                $scope.chat = "";
                $scope.user = user;
                $scope.notice = "Message has been send !!";
            }
        });
    }


});
