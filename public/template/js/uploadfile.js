var app = angular.module('myapp', ['ui.bootstrap']);

// app.filter('startFrom', function() {
//     return function(input, start) {
//         if (input) {
//             start = +start; //parse to int
//             return input.slice(start);
//         }
//         return [];
//     }
// });
app.controller('uploadController', function ($scope, $http, $timeout) {
    $scope.p2header = '';
    $scope.ID_topic = '';
    $scope.list_memberfromtopic = '';
    // $scope.selecttopic = selecttopic;
    $scope.uploadpage2 = uploadpage2;
    // $scope.editupload = editupload;
    // $scope.findgroup=findgroup;

    $scope.listfileupload = listfileupload;
    // $scope.getallmember = getallmember;
    // $scope.updateJSON = updateJSON;
    $scope.classgroup = '';
    // init();

    $scope.fileupload = {};
    $scope.list_member = {};
    $scope.list_topic = {};
    $scope.mall = {};
    $scope.mupload = {};
    $scope.upload1_form = true;
    $scope.upload2_form = true;
    // $scope.btn1 = 'Y';

    $scope.Toggle1 = function () {
        // init();
        $('#upload1').slideToggle();
        $('#upload2').css('display', 'none');
        $('#upload3').css('display', 'none');
    }
    $scope.Toggle2 = function (ID_topic, topic) {
        $scope.ID_topic = ID_topic;
        $scope.topic = topic;
        $('#upload2').slideToggle();
        $('#upload1').css('display', 'none');
        $('#upload3').css('display', 'none');
    }

    $scope.Toggle3 = function () {
        listfileupload()
        $('#upload3').slideToggle();
        $('#upload1').css('display', 'none');
        $('#upload2').css('display', 'none');
    }

    findgroup();

    function findgroup() {
        $http.get('php/a_get_class.php').success(function (data) {
            $scope.classgroup = data[0].group_no;
        });
    }

    function listfileupload() {
        $http.get('php/a_get_fileupload.php').success(function (data) {
            $scope.fileupload = data;
        });
    }


    // $http.get('php/a_get_class.php').success(function(data) {
    //     $scope.classgroup = data[0].group_no;
    // });
    $http.get('php/a_gettopic.php').success(function (data) {
        $scope.list_topic = data;
        $scope.currentPage_topic = 1; //current page
        $scope.entryLimit_topic = 10000; //max no of items to display in a page
        $scope.filteredItems_topic = $scope.list_topic.length; //Initially for no filter  
        $scope.totalItems_topic = $scope.list_topic.length;
    });

    function uploadpage2(ID_topic, topic, classgroup) {
        $scope.ID_topic = ID_topic;
        $scope.topic = topic;
        $scope.classgroup = classgroup;
        // $scope.Toggle2();
        // $http.post('php/a_save_upload.php', {
        //     "ID_member": $scope.ID_member,
        //     "topic": $scope.topic,
        //     "ID_topic": $scope.ID_topic,
        //     "classgroup": $scope.classgroup
        // }).success(function(response) {
        // findgroup();
        $scope.Toggle2($scope.ID_topic, $scope.topic);
        // getmemberfromtopic(ID_topic, topic, classgroup);
        // });
    }
    // function editupload(ID, ID_topic, topic, classgroup) {
    //     $scope.ID_topic = ID_topic;
    //     $scope.topic = topic;
    //     $scope.classgroup = classgroup;
    //     $scope.ID = ID;
    //     // $scope.Toggle2();
    //     $http.post('php/a_delete_upload.php', {
    //         "ID": $scope.ID,
    //         "topic": $scope.topic,
    //         "ID_topic": $scope.ID_topic,
    //         "classgroup": $scope.classgroup
    //     }).success(function(response) {
    //         findgroup();
    //         $scope.Toggle2();
    //         getmemberfromtopic(ID_topic, topic, classgroup);
    //     });
    // }

    // $scope.setPage = function(pageNo) {
    //     $scope.currentPage = pageNo;
    // };
    // $scope.filter = function() {
    //     $timeout(function() {
    //         $scope.filteredItems = $scope.filtered.length;
    //     }, 10);
    // };
    // $scope.sort_by = function(predicate) {
    //     $scope.predicate = predicate;
    //     $scope.reverse = !$scope.reverse;
    // };


});
