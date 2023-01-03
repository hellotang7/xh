var WSNAME = "CabinetStatus";
var websocketClientMap = new Map()
var websocketChanglianMap = new Map()
var limitConnect = 1000 // 断线重连次数
var timeConnect = 0
var intelligentWarehouseUrl;
var contextPath;

/**
 * 页面加载完成执行方法
 */
$(document).ready(function () {
  intelligentWarehouseUrl = $("#intelligentWarehouseUrl").val();
  contextPath = $("#contextPath").val();
  loadWebsocket(WSNAME);
  // setTimeout(function () {
  //   send("test", "testmessage");
  // },5000)
});
/**
 * 创建websocket连接
 * @param type
 */
function loadWebsocket(name) {
  var wsPrefix = intelligentWarehouseUrl.substr(7,intelligentWarehouseUrl.length);
  var wsk = new WebSocket('ws://'+wsPrefix+'/page/websocket/' + name)
  websocketClientMap.set(name, wsk)
  // 心跳包发送
  var changLian = setInterval(function() {
    wsk.send('PING')
  }, 1000 * 3)
  websocketChanglianMap.set(name, changLian)
  // websocket事件
  wsk.onmessage = function(ev) {
    // console.log('ev.data=', ev.data)
    if (name === WSNAME) {
      var evObj = JSON.parse(ev.data);
      //console.log(evObj)
      if(evObj.opType==WSNAME){
        console.log(evObj)
        if(evObj.data.displayPicture!=null&&evObj.data.displayPicture!=''){
          if(parseInt(evObj.data.displayPicture)==0){
            $('#cabinetImg').attr("class","main-content-middle-buttom-buttom-img0");
          } else {
            $('#cabinetImg').attr("class","main-content-middle-buttom-buttom-img");
          }
          $("#cabinetImg").attr("src", contextPath+"/images/bigscreen/cabinet/"+evObj.data.displayPicture+".gif");
        }
        if(evObj.data.displayMessage!=null){
          $("#cabinetText").html(evObj.data.displayMessage)
        }
      }
    }
  }
  wsk.onopen = function() {
    console.log('已连接TCP服务器')
  }
  wsk.onclose = function() {
    console.log('服务器已经断开')
    reconnect(name)
  }
  wsk.onerror = function(e) {
    console.log('onerror=', e)
  }
}
/**
 * 发送消息给后端
 */
function send(name, message) {
  if (websocketClientMap.get(name) != null) {
    websocketClientMap.get(name).send(message);
  }
}
/**
 * 断线重连
 */
// 重连
function reconnect(name) {
  // lockReconnect加锁，防止onclose、onerror两次重连
  if (limitConnect > 0) {
    limitConnect--
    timeConnect++
    console.log('第' + timeConnect + '次重连')
    // 进行重连
    setTimeout(function() {
      loadWebsocket(name)
    }, 2000)
  } else {
    console.log('TCP连接已超时')
    if (websocketChanglianMap.get(name) != null) {
      clearInterval(websocketChanglianMap.get(name))
    }
  }
}
/**
 * 关闭websocket连接
 */
function closeWebSocket(name) {
  console.log(name)
  if (websocketClientMap.get(name) != null) {
    console.log('close WebSocket of ', name)
    websocketClientMap.get(name).close()
  }
}