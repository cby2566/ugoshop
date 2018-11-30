/* 
* @Author: Marte
* @Date:   2018-11-29 09:19:25
* @Last Modified by:   Marte
* @Last Modified time: 2018-11-29 17:04:36
*/

$(function(){
    goods_tagName=$('.goods_tagName');
    goods_xiang=$('.goods_xiang');
    goods_Name=$('.goods_Name');
    goods_price= $('.goods_price');
    arrImg=[];  
    xunID(location.search.substring(4,location.search.length));
    
    $('.xia_tag').find('a').on('click',function(){
        $('.xia_tag a').removeClass('asd');
        $(this).addClass('asd');
    });
    // console.log($('.xia_tag').offset(),$(document).scrollTop());
    var stop=$('.xia_tag').offset().top;
    
    $(document).scroll(function(event) {
        if($(document).scrollTop()>=stop){
            $('.xia_tag').addClass('xia_tag_xi');
            // $('.xia_tag').css('display','none');
        }else{
             $('.xia_tag').removeClass('xia_tag_xi');
            // $('.xia_tag').css('display','block');
        }     
    });
    
    var jia=$('#lessBtn');
    var jian=$('#addBtn');
    var shu=$('#goodsNumberInput');
    console.log(jia,jian,shu);
    jia.click(function(event) {
        if(shu.val()!='1'){
            shu.val(parseInt(shu.val())-1);
        }
    });
    jian.click(function(event) {
        shu.val(parseInt(shu.val())+1);
    });
         

});
function xunID(id){
    $.ajax({
        url: '../api/ulist2.php',
        type: 'GET',
        dataType: 'text',
        data: {'flag': 'i','id':id},
        success:function(data){
            var arr=JSON.parse(data);
            // console.log(arr[0]);
            goods_tagName.html(arr[0]['STAG']);
            goods_Name.html(arr[0]['SNAME']);
            goods_xiang.html(arr[0]['SCON']);
            goods_price.html('￥'+arr[0]['PRICE']);
            arrImg.push(arr[0]['URL']+'_1.jpg');
            arrImg.push(arr[0]['URL']+'_2.jpg');
            arrImg.push(arr[0]['URL']+'_3.jpg');
            fangdajing();
        }
    });
}
function fangdajing(){
    //数组假数据，换成你们数据库查询的数据即可
    var arrSmall = arrImg;
    var arrBig = arrImg;
    
    //渲染数据  
    var html='';
    for(var i=0;i<arrSmall.length;i++){
        html+=`<li><img src="${arrSmall[i]}" data-lsrc="${arrSmall[i]}" data-maxSrc="${arrBig[i]}"></li>`;
    }
    // console.log(html);
    $('#MagnifierWrap2 .spec-items ul').html(html);//生成节点
    $('#MagnifierWrap2 .spec-items ul li').eq(0).addClass('on');//第一个li样式为on
    
    //第一个大图的渲染
    var str=`<img class="MagTargetImg" src="${arrSmall[0]}" data-src="${arrBig[0]}">`;
    $('#MagnifierWrap2 .MagnifierMain').html(str);
    
    //调用放大镜插件：传最大盒子id即可
    MagnifierF("MagnifierWrap2");
}