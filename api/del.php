<?php
/**
 * @Author: Marte
 * @Date:   2018-11-30 20:26:35
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-11-30 20:27:28
 */
include 'cont.php';

function jial($vcon,$ff){
    $sql="SELECT * FROM car WHERE car.sid=12 and car.fid in(SELECT f_user.fid FROM f_user WHERE f_user.fname='$ff')";
    $res=$vcon ->query($sql);
    
    // echo json_encode($arr[0],JSON_UNESCAPED_UNICODE);
    var_dump($res);
}
?>