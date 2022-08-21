var app = angular.module('myapp', ['ui.bootstrap']);
app.controller('downloadController', function ($scope, $http, $timeout, $location) {
    var url = $location.path();
    var newString = url.replace("/", "");
    // $http.get("index.html?id=" + newString + "")
    //     .success(function (response) { $scope.information = response.driver; });
    $scope.user = newString;
    $scope.p2header = '';
    $scope.ID_topic = '';
    $scope.topic = '';
    $scope.listfiledownload = listfiledownload;
    $scope.listfile = listfile;
    $scope.findgroup = findgroup;
    $scope.classgroup = '';

    $scope.filedownload = {};
    $scope.list_member = {};
    $scope.list_topic = {};

    $scope.selectfiledownload = {};
    $scope.download1_form = true;
    $scope.download2_form = true;


    $scope.Toggle1 = function () {
        $('#download1').slideToggle();
        $('#download2').css('display', 'none');

    }

    $scope.Toggle2 = function () {
        // $scope.topic = topic;
        $('#download2').slideToggle();
        $('#download1').css('display', 'none');
    }

    $scope.Toggle3 = function () {
        listfiledownload();


    }


    findgroup();

    function findgroup() {
        $http.get('php/a_get_class.php').success(function (data) {
            $scope.classgroup = data[0].group_no;
        });
    }

    function listfiledownload() {
        $http.get('php/a_get_fileupload.php').success(function (data) {
            $scope.selectfiledownload = data;
            $scope.ID_topic = '';
            $scope.topic = '';
            $scope.Toggle2();
            $scope.Toggle2();
        });
    }



    $http.get('php/a_gettopic.php').success(function (data) {
        $scope.list_topic = data;
        $scope.currentPage_topic = 1; //current page
        $scope.entryLimit_topic = 10000; //max no of items to display in a page
        $scope.filteredItems_topic = $scope.list_topic.length; //Initially for no filter  
        $scope.totalItems_topic = $scope.list_topic.length;
    });

    function listfile(ID_topic, topic, classgroup) {
        $scope.ID_topic = ID_topic;
        $scope.topic = topic;
        $scope.classgroup = classgroup;
        $http.post('php/a_get_selectfiledownload.php', {
            "topic": $scope.topic,
            "ID_topic": $scope.ID_topic,
            "classgroup": $scope.classgroup
        }).success(function (data) {
            $scope.selectfiledownload = data;

            //  $scope.topic = data[0].topic;
            $scope.Toggle2();

        });
    }

});
