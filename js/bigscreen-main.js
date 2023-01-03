var carAndGoodsStatis;
var timerSecond = 15000;
var contextPath;
var intelligentWarehouseUrl;
var garageIntervalCurrentIndex = 0;
var locationIntervalCurrentIndex = 0;
var garageIdArr = [];
var locationArr = [];
// 车位使用率自动切换定时器数组
var intervalArr = [];
/**
 * 初始化方法
 */
$(document).ready(function () {
    contextPath = $("#contextPath").val();
    intelligentWarehouseUrl = $("#intelligentWarehouseUrl").val();
    // 加载台账信息
    loadGoodsInfo("0.4KV");
    //使用率仪表标题
    var title = "使用率";
    $("#useRate1").lu_word(title);
    $("#useRate2").lu_word(title);
    // 加载左边车辆使用率
    loadAllGarages();
    // 加载左边货位使用率
    loadAllLocations();
    // 中间地图等区域切换
    $(".main-content-middle-top-title-tab1").click(function () {
        // console.log("tab1 click!");
        // 销毁其他
        destoryIframe("carGpsTabDiv","carGpsTabDivIframe");
        destoryIframe("culturalTabDiv","culturalTabDivIframe");
        destoryIframe("view3dTabDiv","view3dTabDivIframe");
        if(document.getElementById("aerialViewTabDivIframe") == null){
            // 创建指定tab
            createIframeWithSize("aerialViewTabDiv","aerialViewTabDivIframe","aerialViewTabDivIframe","bigscreeniframe/bigscreen_aerialview.jsp", "910px", "430px");
        }
    });
    // tab2是地图
    $(".main-content-middle-top-title-tab2").click(function () {
        // console.log("tab2 click!");
        // 销毁其他
        destoryIframe("aerialViewTabDiv","aerialViewTabDivIframe");
        destoryIframe("culturalTabDiv","culturalTabDivIframe");
        destoryIframe("view3dTabDiv","view3dTabDivIframe");
        if(document.getElementById("carGpsTabDivIframe") == null){
            // 创建指定tab
            createIframeWithSize("carGpsTabDiv","carGpsTabDivIframe","carGpsTabDivIframe","files/datascreen/map.jsp","900px","416px");
        }
    });
    $(".main-content-middle-top-title-tab3").click(function () {
        // console.log("tab3 click!");
        // 销毁其他
        destoryIframe("aerialViewTabDiv","aerialViewTabDivIframe");
        destoryIframe("carGpsTabDiv","carGpsTabDivIframe");
        destoryIframe("view3dTabDiv","view3dTabDivIframe");
        if(document.getElementById("culturalTabDivIframe") == null){
            // 创建指定tab
            createIframeWithSize("culturalTabDiv","culturalTabDivIframe","culturalTabDivIframe","bigscreeniframe/bigscreen_cultural.jsp", "910px", "430px");
        }
    });
    $(".main-content-middle-top-title-tab5").click(function () {
        var view3dUrl = $("#view3dUrl").val();
        // 销毁其他
        destoryIframe("aerialViewTabDiv","aerialViewTabDivIframe");
        destoryIframe("carGpsTabDiv","carGpsTabDivIframe");
        destoryIframe("culturalTabDiv","culturalTabDivIframe");
        if(document.getElementById("view3dTabDivIframe") == null){
            // 创建指定tab
            createIframeWithSize("view3dTabDiv","view3dTabDivIframe","view3dTabDivIframe",view3dUrl, "900px", "416px");
        }
    });
    // 中间默认第一个标签
    $(".main-content-middle-top-title-tab1").click();
    // 中间中间加载所有车库
    loadAllGaragesForCarPlaceInfoDisplay();
    // 右边车辆进出记录
    loadCarInoutRecord();
    // 加载天气信息
    loadWeather();
    // 加载温湿度信息
    loadTempAndWet();
    // 加载右侧中间统计信息
    loadCarAndGoodsStatis(1);
});

