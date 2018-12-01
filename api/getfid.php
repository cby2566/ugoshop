<?php
/**
 * @Author: Marte
 * @Date:   2018-12-01 16:00:45
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-12-01 16:06:51
 */
include 'cont.php';
    $fname=$_GET['fname'];
    $sql="SELECT fid FROM f_user WHERE fname ='$fname'";
    $res=$conn ->query($sql);
    $res3=$res->fetch_row();
    echo $res3[0];
?>