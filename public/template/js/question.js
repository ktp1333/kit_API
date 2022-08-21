
var crudApp = angular.module('crudApp',[]);
crudApp.controller("questionController",['$scope','$http', function($scope,$http){


getquestion();
function getquestion(){

$http.post('php/questiondetails.php').success(function(data){

$scope.details = data;
});
}


$scope.show_form = true;

$scope.formToggle =function(){
$('#questionform').slideToggle();
$('#questioneditForm').css('display', 'none');
}


$scope.insertquestion = function(QA){
$http.post('php/questioninsert.php',{"question":QA.question,"q1":QA.q1,"q2":QA.q2,"q3":QA.q3,"q4":QA.q4,"q5":QA.q5}).success(function(data){
if (data == true) {
getquestion();
$('#questionform').css('display', 'none');
}
});
}


$scope.deletequestion = function(QA){
$http.post('php/questiondelete.php',{"ID":QA.ID}).success(function(data){
if (data == true) {
getquestion();
}
});
}


$scope.currentUser = {};
$scope.editquestion = function(QA){
$scope.currentUser = QA;
$('#questionform').slideUp();
$('#questioneditForm').slideToggle();
}



$scope.Updatequestion = function(QA){
$http.post('php/questionupdate.php',{"ID":QA.ID,"question":QA.question,"q1":QA.q1,"q2":QA.q2,"q3":QA.q3,"q4":QA.q4,"q5":QA.q5,"status":QA.status}).success(function(data){
$scope.show_form = true;
if (data == true) {
getquestion();
}
});
}



$scope.updateMsg = function(ID){
$('#questioneditForm').css('display', 'none');
}
}]);