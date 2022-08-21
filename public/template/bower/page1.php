<?php
// Including database connections
require_once 'config.php'; 
// mysqli query to fetch all data from database
$query = "SELECT location,pt from rt_opd ";
// $result = mysqli_query($con, $query);
// $arr = array();
// if(mysqli_num_rows($result) != 0) {
// 	while($row = mysqli_fetch_assoc($result)) {
// 			$arr[] = $row;
// 	}
// }
// // Return json array containing data from the database
// echo $json_info = json_encode($arr);



$result = $mysqli->query($query) or die($mysqli->error.__LINE__);

$arr = array();
if($result->num_rows > 0) {
	while($row = $result->fetch_assoc()) {
		$arr[] = $row;	
	}
}
# JSON-encode the response
$json_response = json_encode($arr);

// # Return the response
echo $json_response;
?>