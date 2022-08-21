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
app.controller('registController', function($scope, $http, $timeout) {
    $scope.p2header = '';
    $scope.ID_topic = '';
    $scope.list_memberfromtopic = '';
    // $scope.selecttopic = selecttopic;
    $scope.saveregist = saveregist;
    $scope.editregist = editregist;
    $scope.findgroup=findgroup;
    
    $scope.getmemberfromtopic = getmemberfromtopic;
    $scope.getallmember = getallmember;
    $scope.updateJSON = updateJSON;
    $scope.classgroup = '';
    // init();

    // function init() {
    $scope.list_member = {};
    $scope.list_topic = {};
    $scope.mall = {};
    $scope.mregist = {};
    $scope.regist1_form = true;
    $scope.regist2_form = true;
    // $scope.btn1 = 'Y';

    $scope.Toggle1 = function() {
        // init();
        $('#regist1').slideToggle();
        $('#regist2').css('display', 'none');

    }
    $scope.Toggle2 = function() {
        // init();
        $('#regist2').slideToggle();
        $('#regist1').css('display', 'none');

    }


     findgroup();

    function findgroup() {
        $http.get('php/a_get_class.php').success(function(data) {
            $scope.classgroup = data[0].group_no;
        });
    }
    // $http.get('php/a_get_class.php').success(function(data) {
    //     $scope.classgroup = data[0].group_no;
    // });
    $http.get('php/a_gettopic.php').success(function(data) {
        $scope.list_topic = data;
        $scope.currentPage_topic = 1; //current page
        $scope.entryLimit_topic = 10000; //max no of items to display in a page
        $scope.filteredItems_topic = $scope.list_topic.length; //Initially for no filter  
        $scope.totalItems_topic = $scope.list_topic.length;
    });

    // $http.get('php/a_getmember.php').success(function (data) {
    //     $scope.list_member = data;
    //     $scope.currentPage_member = 1; //current page
    //     $scope.entryLimit_member = 10000; //max no of items to display in a page
    //     $scope.filteredItems_member = $scope.list_member.length; //Initially for no filter  
    //     $scope.totalItems_member = $scope.list_member.length;
    // });
    // }


    // function selecttopic(ID_topic, topic) {
    //     $scope.ID_topic = ID_topic;
    //     $scope.p2header = topic;
    //     // $scope.Toggle2();
    //     // getmemberfromtopic(ID_topic);
    // }
    // $scope.getmemberfromtopic = function (ID_topic, topic) {
    function getmemberfromtopic(ID_topic, topic, classgroup) {
        $scope.ID_topic = ID_topic;
        $scope.p2header = topic;
        $scope.classgroup = classgroup;
        $http.post('php/a_getmemberregist.php', {
            "ID_topic": $scope.ID_topic,
            "classgroup": $scope.classgroup
        }).success(function(data) {
            $scope.mregist = data;
            registUpdated = true;
            getallmember(classgroup);
        });

    }
    function getallmember(classgroup) {
        $scope.classgroup = classgroup;
        $http.post('php/a_getmember.php', {
            "classgroup": $scope.classgroup
        }).success(function(data) {
            $scope.mall = data;
            detailsUpdated = true;
            updateJSON();
        });
    }
    function updateJSON() {
        if (!detailsUpdated || !registUpdated) { return; }

        for (var i = 0; i < $scope.mall.length; i++) {
            for (var j = 0; j < $scope.mregist.length; j++) {
                if ($scope.mall[i].ID == $scope.mregist[j].ID_member) {
                    $scope.mall[i].status = 'R';
                }
            }
        }
        $scope.Toggle2();
    }
    function saveregist(ID_member, ID_topic, topic, classgroup) {
        $scope.ID_topic = ID_topic;
        $scope.topic = topic;
        $scope.classgroup = classgroup;
        $scope.ID_member = ID_member;
        // $scope.Toggle2();
        $http.post('php/a_save_regist.php', {
            "ID_member": $scope.ID_member,
            "topic": $scope.topic,
            "ID_topic": $scope.ID_topic,
            "classgroup": $scope.classgroup
        }).success(function(response) {
            findgroup();
            $scope.Toggle2();
            getmemberfromtopic(ID_topic, topic, classgroup);
        });
    }
    function editregist(ID, ID_topic, topic, classgroup) {
        $scope.ID_topic = ID_topic;
        $scope.topic = topic;
        $scope.classgroup = classgroup;
        $scope.ID = ID;
        // $scope.Toggle2();
        $http.post('php/a_delete_regist.php', {
            "ID": $scope.ID,
            "topic": $scope.topic,
            "ID_topic": $scope.ID_topic,
            "classgroup": $scope.classgroup
        }).success(function(response) {
            findgroup();
            $scope.Toggle2();
            getmemberfromtopic(ID_topic, topic, classgroup);
        });
    }

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
