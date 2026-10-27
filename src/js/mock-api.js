/*
 * UGOShop 博物馆 mock 数据层（2026-10）
 * ------------------------------------------------------------------
 * 原项目的 19 处 $.ajax 全部指向 src/api/*.php（PHP+MySQL 已随环境消亡）。
 * 本文件在浏览器端拦截这些请求，用 localStorage 模拟当年的数据库，
 * 让注册→登录→浏览→加购→购物车 的完整流程在纯静态环境下复活。
 *
 * 使用：在 jQuery 之后、业务 JS 之前加载本文件，其余零改动。
 * 状态：localStorage
 *   ugoshop.mock.users   [{fname, pws, fid}]     对应 f_user 表
 *   ugoshop.mock.cart    [{sid, fid, sum}]       对应 car 表
 *   ugoshop.mock.nextFid Number                   fid 自增指针
 * 商品数据内联在本文件（对应 ulist 表）。
 *
 * 复刻要点（与原 PHP 逐条对齐）：
 *   - login.php?fname=X            → 用户存在返回明文密码（前端比对），否则 'no'
 *   - login.php?fname=X&psw=Y      → INSERT 用户，返回 'ok'
 *   - getfid.php?fname=X           → 返回数字 fid 字符串；用户不存在返回空串
 *   - ulist2.php?flag=s/i/d        → 全部商品 / 按SID / LIMIT page,6 分页
 *   - addCar.php?flag=用户名&sid=N → 已在购物车返回购物车行 JSON，否则字符串 'string'
 *   - car.php?flag=g               → 用户名 → 购物车商品联表 JSON（ulist.* + sum + fid）
 *   - car.php?flag=y               → 用户名 → 购物车行数（badge 用）
 *   - car.php?flag=jia             → fid=商品SID, yoy=用户名（UPDATE sum）★
 *   - car.php?flag=news            → fid=商品SID, yoy=数字fid（INSERT）★
 *     ★ 两个分支对 yoy 的语义不同，系原代码真实行为，按原样复刻
 *   - del.php?fid=数字fid&sid=N    → DELETE，返回 'bool(true)'
 *
 * 另：foodList 页的 ahj()/ahj2() 初始化调用在业务代码中被注释，
 * 本文件在 DOM ready 后代为激活（业务代码零改动）。
 */

