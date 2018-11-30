/* 
* @Author: Marte
* @Date:   2018-11-29 19:28:17
* @Last Modified by:   Marte
* @Last Modified time: 2018-11-29 22:21:14
*/
var $data=new Array();
$(function(){

// card.html('<p style="height:200px;width:800px;text-align:center;line-height:200px;font-size:36px;">没有任何商品</p>');

$.ajax({
    url: '../api/car.php',
    type: 'GET',
    dataType: 'text',
    data: {'flag': 'g'},
    success:function(data){
        $data=JSON.parse(data);
        xun($data);
    }
});

});
function xun(data){
    var card=$('.cart_split');
    card.html('');
    var di=dian(card);
    // console.log(data);
    
    var arr="";
    for(var i=0;i<data.length;i++){
        arr+=`<div class="shopping_con clearfix" data-role="product" data-attr="" data-sid="${data[i]['SID']}">
                    <div class="c_meg">
                        <dl>
                            <dt>
                                <a href="javascript:;">
                                    <img src="${data[i]['URL']}_1.jpg" width="78" height="78">
                                </a>
                            </dt>
                            <dd>
                                <p class="m_tit"><a href="javascript:;">${data[i]['SNAME']}</a></p>
                            </dd>
                        </dl>
                </div>
                <div class="c_price">
                    <p class="c_price_num">¥<i>${data[i]['PRICE']}</i></p>
                </div>
                <div class="c_quantity">
                    <div class="c_amount clearfix">
                        <a class="jian" href="javascript:void(0)">-</a>
                        <input type="text" name="amt" value="${data[i]['sum']}">
                        <a class="jia" href="javascript:void(0)">+</a>
                    </div>
                </div>
                <div class="c_sum">
                    <p>¥<i>${parseInt(data[i]['PRICE'])*parseInt(data[i]['sum'])}</i></p>
                </div>
                <div class="c_action">
                    <i class="i_del" data-role="del">删除</i>
                </div>
                <div class="c_check">
                    <input data-role="product" type="checkbox" checked="checked"></div>
                </div>`;
    }
    card.html(di+arr);
    Sclick();

    hei();//求和
    
    $('.shopping_con :checked').click(function(event) {
        hei();
    });
    
    $('.c_piece i').text($('.shopping_con :checked').length);
    // console.log($('.c_sum i'));
    // console.log($('.c_amount input'));
}

function dian(ele){
    var data2=`<div class="cart_split_tt">
                    <input type="checkbox" data-role="block" target="ec" checked="checked">
                    <i class="icon_home"></i>
                    <label>优品惠自营</label>
                    <span>满168包邮</span>
                </div>`;
    // ele.html(data2);
    // console.log($('.cart_split_tt'));
         
    return data2;
}
function Sclick(){
    // var shu=$('.c_quantity input');
    $('.jian').click(function(event) {
         var shu=$(this).parent().find('input');
         var sum=$(this).parent().parent().parent().find('.c_sum i');
         var dan=$(this).parent().parent().parent().find('.c_price_num i');
        if(shu.val()!='1'){
            shu.val(parseInt(shu.val())-1);
            sum.text(parseInt(shu.val())*parseInt(dan.text()));
            hei();
        }
    });

    $('.jia').click(function(event) {
        var shu=$(this).parent().find('input');
         var sum=$(this).parent().parent().parent().find('.c_sum i');
         var dan=$(this).parent().parent().parent().find('.c_price_num i');
        shu.val(parseInt(shu.val())+1);
        sum.text(parseInt(shu.val())*parseInt(dan.text()));
        hei();
    });
}
function hei(){
    var hei=$('.c_sum i');
    // console.log($('.shopping_con :checked'))
    hei=$('.shopping_con :checked').parent().parent().find('.c_sum i');
    var ns=0;
    for(var i=0;i<hei.length;i++){
        ns+=Number(hei.eq(i).text());
    }
    document.querySelector('.c_paid i').innerHTML=ns-10;
    document.querySelector('.fs_14').innerHTML=ns;
    return ns;
}