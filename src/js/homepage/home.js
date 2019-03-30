/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/home.js":
/*!************************!*\
  !*** ./src/js/home.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* \r\n* @Author: Marte\r\n* @Date:   2018-11-29 14:50:52\r\n* @Last Modified by:   Marte\r\n* @Last Modified time: 2018-12-01 15:21:25\r\n*/\nvar $data = [];\n$(function () {\n    //daoji();\n    fnuxn();\n    gongg();\n    ddenglul();\n    cbl();\n    // xun();\n    // $.ajax({\n    //     url: '../api/ulist2.php',\n    //     type: 'GET',\n    //     dataType: 'text',\n    //     data: {'flag': 's'},\n    //     success:function(arr){\n    //         $data=JSON.parse(arr);\n    //         // console.log($data)\n    //\n    //         //xun(); 3月28日\n    //     }\n    // });\n});\nfunction daoji() {\n    var ss = 59;\n    var mm = 24;\n    var ser = setInterval(daoji2, 1000);\n    function daoji2() {\n        ss--;\n        if (ss == 0) {\n            ss = 59;mm--;\n        }\n        $('.live_back').html('<span>00:' + mm + ':' + ss + '</span>');\n        $('.d_minute').html(mm - 2);\n        $('.d_second').html(ss - 2);\n    }\n}\nfunction fnuxn() {\n    $('.d_next').click(function (event) {\n        if ($('.everyLun ul').css('left') == '0px') {\n            $('.everyLun ul').animate({ 'left': '-473px' }, 1000, function () {});\n        } else {\n            $('.everyLun ul').animate({ 'left': '0px' }, 1000, function () {});\n        }\n    });\n    $('.d_prev').click(function (event) {\n        document.getElementsByClassName('d_next')[0].click();\n    });\n}\n\nfunction gongg() {\n    $('.notice ul').animate({ 'top': '-140px' }, 4000, function () {\n        $('.notice ul').animate({ 'top': '-28px' }, 1000, function () {\n            gongg();\n        });\n    });\n}\nfunction ddenglul() {\n    if (Cookie.get('name')) {\n        $('.zhucel').html('欢迎尊敬的用户：' + Cookie.get('name'));\n\n        $.ajax({\n            url: '../api/car.php',\n            type: 'GET',\n            dataType: 'text',\n            data: { 'flag': 'y', 'x': Cookie.get('name') },\n            success: function success(data) {\n                var su = JSON.parse(data);\n                $('.mycart span').text(su.length);\n                $('.go_wu_che').text(su.length);\n            }\n        });\n\n        $('.denglul').html('退出！');\n        $('.denglul').removeAttr('href');\n        $('.denglul').bind('click', function () {\n            Cookie.remove('name');\n\n            location.href = 'homepage.html';\n        });\n    }\n}\nfunction cbl() {\n    $('.you').mouseover(function (event) {\n        // console.log(event.target.dataset.ce);\n        $('.zuo div').css('visibility', 'hidden');\n        $('.zuo div').eq(event.target.dataset.ce - 1).css('visibility', 'visible');\n    });\n    $('.you').mouseout(function (event) {\n        /* Act on the event */\n        $('.zuo div').css('visibility', 'hidden');\n    });\n    $('.you div:eq(1)').click(function (event) {\n        /* Act on the event */\n        console.log(event.target);\n        lcar();\n    });\n    $('.you div:eq(3)').click(function (event) {\n        /* Act on the event */\n        console.log(event.target);\n        $(document).scrollTop(0);\n    });\n}\nfunction lcar() {\n    location.href = '../html/CarCar.html';\n}\n\n//# sourceURL=webpack:///./src/js/home.js?");

/***/ }),

/***/ 0:
/*!******************************!*\
  !*** multi ./src/js/home.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! E:\\other\\for\\ugoshop/src/js/home.js */\"./src/js/home.js\");\n\n\n//# sourceURL=webpack:///multi_./src/js/home.js?");

/***/ })

/******/ });