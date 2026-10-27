/*
 * UGOShop 博物馆修复 shim（2026-10）
 * ------------------------------------------------------------------
 * 替代当年依赖 webpack 构建产出的 src/home.js。
 *
 * 事实：webpack.config.js 的输出路径是 src/js/homepage/home.js，
 *      而首页引用的是 src/home.js —— 两条路径从未匹配过，
 *      因此首页在仓库的任何历史时点都不曾靠构建链跑通过。
 *
 * 本文件把 src/js/home.js 的运行时逻辑与 src/js/newMenu.js 的
 * 菜单数据内联为一个普通脚本，彻底摆脱构建工具。
 * 依赖：jquery、common.js 需在本文件之前加载；
 *      页面底部内联脚本定义的 getMenuData() 需在本文件的
 *      setTimeout 回调执行前就绪（时序上必然满足）。
 */

// —— 菜单数据（原样取自 src/js/newMenu.js，2019-07-26 ad3fa4d）——
var UGOSHOP_MENU_DATA = [{
    title: '品质厨房',
    item: ['厨房烹饪', '厨房电器', '餐饮用具', '厨房配件'],
    url: 'newsix_03.png'
},
{
    title: '美食·民生',
    item: ['进口食品', '营养保健', '休闲食品', '粮油干货', '酒水茶饮', '生鲜食品'],
    url: 'newsix_05.png'
},
{
    title: '健康生活',
    item: ['优质睡眠', '收纳用品', '生活用品', '生活电器', '装饰/家居', '健身/户外', '医疗器械'],
    url: 'newsix_07.png'
},
{
    title: '魅力穿戴',
    item: ['男装', '女装', '内衣', '箱包', '鞋子', '配饰', '户外鞋服'],
    url: 'newsix_09.png'
},
{
    title: '珠宝收藏',
    item: ['翡翠玉石', '宝石珍珠', '水晶玛瑙', '时尚饰品', '钟表', '文化收藏'],
    url: 'newsix_13.png'
},
{
    title: '美肤靓妆',
    item: ['面部护理', '洗护护理', '美容仪器', '身体护理', '彩妆香水'],
    url: 'newsix_11.png'
}];

var UGOSHOP_MENU = {
    getMenuData: function () {
        return UGOSHOP_MENU_DATA;
    }
};

// —— 登录状态检测（原样取自 home.js 的 ddenglul）——
function ddenglul() {
    if (Cookie.get('name')) {
        $('.zhucel').html('欢迎尊敬的用户：' + Cookie.get('name'));

        $.ajax({
            url: '../api/car.php',
            type: 'GET',
            dataType: 'text',
            data: { 'flag': 'y', 'x': Cookie.get('name') },
            success: function (data) {
                var su = JSON.parse(data);
                $('.mycart span').text(su.length);
                $('.go_wu_che').text(su.length);
            }
        });

        $('.denglul').html('退出！');
        $('.denglul').removeAttr('href');
        $('.denglul').bind('click', function () {
            Cookie.remove('name');
            location.href = 'homepage.html';
        });
    }
}

// —— 侧边栏交互（原样取自 home.js 的 cbl）——
function cbl() {
    $('.you').mouseover(function (event) {
        $('.zuo div').css('visibility', 'hidden');
        $('.zuo div').eq(event.target.dataset.ce - 1).css('visibility', 'visible');
    });
    $('.you').mouseout(function (event) {
        $('.zuo div').css('visibility', 'hidden');
    });
    $('.you div:eq(1)').click(function (event) {
        lcar();
    });
    $('.you div:eq(3)').click(function (event) {
        $(document).scrollTop(0);
    });
}
function lcar() {
    location.href = '../html/CarCar.html';
}

// —— 页面初始化（对应 home.js 的 jQuery ready；head.carousel 为空实现，不迁移）——
$(function () {
    ddenglul();
    cbl();
});

// —— 喂给页面底部 Vue 数据站（对应 home.js 的 getMenuData(MenuData)）——
setTimeout(function () {
    getMenuData(UGOSHOP_MENU);
});
