// Application module
var crudApp = angular.module('crudApp',[]);
crudApp.controller("customerController",['$scope','$http', function($scope,$http){

// Function to get member details from the database
getmember();
function getmember(){
// Sending request to EmpDetails.php files 
$http.post('php/memberdetails.php').success(function(data){
// Stored the returned data into scope 
$scope.details = data;
});
}

// Setting default value of NationID 
//$scope.empmember = {'NationID' : 'male'};
// Enabling show_form variable to enable Add member button
$scope.show_form = true;
// Function to add toggle behaviour to form
$scope.formToggle =function(){
$('#memberForm').slideToggle();
$('#editmemberForm').css('display', 'none');
}
$scope.insertmember = function(member){
$http.post('php/memberinsert.php',{"forname":member.forname,"surname":member.surname}).success(function(data){
if (data == true) {
getmember();
$('#memberForm').css('display', 'none');
}
});
}
$scope.deletemember = function(member){
$http.post('php/memberdelete.php',{"ID":member.ID}).success(function(data){
if (data == true) {
getmember();
}
});
}
$scope.currentUser = {};
$scope.editmember = function(member){
$scope.currentUser = member;
$('#memberForm').slideUp();
$('#membereditForm').slideToggle();
}
$scope.Updatemember = function(member){
$http.post('php/memberupdate.php',{"forname":member.forname,"surname":member.surname}).success(function(data){
$scope.show_form = true;
if (data == true) {
getmember();
}
});
}
$scope.updateMsg = function(forname){
$('#membereditForm').css('display', 'none');
}
}]);