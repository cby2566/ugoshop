/* 
* @Author: Marte
* @Date:   2018-11-29 14:50:52
* @Last Modified by:   Marte
* @Last Modified time: 2018-12-01 15:21:25
*/
//require('../css/homepage.css');
//require('../css/homepage_main.css');
//import '../css/homepage_main.css';

//import '../css/homepage_main.css';
//import '../css/homepage.css';//这里的相对路径，有点不清楚;下面的JS也是

import '../sass/homepage_main.scss';
import '../sass/homepage.scss';

import '../sass/module7.scss'
import {firstName} from '../js/module7.js';//是用的当前的js的相对路径，打包后自动转换了吧
console.log(firstName);
import head from '../js/adNav.js';//html所在的目录，跳到这里

$(function(){
    //fnuxn();
    //gongg();
    ddenglul();
    cbl();

    head.carousel();
});
function fnuxn(){
    $('.d_next').click(function(event) {
        if($('.everyLun ul').css('left')=='0px'){
            $('.everyLun ul').animate({'left': '-473px'},
            1000, function(){});
        }else{
            $('.everyLun ul').animate({'left': '0px'},
            1000, function(){});
        } 
    });
    $('.d_prev').click(function(event) {
        document.getElementsByClassName('d_next')[0].click();
    });
}

function gongg(){
    $('.notice ul').animate({'top':'-140px'}, 4000,function(){
        $('.notice ul').animate({'top':'-28px'}, 1000,function(){
            gongg();
        });
    });
}
function ddenglul(){
    if(Cookie.get('name')){
        $('.zhucel').html('欢迎尊敬的用户：'+Cookie.get('name'));

        $.ajax({
            url: '../api/car.php',
            type: 'GET',
            dataType: 'text',
            data: {'flag': 'y','x':Cookie.get('name')},
            success:function(data){
                var su=JSON.parse(data);
                $('.mycart span').text(su.length);
                $('.go_wu_che').text(su.length);
                
            }
        });

        $('.denglul').html('退出！');
        $('.denglul').removeAttr('href');
        $('.denglul').bind('click',function(){
            Cookie.remove('name');

            location.href='homepage.html';
        });
    }
}
function cbl(){
    $('.you').mouseover(function(event) {
        // console.log(event.target.dataset.ce);
        $('.zuo div').css('visibility','hidden');
        $('.zuo div').eq(event.target.dataset.ce-1).css('visibility','visible');
             
    });
    $('.you').mouseout(function(event) {
        /* Act on the event */
        $('.zuo div').css('visibility','hidden');
    });
    $('.you div:eq(1)').click(function(event) {
        /* Act on the event */
        console.log(event.target);
        lcar();
    });
    $('.you div:eq(3)').click(function(event) {
        /* Act on the event */
        console.log(event.target);
        $(document).scrollTop(0);
    });
}
function lcar(){
    location.href='../html/CarCar.html';
}