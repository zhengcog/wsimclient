var ws;
var lockReconnect = false;//避免重复连接
var wsUrl = 'ws://127.0.0.1:9090/server';
$(document).ready(function () {
    var currentUser = $("#uname").text();
    var token = "token=Bearer " + $("#token").val();
    //创建websocket
    var createWebSocket = function(url) {
        try {
            ws = new WebSocket(url);
            ws.onclose = function () {
                reConnect(wsUrl);
            };
            ws.onerror = function () {
                reConnect(wsUrl);
            };
            ws.onopen = function () {
                //心跳检测重置
                //heartCheck.reset().start();
                //发送token用于登录验证
                ws.send(token);
            };
            ws.onmessage = function (event) {
                //如果获取到消息，心跳检测重置
                //拿到任何消息都说明当前连接是正常的
                //heartCheck.reset().start();
                if(event.data == "ok") {
                    $("#chatbox li").first().before("<li>"+currentUser+"登录成功</li>");
                }else{
                    var data = JSON.parse(event.data);
                    $("#chatbox li").first().before("<li>"+data.from +"说:"+data.msg.content+"</li>");
                }
            }
        } catch (e) {
            reConnect(url);
        }
    };

    //重连
    var reConnect = function(url) {
        //console.log("重连中...");
        if(lockReconnect) return false;
        lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        setTimeout(function () {
            createWebSocket(url);
            lockReconnect = false;
        }, 2000);
    };

    //心跳检测
    var heartCheck = {
        timeout: 60000,//60秒
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function(){
            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
            return this;
        },
        start: function(){
            var self = this;
            this.timeoutObj = setTimeout(function(){
                //这里发送一个心跳，后端收到后，返回一个心跳消息，
                //onmessage拿到返回的心跳就说明连接正常
                ws.send("HeartBeat_ping");
                self.serverTimeoutObj = setTimeout(function(){//如果超过一定时间还没重置，说明后端主动断开了
                    ws.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                }, self.timeout)
            }, this.timeout)
        }
    };

    // Create a socket
    createWebSocket(wsUrl);

    // 发送消息
    var postConecnt = function () {
        var message = {};
        var avatar = $("#useravatar").val();
        var nick = $("#usernick").val();
        var target = $("#target").val();
        var content = $('#sendbox').val();
        message.target_type = "user";
        message.target = target;
        message.from = currentUser;
        message.msg = {
            type:"txt",
            content:content
        };
        message.ext = {
            username:nick,
            avatar:avatar
        };
        ws.send(JSON.stringify(message));
        $("#chatbox li").first().before("<li>"+currentUser +"说:"+content+"</li>");
    };

    $('#sendbtn').click(function () {
        postConecnt();
    });
});