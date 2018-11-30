/* 
* @Author: Marte
* @Date:   2018-11-24 10:05:50
* @Last Modified by:   Marte
* @Last Modified time: 2018-11-29 16:41:13
*/
var $data=new Object();

$(function(){
    // xun($('.flist_t'));
    $.ajax({
         url: '../api/ulist2.php',
         type: 'GET',
         dataType: 'text',
         data: {'flag': 's'},
         success:function(arr){
            $data=JSON.parse(arr);
            // console.log($data)
            xun($('.flist_t'));
         }
     })
     .done(function() {
         // console.log("success");
     })
     .fail(function() {
         console.log("error");
     })
     .always(function() {
         // console.log("complete");
     });
     var jg=0;
     $('.list_nav_l li').click(function(event) {
        $('.list_nav_l li').removeClass('paipai');
        // if($(this).attr('class')){}
        var this2=document.getElementById('jg_pai');
        console.log(this2.parentNode.getAttribute('class'));//获取不到class
             
        $(this).addClass('paipai');
     });
 
    
});
function xun(ele){
    ele.html('');
    var data='';
    for(var i=0;i<$data.length;i++){
        data+=`
    <div class="goods" data-sid='${$data[i]['SID']}'>
        <img class="goods_img" src="${$data[i]['URL']}_1.jpg"/>
        <span class="goods_name">${$data[i]['SNAME']}</span>
        <div class="qian_comment">
            <span class="goods_qian fl">￥${$data[i]['PRICE']}</span>
            <span class="goods_comment fr">评论<a href="">40</a>条</span>
        </div>
        <div class="ping">
            <div class="fl"><span>免邮费</span></div>
            <div class="fr"><span>积分</span>0</div>
            <div>
                <p>用户评价</p>
                <span><img src="../css/img/leftyin.jpg" height="9" width="13" alt="" /></span>
                <span class="zhongPing">好好好</span>
                <span><img src="../css/img/rightyin.jpg" height="10" width="14" alt="" /></span>
            </div>
        </div>
    </div>`;

    }
    ele.html(data+data+data);

    //购买
     $('.goods').bind('click',function(){
        // ele.dataset.sid
        location.href='../html/itemDetailed.html?id='+$(this).data("sid"); 
     }); 
}