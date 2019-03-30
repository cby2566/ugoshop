<?php
/**
 * @Author: Marte
 * @Date:   2018-11-30 17:41:49
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-11-30 20:46:03
 */
include 'cont.php';

function jial($vcon,$ff,$sid){
    $sql="SELECT * FROM car WHERE car.sid='$sid' and car.fid in(SELECT f_user.fid FROM f_user WHERE f_user.fname='$ff')";
    $res=$vcon ->query($sql);
    $arr=$res->fetch_all(MYSQLI_ASSOC);
    if(count($arr)){
        echo json_encode($arr[0],JSON_UNESCAPED_UNICODE);
    }else{
        echo "string";
    }
    
}
jial($conn,$_GET['flag'],$_GET['sid']);
?>