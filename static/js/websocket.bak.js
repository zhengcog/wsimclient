var socket;
var wsUrl = 'wss://ytwsim.66boss.com/server';
$(document).ready(function () {
    var currentUser = $("#uname").text();
    // Create a socket
    socket = new WebSocket(wsUrl);
    var token = "token=Bearer " + $("#token").val();
    socket.onopen = function(event){
        socket.send(token);
    };

    //接收消息
    socket.onmessage = function (event) {
        console.log(event.data);
        if(event.data == "ok") {
            $("#chatbox li").first().before("<li>"+currentUser+"登录成功</li>");
        }else{
            var data = JSON.parse(event.data);
            $("#chatbox li").first().before("<li>"+data.from +"说:"+data.msg.content+"</li>");
        }
    };

    //断开连接
    socket.onclose = function(event){
        alert("websocket 已经断开连接，需要重连");
    };

    //有错误断开连接
    socket.onerror = function(event){
        alert("websocket 有错，已断开连接，需要重连");
    };

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
        socket.send(JSON.stringify(message));
        $("#chatbox li").first().before("<li>"+currentUser +"说:"+content+"</li>");
    };

    $('#sendbtn').click(function () {
        postConecnt();
    });
});