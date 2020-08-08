<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<!--<meta http-equiv="refresh" content="3;url=http://elyrialibrary.org/wai/mstatus.php" />-->
<meta name="viewport" content="width=300">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<!--<style type="text/css">
.cblue {
	color: #00F;
}
</style>-->


<title>Updated Location</title>
</head>

<body>
<?php

$user_name = "root";
$password = "c0nnect";
$database = "itrequest15";
$server = "localhost";

$eMai=$_POST['eMai'];
$Pho=$_POST['Pho'];
$FNa=$_POST['FNa'];
$LNa=$_POST['LNa'];
$Loc=$_POST['Loc'];
$Dep=$_POST['Dep'];
$PleDes=$_POST['PleDes'];    
    
if (empty($eMai)) {
    echo "Please input email";
    return;
  } elseif (empty($_POST['Loc'])){
    echo "Please input Location";
    return;
  } elseif (empty($_POST['Dep'])){
    echo "Please input Department";
    return;
  } elseif (empty($_POST['PleDes'])){
    echo "Please input Description";
    return;
  } else {
  
    
    $headers = "From: " . strip_tags($_POST['eMai']) . "\r\n";
    $headers .= "Reply-To: ". strip_tags($_POST['eMai']) . "\r\n";

    // Create connection
    $conn = mysqli_connect($server, $user_name, $password, $database);
    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $msg = wordwrap($eMai.'

    '.$PleDes,70);
    mail('it@elyrialibrary.org', $Loc.' ItRequest', $msg, $headers);
    mail($eMai, 'ItRequest', 'Your message has been sent: '.$msg);
    //mail('benjamin.cuson@elyrialibrary.org','test subject','test message')    
    //$sql = "UPDATE staff SET location='$location' WHERE idstaff=$name";
    $sql = "INSERT INTO `itrequest15`.`ticket` (`ProblemDesc`, `User`, `Date_Time`, `Building`, `Dept`, `phone`, `fName`, `lName`, `isResolved`) VALUES ('".addslashes($PleDes)."','".addslashes($eMai)."', NOW(),'".addslashes($Loc)."','".addslashes($Dep)."','".addslashes($Pho)."','".addslashes($FNa)."','".addslashes($LNa)."','OpenSa Ank')";

    if (mysqli_query($conn, $sql)) {
        echo "Your Ticket has been sent"; 
    } else {
        echo "Error updating record: " . mysqli_error($conn);
    }
}
mysqli_close($conn);
?>
<!--<strong class="cblue">IT Internet Explorer</strong><br />
    <span class="cblue"></span>-->

</body>
</html>