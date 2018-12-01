/* 
* @Author: Marte
* @Date:   2018-11-29 14:50:52
* @Last Modified by:   Marte
* @Last Modified time: 2018-11-30 16:53:15
*/
var $data=[];
$(function(){
    daoji();
    fnuxn();
    gongg();
    ddenglul();
    cbl();
    // xun();
    $.ajax({
        url: '../api/ulist2.php',
        type: 'GET',
        dataType: 'text',
        data: {'flag': 's'},
        success:function(arr){
            $data=JSON.parse(arr);
            // console.log($data)
            xun();
        }
    }); 
});
function daoji(){
    var ss=59;
    var mm=24;
    var ser=setInterval(daoji2,1000);
    function daoji2(){
        ss--;
        if(ss==0){ss=59;mm--;}
        $('.live_back').html('<span>00:'+mm+':'+ss+'</span>');
        $('.d_minute').html(mm-2);
        $('.d_second').html(ss-2);
    }
}
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
function xun(){
    var ul=$('.item_list_box ul');
    ul.html('');
    var data='';
    // console.log($data);
         
    for(var i=0;i<$data.length;i++){
        data+=`
            <li>
                <div class="item_box" data-sid='${$data[i]['SID']}'>
                    <div class="item_img" style="background: url(${$data[i]['URL']}_1.jpg) no-repeat;background-size: 100%;"></div>
                    <p class="img_title">${$data[i]['SNAME']}</p>
                    <p class="img_abstract">
                    ${$data[i]['SCON']}</p>
                    <div class="img_qian">
                        <span class="fl img_qian_price"><i>￥</i>${$data[i]['PRICE']}</span>
                        <span class="sale_price">
                            <p>
                                <em>
                                    直降
                                </em>
                            </p>
                            <span>平日价</span><em><i>￥</i>${$data[i]['PRICE']}</em>
                        </span>
                        <span class="fr img_qian_purchased"><i>1970</i>已购买</span>
                    </div>
                </div>
            </li>`;
    }
    ul.html(data+data+data);
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
                $('.mycart span').text(su[0]['su']);
                $('.go_wu_che').text(su[0]['su']);
                
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