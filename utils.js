/**
 * @desc utils for common
 * @author zxk15045 
 */

 // makeRequest
 function makeRequest(url, callback) {
     var httpRequest = new XMLHttpRequest();

     httpRequest.onreadystatechange = function () {
         if (httpRequest.readyState === XMLHttpRequest.DONE) {
             if (httpRequest.status === 200) {
                 callback(null, httpRequest.responseText)
             } else {
                 callback('httpRequest error');
             }
         }
         
     }

     httpRequest.open('GET', url);
     httpRequest.send();
 }

// 单日数据合并为月平均数据
function formatBarData(data) {
    var barData = {
        date: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        bj: [],
        sh: [],
        gz: [],
        max: 0,
        min: 0
    };

    var month = {};

    data.map(function (item) {
        var _d = item['日期'].slice(0, 2);

        _d = parseInt(_d, 10);

        if (!month[_d]) {
            month[_d] = {};
        }

        if (!month[_d]['北京']) {
            month[_d]['北京'] = [];
        }

        if (!month[_d]['上海']) {
            month[_d]['上海'] = [];
        }

        if (!month[_d]['广州']) {
            month[_d]['广州'] = [];
        }

        
        month[_d]['北京'].push(item['北京']);
        
        month[_d]['上海'].push(item['上海']);

        month[_d]['广州'].push(item['广州']);
    });

    var keys = Object.keys(month);

    for (var i=0, len=keys.length; i<len; i++) {
        month[i+1]['北京'].average = average(month[i+1]['北京']);
        month[i+1]['上海'].average = average(month[i+1]['上海']);
        month[i+1]['广州'].average = average(month[i+1]['广州']);

        if (month[i+1]['北京'].average > barData.max) {
            barData.max = month[i+1]['北京'].average;
        }

        if (month[i+1]['上海'].average > barData.max) {
            barData.max = month[i+1]['上海'].average;
        }

        if (month[i+1]['广州'].average > barData.max) {
            barData.max = month[i+1]['广州'].average;
        }

        barData.bj.push(month[i+1]['北京'].average);
        barData.sh.push(month[i+1]['上海'].average);
        barData.gz.push(month[i+1]['广州'].average);
    }

    return barData;   
}

function average(arr) {
    var sum = 0;
    for (var i=0, len=arr.length; i<len; i++) {
        sum += parseInt(arr[i], 10);
    }

    return parseInt(sum / len, 10);
}