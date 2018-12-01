<?php
/**
 * @Author: Marte
 * @Date:   2018-11-30 20:26:35
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-12-01 16:04:02
 */
include 'cont.php';
    $fid=$_GET['fid'];
    $sid=$_GET['sid'];
    $sql="DELETE FROM car WHERE sid = $sid and fid=$fid";
    $res=$conn ->query($sql);
    var_dump($res);
?>