/**
 * 加载台账信息
 */
function loadGoodsInfo(goodsType) {
    $.ajax({
        type: "GET",
        url: intelligentWarehouseUrl+"/api/goods/getGoodsInfoForBigScreen?goodsType="+goodsType,
        success:function(result){
            if (result.status) {
                $("#goodsListTBody").html("");
                $("#allGoodsTotal").html(result.data.allGoodsTotal);
                $("#goodsTypeTotal").html(result.data.goodsTypeTotal);
                //加载列表
                if(result.data.goodsList!=null&&result.data.goodsList.length>0){
                    var returnHtml = "";
                    for (var i=0;i<result.data.goodsList.length;i++){
                        if(i < 5){
                            var curItem = result.data.goodsList[i];
                            var itemData='<tr><td>'+curItem.goodsName+'</td><td>'+curItem.locationName+'</td><td>'+curItem.goodsInventory+'</td><td>'+curItem.goodsUnit+'</td></tr>';
                            returnHtml += itemData;
                        }
                    }
                    $("#goodsListTBody").html(returnHtml);
                }
                $("[id^='imgGoodsInfo_']").attr("src", contextPath+"/images/bigscreen/voltage-unselected.png");
                if(goodsType=='0.4KV'){
                    goodsType = '4KV';
                }
                $("#imgGoodsInfo_"+goodsType).attr("src", contextPath+"/images/bigscreen/voltage-selected.png");
            }
        }
    });
}

/**
 * 查询所有车库
 */
function loadAllGarages() {
    $.ajax({
        type: "GET",
        url: $("#contextPath").val()+"/bigscreen/getAllGarages",
        success:function(result){
            if (result.status) {
                var allGarages = result.data;
                if(allGarages!=null&&allGarages.length>0){
                    var returnHtml = "";
                    for (var i=0;i<allGarages.length;i++) {
                        var itemData='<div class="main-content-left-middle-content-left-all-button" onclick="loadGaragesUseRate('+allGarages[i].id+')">';
                        itemData+='<img id="garageTabImg'+allGarages[i].id+'" src="'+contextPath+'/images/bigscreen/switch-button-unselected.png">';
                        itemData+='<label>'+allGarages[i].garageName+'</label>';
                        itemData+='</div>';
                        returnHtml += itemData;
                        garageIdArr.push(allGarages[i].id);
                    }
                    $("#parkingPlaceUseRateDiv").html(returnHtml);
                }
                // 默认选中第一个标签
                loadGaragesUseRate(garageIdArr[garageIntervalCurrentIndex]);
            }
        }
    });
    // 启动15秒切换定时器
    var timer = window.setInterval(doAutoSwitchGarageRate,timerSecond);
    intervalArr.push(timer);
}

/**
 * 自动切换车库使用率tab
 */
function doAutoSwitchGarageRate() {
    if(garageIntervalCurrentIndex+1<=garageIdArr.length){
        loadGaragesUseRate(garageIdArr[garageIntervalCurrentIndex]);
        if(garageIntervalCurrentIndex+1==garageIdArr.length){
            garageIntervalCurrentIndex = 0;
        }else {
            garageIntervalCurrentIndex++;
        }
    }
}

/**
 * 加载车库车位使用率
 */