(function () {
    if (typeof jQuery === 'undefined') {
        console.warn('[ugoshop-mock] 未检测到 jQuery，mock 层未生效');
        return;
    }

    // ------------------------------------------------------------------
    // 商品数据（对应 ulist 表；图片复用仓库现存 goods2~goods6 三图组）
    // ------------------------------------------------------------------
    var PRODUCTS = [
        { SID: 1,  SNAME: '美的电压力饭煲 4L 智能预约',        STAG: '美的',     PRICE: 299,  URL: '../img/goods2', SCON: '一锅双胆，24小时智能预约，聚能厚釜内胆，煮饭煲汤炖肉样样在行。' },
        { SID: 2,  SNAME: '德国不锈钢刀具七件套',              STAG: '双立人',   PRICE: 399,  URL: '../img/goods3', SCON: '德标不锈钢锻造，一体成型刀柄，锋利耐用不生锈，含刀架收纳。' },
        { SID: 3,  SNAME: '进口澳洲安格斯牛排 10片装',         STAG: '优品生鲜', PRICE: 158,  URL: '../img/goods4', SCON: '谷饲300天，原肉整切非拼接，-38℃急冻锁鲜，顺丰冷链直达。' },
        { SID: 4,  SNAME: '荞麦枕头 护颈椎助睡眠',             STAG: '睡眠博士', PRICE: 129,  URL: '../img/goods5', SCON: '天然荞麦壳填充，可调节高度，贴合颈部曲线，透气散热睡得香。' },
        { SID: 5,  SNAME: '女士真皮单肩小方包',                STAG: '皮尔卡丹', PRICE: 499,  URL: '../img/goods6', SCON: '头层牛皮，复古五金件，大容量多隔层，通勤约会两相宜。' },
        { SID: 6,  SNAME: '天然翡翠手镯 冰种飘花',             STAG: '玉翠山庄', PRICE: 1299, URL: '../img/goods2', SCON: '缅甸老坑料，冰种起荧，飘阳绿花，附权威鉴定证书，支持复检。' },
        { SID: 7,  SNAME: '玻尿酸补水面膜 30片',              STAG: '优品美肤', PRICE: 89,   URL: '../img/goods3', SCON: '小分子玻尿酸+神经酰胺，深层补水修护屏障，敏感肌可用。' },
        { SID: 8,  SNAME: '全自动家用咖啡机',                  STAG: '德龙',     PRICE: 899,  URL: '../img/goods4', SCON: '15bar意式萃取，现磨现煮，奶泡一体，在家喝出咖啡馆的味道。' },
        { SID: 9,  SNAME: '泰国香米 10斤装',                   STAG: '金象牌',   PRICE: 79,   URL: '../img/goods5', SCON: '泰国原装进口，茉莉香米，米粒修长，蒸煮后香气扑鼻软糯回甘。' },
        { SID: 10, SNAME: '轻奢男士石英手表',                  STAG: '天王表',   PRICE: 699,  URL: '../img/goods6', SCON: '进口机芯，蓝宝石镜面，316L精钢表壳，商务休闲皆可佩戴。' },
        { SID: 11, SNAME: '空气炸锅 大容量 5L',               STAG: '飞利浦',   PRICE: 499,  URL: '../img/goods2', SCON: '高速热风循环，无油低脂，炸鸡翅薯条一键搞定，可拆洗易清洁。' },
        { SID: 12, SNAME: '纯棉四件套 贡缎床上用品',           STAG: '水星家纺', PRICE: 259,  URL: '../img/goods3', SCON: '60支长绒棉贡缎，丝滑亲肤，活性印染不掉色，赠同款枕芯一对。' },
        { SID: 13, SNAME: '智能体脂秤 APP互联',               STAG: '小米',     PRICE: 99,   URL: '../img/goods4', SCON: '高精度BIA生物电阻测量，13项身体数据，全家共享健康档案。' },
        { SID: 14, SNAME: '精致骨瓷餐具 56头',                STAG: '红叶瓷器', PRICE: 459,  URL: '../img/goods5', SCON: '高温骨瓷，釉中彩工艺，铅镉溶出达标，礼盒装婚庆乔迁佳品。' },
        { SID: 15, SNAME: '山茶花洗护套装 滋润修护',          STAG: '阿道夫',   PRICE: 139,  URL: '../img/goods6', SCON: '山茶花精粹，氨基酸温和配方，洗护一套，留香48小时。' },
        { SID: 16, SNAME: '保温杯 316不锈钢 500ml',           STAG: '膳魔师',   PRICE: 159,  URL: '../img/goods2', SCON: '316L医用级不锈钢，真空断热，保温12小时保冷24小时。' },
        { SID: 17, SNAME: '橄榄油 特级初榨 750ml×2',          STAG: '贝蒂斯',   PRICE: 128,  URL: '../img/goods3', SCON: '西班牙原瓶进口，第一道冷榨，酸度≤0.4%，凉拌煎炒皆宜。' },
        { SID: 18, SNAME: '运动蓝牙耳机 挂颈式',              STAG: '索尼',     PRICE: 349,  URL: '../img/goods4', SCON: '磁吸入耳，重低音炮，IPX5防水，运动佩戴稳固不脱落。' },
        { SID: 19, SNAME: '珍珠项链 淡水正圆强光',            STAG: '御木本',   PRICE: 899,  URL: '../img/goods5', SCON: '7.5-8mm正圆强光珍珠，18K金扣，附珍珠分级证书。' },
        { SID: 20, SNAME: '收纳箱三件套 可折叠',              STAG: '爱丽思',   PRICE: 109,  URL: '../img/goods6', SCON: '加厚牛津布，钢架支撑，可折叠收纳，衣物玩具杂物全能装。' }
    ];

    // ------------------------------------------------------------------
    // localStorage 状态（对应 f_user / car 两张表）
    // ------------------------------------------------------------------
    var K_USERS = 'ugoshop.mock.users';
    var K_CART = 'ugoshop.mock.cart';
    var K_NEXT = 'ugoshop.mock.nextFid';

    function load(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }
    function save(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }

    // 首次进入时播种：演示账号 123/123456（详情页 getfid 硬编码查询 '123'，必须存在）
    if (load(K_USERS, null) === null) {
        save(K_USERS, [
            { fname: '123',  pws: '123456', fid: 1 },
            { fname: 'demo', pws: '123456', fid: 2 }
        ]);
        save(K_CART, [
            { sid: 2, fid: 1, sum: 1 },
            { sid: 5, fid: 1, sum: 2 }
        ]);
        save(K_NEXT, 3);
    }

    function users() { return load(K_USERS, []); }
    function cart()  { return load(K_CART, []); }
    function findUserByName(name) {
        var list = users();
        for (var i = 0; i < list.length; i++) {
            if (list[i].fname === name) return list[i];
        }
        return null;
    }
    function findUserByFid(fid) {
        var list = users();
        for (var i = 0; i < list.length; i++) {
            if (list[i].fid === Number(fid)) return list[i];
        }
        return null;
    }
    function findProduct(sid) {
        for (var i = 0; i < PRODUCTS.length; i++) {
            if (PRODUCTS[i].SID === Number(sid)) return PRODUCTS[i];
        }
        return null;
    }

    // ------------------------------------------------------------------
    // 各接口处理函数：params 为查询参数对象，返回值为响应字符串
    // ------------------------------------------------------------------
    var handlers = {

        'login.php': function (p) {
            var fname = p.fname, psw = p.psw;
            if (psw !== undefined) {
                // 注册（原 PHP 无条件 INSERT；此处对已存在用户名跳过，避免演示数据被刷乱）
                if (!findUserByName(fname)) {
                    var list = users();
                    list.push({ fname: fname, pws: psw, fid: load(K_NEXT, 1) });
                    save(K_USERS, list);
                    save(K_NEXT, load(K_NEXT, 1) + 1);
                }
                return 'ok';
            }
            // 用户名检查：存在则返回明文密码（前端比对——原样复刻 2018 年的实现）
            var u = findUserByName(fname);
            return u ? u.pws : 'no';
        },

        'getfid.php': function (p) {
            var u = findUserByName(p.fname);
            return u ? String(u.fid) : '';
        },

        'ulist2.php': function (p) {
            if (p.flag === 's') {
                return JSON.stringify(PRODUCTS);
            }
            if (p.flag === 'i') {
                var item = findProduct(p.id);
                return JSON.stringify(item ? [item] : []);
            }
            if (p.flag === 'd') {
                var offset = Number(p.page || 0);
                var slice = offset >= 0 ? PRODUCTS.slice(offset, offset + 6) : [];
                return JSON.stringify(slice);
            }
            return '[]';
        },

        'addCar.php': function (p) {
            var u = findUserByName(p.flag);
            if (!u) return 'string';
            var rows = cart();
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].sid === Number(p.sid) && rows[i].fid === u.fid) {
                    return JSON.stringify(rows[i]);
                }
            }
            return 'string';
        },

        'car.php': function (p) {
            if (p.flag === 'g') {
                // 购物车联表：ulist.* + sum + fid
                var u1 = findUserByName(p.fid);
                if (!u1) return '[]';
                var out = [];
                var rows1 = cart();
                for (var i = 0; i < rows1.length; i++) {
                    if (rows1[i].fid !== u1.fid) continue;
                    var prod = findProduct(rows1[i].sid);
                    if (!prod) continue;
                    var row = {};
                    for (var k in prod) row[k] = prod[k];
                    row.sum = rows1[i].sum;
                    row.fid = u1.fid;
                    out.push(row);
                }
                return JSON.stringify(out);
            }
            if (p.flag === 'y') {
                // badge：返回购物车行数组，前端取 length
                var u2 = findUserByName(p.x);
                if (!u2) return '[]';
                var rows2 = cart().filter(function (r) { return r.fid === u2.fid; });
                return JSON.stringify(rows2.map(function (r) { return { fid: r.fid }; }));
            }
            if (p.flag === 'jia') {
                // UPDATE：fid=商品SID，yoy=用户名
                var u3 = findUserByName(p.yoy);
                if (u3) {
                    var rows3 = cart();
                    for (var j = 0; j < rows3.length; j++) {
                        if (rows3[j].sid === Number(p.fid) && rows3[j].fid === u3.fid) {
                            rows3[j].sum = Number(p.x);
                            save(K_CART, rows3);
                            break;
                        }
                    }
                }
                return 'bool(true)';
            }
            if (p.flag === 'news') {
                // INSERT：fid=商品SID，yoy=数字 fid（原样复刻）
                var rows4 = cart();
                rows4.push({ sid: Number(p.fid), fid: Number(p.yoy), sum: Number(p.x) });
                save(K_CART, rows4);
                return 'bool(true)';
            }
            return 'bool(false)';
        },

        'del.php': function (p) {
            var rows = cart().filter(function (r) {
                return !(r.sid === Number(p.sid) && r.fid === Number(p.fid));
            });
            save(K_CART, rows);
            return 'bool(true)';
        }
    };

    // ------------------------------------------------------------------
    // Monkey patch $.ajax：命中 api/*.php 的请求走 mock，其余放行
    // ------------------------------------------------------------------
    var _ajax = $.ajax;

    function handleMock(opts) {
        var m = opts.url.match(/api\/([A-Za-z0-9_]+\.php)/);
        var file = m ? m[1] : '';
        var fn = handlers[file];

        var params = {};
        if (opts.data && typeof opts.data === 'object') {
            for (var key in opts.data) params[key] = String(opts.data[key]);
        }

        var resp;
        if (fn) {
            // 状态变更同步落盘（注册后立即跳转页面的场景不丢数据）
            resp = fn(params);
        } else {
            resp = '';
        }

        // success 回调异步触发，模拟真实 AJAX 时序
        setTimeout(function () {
            if (typeof opts.success === 'function') {
                opts.success(resp, 'success', { responseText: resp });
            }
            if (typeof opts.complete === 'function') {
                opts.complete({ responseText: resp }, 'success');
            }
        }, 0);

        return { mock: true };
    }

    $.ajax = function (url, settings) {
        var opts;
        if (typeof url === 'string') {
            opts = settings || {};
            opts.url = opts.url || url;
        } else {
            opts = url || {};
        }
        if (opts.url && /api\/(login|car|addCar|del|getfid|ulist2)\.php/.test(opts.url)) {
            return handleMock(opts);
        }
        return _ajax.apply($, arguments);
    };

    // ------------------------------------------------------------------
    // 激活 foodList 页被注释的初始化（ahj/ahj2 为业务代码中的全局函数）
    // ------------------------------------------------------------------
    jQuery(function () {
        if (typeof ahj === 'function' && jQuery('.flist_t').length) {
            ahj();
        }
        if (typeof ahj2 === 'function' && jQuery('#P_fan').length) {
            ahj2();
        }
    });

    console.log('[ugoshop-mock] 已启用：接口模拟 + localStorage 数据库（演示账号 123 / 123456）');
})();
