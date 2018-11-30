<?php
/**
 * @Author: Marte
 * @Date:   2018-11-29 19:49:59
 * @Last Modified by:   Marte
 * @Last Modified time: 2018-11-29 21:40:30
 */

include 'cont.php';

// include 'ulist2.php';

function car($vcon){
    $sql="SELECT ulist.*,(SELECT car.sum FROM car WHERE car.sid=ulist.SID)'sum' FROM ulist WHERE sid in(SELECT sid FROM car WHERE fid=1)";
    $res=$vcon ->query($sql);
    $arr=$res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($arr,JSON_UNESCAPED_UNICODE);
    // var_dump($arr);
}
car($conn);
?>