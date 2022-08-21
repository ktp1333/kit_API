var app = angular.module('myapp', ['ui.bootstrap']);

app.filter('startFrom', function() {
    return function(input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
app.controller('forumController', function($scope, $http, $timeout) {



    // $scope.p2header = '';
    // $scope.ID_forum = '';
    // $scope.list_memberfromforum = '';
    $scope.getcommentfromforum = getcommentfromforum;
    $scope.insertforumcomment = insertforumcomment;
    // $scope.editforum = editforum;
    // $scope.Toggle1 = Toggle1;
    // $scope.Toggle2 = Toggle2;
    $scope.insertforum = insertforum;
    $scope.getforum = getforum;
    $scope.ID_forum = '';
    $scope.forum = '';
    $scope.classgroup = '';
    $scope.forum = '';
    $scope._by = '';
    $scope.list_forum = {};
    $scope.list_forumcomment = {};
    $scope.forum1_form = true;
    $scope.forum2_form = true;
    $scope.forum3_form = true;
    $scope.forum4_form = true;
    $scope.Toggle1 = function() {

        $('#forum1').slideToggle();
        $('#forum2').css('display', 'none');
        $('#forum3').css('display', 'none');
        $('#forum4').css('display', 'none');
    }
    $scope.Toggle2 = function() {

        $('#forum2').slideToggle();
        $('#forum1').css('display', 'none');
        $('#forum3').css('display', 'none');
        $('#forum4').css('display', 'none');
    }
    $scope.Toggle3 = function() {

        $('#forum3').slideToggle();
        $('#forum1').css('display', 'none');
        $('#forum2').css('display', 'none');
        $('#forum4').css('display', 'none');
    }


    $scope.Toggle4 = function() {

        $('#forum4').slideToggle();
        $('#forum1').css('display', 'none');
        $('#forum2').css('display', 'none');
        $('#forum3').css('display', 'none');
    }
    findgroup();

    function findgroup() {
        $http.get('php/a_get_class.php').success(function(data) {
            $scope.classgroup = data[0].group_no;
        });
    }


    getforum();
    function getforum() {
        $http.get('php/a_getforum.php').success(function(data) {
            $scope.list_forum = data;
            $scope.currentPage_forum = 1; //current page
            $scope.entryLimit_forum = 25; //max no of items to display in a page
            $scope.filteredItems_forum = $scope.list_forum.length; //Initially for no filter  
            $scope.totalItems_forum = $scope.list_forum.length;
            $scope.Toggle1();
        });
    }

    function getcommentfromforum(ID, forum, classgroup) {
        $scope.ID_forum = ID;
        $scope.forum = forum;
        $scope.classgroup = classgroup;
        $http.post('php/a_getmemberfromforum.php', {
            "ID_forum": $scope.ID_forum,
            "forum": $scope.forum,
            "classgroup": $scope.classgroup
        }).success(function(data) {
            $scope.list_forumcomment = data;
            $scope.totalItems_forumcomment = $scope.list_forumcomment.length;
            $scope.Toggle2();

        });

    }
    // function getallmember(classgroup) {
    //     $scope.classgroup = classgroup;
    //     $http.post('php/a_getmember.php', {
    //         "classgroup": $scope.classgroup
    //     }).success(function (data) {
    //         $scope.mall = data;
    //         detailsUpdated = true;
    //         updateJSON();
    //     });
    // }
    // function updateJSON() {
    //     if (!detailsUpdated || !forumUpdated) { return; }

    //     for (var i = 0; i < $scope.mall.length; i++) {
    //         for (var j = 0; j < $scope.mforum.length; j++) {
    //             if ($scope.mall[i].ID == $scope.mforum[j].ID_member) {
    //                 $scope.mall[i].status = 'R';
    //             }
    //         }
    //     }
    //     $scope.Toggle2();
    // }
    function insertforum(forum) {
        $scope.forum = forum.forum;
        $scope._by = forum._by;
        // $scope.Toggle2();
        $http.post('php/a_save_forum.php', {
            "forum": $scope.forum,
            "_by": $scope._by
        }).success(function(response) {
            getforum();
            // $scope.Toggle1();
        });
    }

    function insertforumcomment(forumcomment, ID_forum, forum, classgroup) {
        $scope.comment = forumcomment.comment;
        $scope.ID_forum = ID_forum;
        $scope.forum = forum;
        $scope.classgroup = classgroup;
        $scope._by = forumcomment._by;
        // $scope.Toggle2();
        $http.post('php/a_save_forumcomment.php', {
            "comment": $scope.comment,
            "ID_forum": $scope.ID_forum,
            "commclassgroupent": $scope.classgroup,
            "forum": $scope.forum,
            "_by": $scope._by
        }).success(function(response) {
            getcommentfromforum(ID_forum, forum, classgroup);
            // $scope.Toggle2();
        });
    }

    function viewcomment(forum) {
        $scope.forum = forum.forum;
        $http.post('php/a_getcomment.php', {
            "forum": $scope.forum
        }).success(function(response) {


        });
    }
    // function editforum(ID, ID_forum, forum, classgroup) {
    //     $scope.ID_forum = ID_forum;
    //     $scope.forum = forum;
    //     $scope.classgroup = classgroup;
    //     $scope.ID = ID;
    //     // $scope.Toggle2();
    //     $http.post('php/a_delete_forum.php', {
    //         "ID": $scope.ID,
    //         "forum": $scope.forum,
    //         "ID_forum": $scope.ID_forum,
    //         "classgroup": $scope.classgroup
    //     }).success(function (response) {
    //         findgroup();
    //         $scope.Toggle2();
    //         getmemberfromforum(ID_forum, forum, classgroup);
    //     });
    // }

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function() {
        $timeout(function() {
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };
    $scope.sort_by = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };


});