function loadGaragesUseRate(id) {
    var param = {};
    param.garageId = id;
    $.ajax({
        url: $("#contextPath").val() + "/bigscreen/parkingPlaceRate",
        type: "POST",
        cache: false,
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json',
        success: function (result) {
            if (result.status && result.data != null) {
                changeUseRate1(result.data.utilizationRate.substr(0,result.data.utilizationRate.length-1));
                $("#totalParkingPlaces").html(result.data.totalParkingPlaces);
                $("#occupyParkingPlaces").html(result.data.occupyParkingPlaces);
                $("#freeParkingPlaces").html(result.data.freeParkingPlaces);
                $("[id^='garageTabImg']").attr("src", contextPath+"/images/bigscreen/switch-button-unselected.png");
                $("#garageTabImg"+id).attr("src", contextPath+"/images/bigscreen/switch-button-selected.png");
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

/**
 * 查询所有货位
 */
function loadAllLocations() {
    $.ajax({
        type: "GET",
        url: intelligentWarehouseUrl+"/api/location/getFirstLocations",
        success:function(result){
            if (result.status) {
                var allLocations = result.data;
                if(allLocations!=null&&allLocations.length>0){
                    var returnHtml = "";
                    for (var i=0;i<allLocations.length;i++) {
                        if(i < 3){
                            var curItemLocName = allLocations[i].locationName;
                            var curItemLocKey = allLocations[i].locationKey;
                            var itemData='<div class="main-content-left-bottom-content-left-all-button" onclick="loadLocationUseRate(\''+curItemLocName+'\','+curItemLocKey+')">';
                            itemData+='<img id="locationTabImg'+curItemLocKey+'" src="'+contextPath+'/images/bigscreen/switch-button-unselected.png">';
                            itemData+='<label>'+allLocations[i].locationName+'</label>';
                            itemData+='</div>';
                            returnHtml += itemData;
                            locationArr.push(curItemLocName+','+curItemLocKey);
                        }
                    }
                    $("#locationUseRateDiv").html(returnHtml);
                }
                // 默认选中第一个标签
                var curItemLocName = locationArr[locationIntervalCurrentIndex].split(",")[0];
                var curItemLocKey = locationArr[locationIntervalCurrentIndex].split(",")[1];
                loadLocationUseRate(curItemLocName, curItemLocKey);
            }
        }
    });
    // 启动15秒切换定时器
    var timer = window.setInterval(doAutoSwitchLocationRate,timerSecond);
    intervalArr.push(timer);
}

/**
 * 加载货位使用率
 */
function loadLocationUseRate(locationName, locationKey) {
    var param = {};
    param.locationName = locationName;
    $.ajax({
        url: intelligentWarehouseUrl + "/api/location/getLocationUseRate",
        type: "POST",
        cache: false,
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json',
        success: function (result) {
            if (result.status && result.data != null) {
                $("#totalLocationCount").html(0);
                $("#usedLocationCount").html(0);
                $("#freeLocationCount").html(0);
                changeUseRate2(0);
                var persent = 0;
                if(result.data.total > 0){
                    persent = result.data.used/result.data.total;
                    $("#totalLocationCount").html(result.data.total);
                    $("#usedLocationCount").html(result.data.used);
                    $("#freeLocationCount").html(result.data.total - result.data.used);
                }
                changeUseRate2(persent);
                $("[id^='locationTabImg']").attr("src", contextPath+"/images/bigscreen/switch-button-unselected.png");
                $("#locationTabImg"+locationKey).attr("src", contextPath+"/images/bigscreen/switch-button-selected.png");
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

/**
 * 自动切换车库使用率tab
 */
function doAutoSwitchLocationRate() {
    if(locationIntervalCurrentIndex+1<=locationArr.length){
        var curItemLocName = locationArr[locationIntervalCurrentIndex].split(",")[0];
        var curItemLocKey = locationArr[locationIntervalCurrentIndex].split(",")[1];
        loadLocationUseRate(curItemLocName, curItemLocKey);
        if(locationIntervalCurrentIndex+1==locationArr.length){
            locationIntervalCurrentIndex = 0;
        }else {
            locationIntervalCurrentIndex++;
        }
    }
}

/**
 * 加载车辆进出记录
 */
function loadCarInoutRecord() {
    $.ajax({
        type: "POST",
        cache: false,
        data: JSON.stringify({}),
        dataType: "json",
        contentType: 'application/json',
        url: $("#contextPath").val()+"/bigscreen/vehicleRecords",
        success:function(result){
            if (result.status) {
                var carInout = result.data;
                if(carInout!=null&&carInout.length>0){
                    var returnHtml = "";
                    for (var i=0;i<carInout.length;i++) {
                        if(i<5){
                            var itemData='<div class="main-content-right-middle1-content-all-item">';
                            var color = "";
                            if(carInout[i].out){
                                color = "red";
                            }else {
                                color = "#67C23A";
                            }
                            itemData+='<i style="background-color:'+color+'"></i>';
                            itemData+='<label>'+carInout[i].text+'</label>';
                            itemData+='<span>'+carInout[i].time+'</span>';
                            itemData+='</div>';
                            returnHtml += itemData;
                        }
                    }
                    $("#inoutRecordDiv").html(returnHtml);
                }
            }
        }
    });
}

/**
 * 加载资产出入记录
 */
function loadGoodInoutRecord() {
    var param = {};
    param.start = 0;
    param.count = 9999;
    param.obj = {};
    $.ajax({
        type: "POST",
        cache: false,
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json',
        url: intelligentWarehouseUrl+"/api/inout/pageListInoutRecords",
        success:function(result){
            if (result.status) {
                if(result.data!=null&&result.data.pageMessage.length>0){
                    var returnHtml = "";
                    for (var i=0;i<result.data.pageMessage.length;i++) {
                        if(i<5){
                            var curData = result.data.pageMessage[i];
                            var itemData='<div class="main-content-right-middle1-content-all-item">';
                            var color = "";
                            var text = curData.userName;
                            if(curData.isOut == "true"){
                                color = "red";
                                text += "出库"
                            }else {
                                color = "#67C23A";
                                text += "入库"
                            }
                            text += curData.goodsCount + curData.goodsUnit + curData.goodsName;
                            itemData+='<i style="background-color:'+color+'"></i>';
                            itemData+='<label>'+text+'</label>';
                            itemData+='<span>'+curData.inOutTime+'</span>';
                            itemData+='</div>';
                            returnHtml += itemData;
                        }
                    }
                    $("#inoutRecordDiv").html(returnHtml);
                }
            }
        }
    });
}

/**
 * 一键开门
 */
function oneKeyOpenDoors() {
    $.ajax({
        type: "POST",
        cache: false,
        data: JSON.stringify({}),
        dataType: "json",
        contentType: 'application/json',
        url: $("#contextPath").val()+"/bigscreen/oneKeyOpenDoors",
        success:function(result){
            if (result.status) {
            }else{
                alert("一键开门失败");
            }
        }
    });
}

/**
 * 查询所有车库用于展示所有车位信息
 */
function loadAllGaragesForCarPlaceInfoDisplay() {
    $.ajax({
        type: "GET",
        url: $("#contextPath").val()+"/bigscreen/getAllGarages",
        success:function(result){
            if (result.status) {
                var allGarages = result.data;
                if(allGarages!=null&&allGarages.length>0){
                    var returnHtml = "";
                    for (var i=0;i<allGarages.length;i++) {
                        var itemData='<div class="main-content-middle-middle-middle-all-tab" onclick="loadGaragesParkingPlace('+allGarages[i].id+')">';
                        itemData+='<img id="garageForCarPlaceTabImg'+allGarages[i].id+'" src="'+contextPath+'/images/bigscreen/main-content-middle-middle-middle-tab-unselected.png" />';
                        itemData+='<label>'+allGarages[i].garageName+'</label>';
                        itemData+='</div>';
                        returnHtml += itemData;
                    }
                    $("#parkingPlaceInfoDiv").html(returnHtml);
                    loadGaragesParkingPlace(allGarages[0].id);
                }
            }
        }
    });
}

/**
 * 获取车库下所有车位信息
 * @param garageId
 */
function loadGaragesParkingPlace(garageId) {
    var param = {};
    param.garageId = garageId;
    $.ajax({
        url: $("#contextPath").val() + "/bigscreen/parkingPlaceInfo",
        type: "POST",
        cache: false,
        data: JSON.stringify(param),
        dataType: "json",
        contentType: 'application/json',
        success: function (result) {
            if (result.status && result.data != null) {
                var returnHtml = "";
                var allPlaces = result.data;
                for (var i=0;i<allPlaces.length;i++) {
                    var zCarNumber = "";
                    var carPic = "main-middle-middle-powercar-in.png";
                    if(allPlaces[i].carNumber==null||allPlaces[i].carNumber==''){
                        carPic = "place-nocar.png";
                    } else {
                        zCarNumber = allPlaces[i].carNumber;
                        if(allPlaces[i].carType!=null&&allPlaces[i].carType!=''){
                            if(allPlaces[i].carType.indexOf('斗臂')> -1){
                                carPic = "main-middle-middle-armcar-in.png";
                            }else if(allPlaces[i].carType.indexOf('特种')> -1){
                                carPic = "main-middle-middle-car-in.png";
                            }else if(allPlaces[i].carType.indexOf('中压')> -1 || allPlaces[i].carType.indexOf('低压')> -1){
                                carPic = "main-middle-middle-powercar-in.png";
                            }
                        }
                    }
                    carPic += "../../images/bigscreen/"+carPic;
                    $(".main-content-middle-middle-bottom-all-everycar").css("background","url('"+carPic+"')");
                    var itemData='<div class="main-content-middle-middle-bottom-all-everycar">';
                    itemData+='<div class="main-content-middle-middle-bottom-all-everycar-up"></div>';
                    itemData+='<div class="main-content-middle-middle-bottom-all-everycar-bottom">';
                    itemData+='<label>'+zCarNumber+'</label>';
                    itemData+='</div>';
                    itemData+='</div>';
                    returnHtml += itemData;
                }
                $("[id^='garageForCarPlaceTabImg']").attr("src", contextPath+"/images/bigscreen/main-content-middle-middle-middle-tab-unselected.png");
                $("#garageForCarPlaceTabImg"+garageId).attr("src", contextPath+"/images/bigscreen/main-content-middle-middle-middle-tab-selected.png");
                $("#parkingPlaceInfoListDiv").html(returnHtml);
            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

/**
 * 加载天气信息
 */
function loadWeather() {
    $.ajax({
        type: "GET",
        url: $("#contextPath").val()+"/bigscreen/getWeather",
        success:function(result){
            if (result.status) {
                $("#weather").html(result.data.text);
                $("#temperature").html(result.data.temp);
                $("#category").html(result.data.category);
            }
        }
    });
}

/**
 * 加载温湿度信息
 */
function loadTempAndWet() {
    $.ajax({
        type: "GET",
        url: intelligentWarehouseUrl+"/api/temphumi/getFirstTempHumiData",
        success:function(result){
            if (result.status) {
                $("#temperatureOfIntelligentWarehouse").html(result.data.temperature+"℃");
                $("#wetOfIntelligentWarehouse").html(result.data.humidity+"℃");
            }
        }
    });
}

/**
 * 修改车位div使用率
 * @param persent
 */
function changeUseRate1(persent) {
    //参数1：仪表值<=1
    //参数2：中间显示的值<=1
    $("#useRate1").setWord(persent, persent);
}
/**
 * 修改货位div使用率
 * @param persent
 */
function changeUseRate2(persent) {
    //参数1：仪表值<=1
    //参数2：中间显示的值<=1
    $("#useRate2").setWord(persent, persent);
}

/**
 * 加载右侧中间统计信息
 */
var carStatisOption = {
    title: {
        left: 'center'
    },
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        containLabel: true
    },
    legend: {
        data: []
    },
    xAxis: [{
        // name: '月份',
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        axisLabel: {
            show: true,
            textStyle: {
                color: 'white',
                fontSize: 10
            }
        },
        axisLine:{
            lineStyle:{
                color:'#052A56' //更改坐标轴颜色
            }
        }
    }],
    yAxis: [{
    }, {
        splitLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        axisLine: {
            show: false
        },
        axisLabel: {
            show: false
        }
    }],
    series: [{
        name: '数量',
        type: 'bar',
        barWidth: '30%',
        yAxisIndex: 1,
        stack: '出库次数',
        itemStyle: {
            normal: {
                color: '#02D2FD',
                label: {
                    show: true, //开启显示
                    position: 'top', //在上方显示
                    textStyle: { //数值样式
                        color: 'white',
                        fontSize: 10
                    }
                }
            }
        },
        label: {
            normal: {
                show: true,
                position: 'top'
            }
        },
        data: [209, 236, 325, 439, 507, 576, 722, 879, 938, 1364, 1806, 1851]
    }]
};
function loadCarAndGoodsStatis(type) {
    carAndGoodsStatis = echarts.init(document.getElementById("carAndGoodsCount"));
    if(type==1){
        $.ajax({
            type: "POST",
            cache: false,
            data: JSON.stringify({}),
            dataType: "json",
            contentType: 'application/json',
            url: $("#contextPath").val()+"/bigscreen/vehicleStatistics",
            success:function(result){
                if (result.status) {
                    var count = new Array();
                    var month = new Array();
                    $(result.data).each(function () {
                        count.push(this.outNums);
                        month.push(this.datetime);
                    });
                    carStatisOption.series[0].data = count;
                    carStatisOption.xAxis[0].data = month;
                    carAndGoodsStatis.setOption(carStatisOption);
                }
            }
        });
    } else {
        $.ajax({
            type: "GET",
            cache: false,
            dataType: "json",
            contentType: 'application/json',
            url: intelligentWarehouseUrl+"/api/goods/getGoodsStatisticsLastYear",
            success:function(result){
                if (result.status) {
                    var count = new Array();
                    var month = new Array();
                    $(result.data).each(function () {
                        count.push(this.outNums);
                        month.push(this.datetime);
                    });
                    carStatisOption.series[0].data = count;
                    carStatisOption.xAxis[0].data = month;
                    carAndGoodsStatis.setOption(carStatisOption);
                }
            }
        });
    }
}

/**
 * 重新创建iframe
 * @param iframeParentId
 * @param iframeId
 * @param iframeName
 * @param src
 * @returns {HTMLIFrameElement}
 */
function createIframe(iframeParentId, iframeId, iframeName, src){
    var iframe = document.createElement("iframe");
    iframe.style.width = '900px';
    iframe.style.height = '430px';
    iframe.style.border = 'none';
    iframe.scrolling = 'no';
    iframe.id = iframeId;
    iframe.name = iframeName;
    iframe.src = src;
    document.getElementById(iframeParentId).appendChild(iframe);
    return iframe;
}

function createIframeWithSize(iframeParentId, iframeId, iframeName, src, width, height){
    var iframe = document.createElement("iframe");
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.style.border = 'none';
    iframe.scrolling = 'no';
    iframe.id = iframeId;
    iframe.name = iframeName;
    iframe.src = src;
    document.getElementById(iframeParentId).appendChild(iframe);
    return iframe;
}

/**
 * 清除iframe
 * @param iframeParentId
 * @param iframeId
 */
function destoryIframe(iframeParentId, iframeId){
    var thisNode = document.getElementById(iframeId);
    if(thisNode!=null){
        thisNode.src = 'javascript:void(0)';
        document.getElementById(iframeParentId).removeChild(thisNode);
    }
}

/**
 * 跳转到指定url
 * @param type
 */
function jumpUrl(type) {
    var jumpUrl = "";
    if(type==1){
        jumpUrl = $("#monitorJumpHref1").val();
    }else if(type==2){
        jumpUrl = $("#monitorJumpHref2").val();
    }
    var tempwindow=window.open('_blank');
    tempwindow.location=jumpUrl;

}