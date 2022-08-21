<?php
session_start();
require_once '../php/config.php';


// session_start();
// include('conn/dbconnect.php'); 

// Set session variables
// $_SESSION["ilogin"] = "False";
// $login_name = $_POST['password'];

$data = json_decode(file_get_contents("php://input")); 
$password = mysqli_real_escape_string($con, $data->password);
// $password=$_POST["password"];
// $pwd = base64_encode(md5($_POST['pwd'],true));
require_once '../php/config_HO.php';

$pwd = base64_encode(md5($password,true));
echo $pwd;
// select * from VW_HSLogon where Password ='DX6Fefjcl2rznRgpfh/kyA=='
// select top 10 Password,forename,surname from VW_HSLogon where LoginName ='pichet.j'
// SELECT *  from Careprovider WHERE UID=394


// $strSQL ="select top 10 Password,forename,surname from VW_HSLogon where LoginName ='$password'";
// $stmt = sqlsrv_query( $conn, $strSQL );
// // echo $strSQL;

// if( $stmt === false) {
//     die( print_r( sqlsrv_errors(), true) );
// }
// $arr = array();
// while( $row = sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC) ) {
// $arr[] = $row;	
//    echo $row['Password'].", ".$row['forename'].", ".$row['surname']."<br />";
// }

      
			// foreach($db->query($sql) as $row){	
			//    $HO_Password = $row['Password'];
			//    $forename = $row['forename'];
			//    $surname = $row['surname'];
			// }
			
// if ($HO_Password ==$pwd){
// 	$_SESSION["ilogin"] = "True";
// 	$_SESSION["Longname"] = $forename.' '.$surname;
// 	$_SESSION["forename"] =	$forename;
// 	$_SESSION["surname"] =	$surname;	
// 	header( "location: new_request.php" );
// }else{
// 	$_SESSION["ilogin"] = "False";
// 	header( "location: login.php?u=False" );
// }



// $Ward=$_POST["Ward"];
// $password=$_POST["password"];
// $strSQL = "select * FROM password ";
// $strSQL .="WHERE password = '".$password."'";
// mysqli_query($con, $strSQL);
// echo $strSQL;




// $data = json_decode(file_get_contents("php://input")); 
// $ward = mysqli_real_escape_string($con, $data->ward);
// $password = mysqli_real_escape_string($con, $data->password);

// if (strtoupper($password) =='DR123') {
//       $_SESSION["start"] = "DR123";
//       $json = array('update' => 'a1');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
// } elseif (strtoupper($password) =='WARD') {
//         $_SESSION["start"] = "WARD";
//                     $json = array('update' => 'a2');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
      // header('location:../../index_ward.html#?ward='.$Ward);
//  } elseif (strtoupper($password) =='CASH123') {
//         $_SESSION["start"] = "CASH123";
//    $json = array('update' => 'a3');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
// } elseif (strtoupper($password) =='PHARMA123') {
//         $_SESSION["start"] = "PHARMA123";
//    $json = array('update' => 'a4');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
//     } elseif (strtoupper($password) =='CASHMO') {
//         $_SESSION["start"] = "CASHMO";
//    $json = array('update' => 'a5');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
// } elseif (strtoupper($password) =='PHARMAMO') {
//         $_SESSION["start"] = "PHARMAMO";
//    $json = array('update' => 'a6');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
//         } elseif (strtoupper($password) =='ADMIN') {
//         $_SESSION["start"] = "ADMIN";
//    $json = array('update' => 'a7');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
// } else {
//   $_SESSION["start"] = "";
//        $json = array('update' => 'a0');
//       $jsonstring = json_encode($json);
//         echo $jsonstring;
// }


?>
