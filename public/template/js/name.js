
var crudApp = angular.module('crudApp',[]);
crudApp.controller("nameController",['$scope','$http', function($scope,$http){


getname();
function getname(){

$http.post('php/namedetails.php').success(function(data){

$scope.details = data;
});
}


$scope.show_form = true;

$scope.formToggle =function(){
$('#nameform').slideToggle();
$('#nameeditForm').css('display', 'none');
}


$scope.insertname = function(name){
$http.post('php/nameinsert.php',{"name":name.name,"classgroup":name.classgroup,"email":name.email}).success(function(data){
if (data == true) {
getname();
$('#nameform').css('display', 'none');
}
});
}


$scope.deletename = function(name){
$http.post('php/namedelete.php',{"ID":name.ID}).success(function(data){
if (data == true) {
getname();
}
});
}


$scope.currentUser = {};
$scope.editname = function(name){
$scope.currentUser = name;
$('#nameform').slideUp();
$('#nameeditForm').slideToggle();
}



$scope.Updatename = function(name){
$http.post('php/nameupdate.php',{"ID":name.ID,"name":name.name,"classgroup":name.classgroup,"email":name.email}).success(function(data){
$scope.show_form = true;
if (data == true) {
getname();
}
});
}



$scope.updateMsg = function(ID){
$('#nameeditForm').css('display', 'none');
}
}]);