/**
 * Created by Administrator on 2016/7/6.
 */
"use strict";
const EventEmitter = require("events");
const socketEventEmitter = new EventEmitter();

let socketClient;
let socketServer;
let socketClients = [];

const EVENTS = {
    connection: "connection",
    connect: "connect",
    error: "error",
    disconnect: "disconnect",
    reconnect_attempt: "reconnect_attempt",
    reconnecting: "reconnecting",
    reconnect_error: "reconnect_error",
    reconnect_failed: "reconnect_failed"
};

/**
 * 启动socket服务器
 * @param port
 */
function socketServerStart(port) {
    socketServer = require("socket.io")(port);
    socketServer.on(EVENTS.connection, (socket) => {
        socketClients.push(socket);
        socketEventEmitter.emit(EVENTS.connection);
        socket.on(EVENTS.disconnect, (data) => {
            socketEventEmitter.emit(EVENTS.disconnect, {
                socket,
                data
            });
            socketClients.splice(socketClients.indexOf(socket), 1);
        });
    });
}

/**
 * 为服务器增加事件监听
 * @param evt
 * @param callback
 */
function socketServerOnClientEvt(evt, callback) {
    socketClients.forEach((ele) => {
        ele.on(evt, (data) => {
            if(callback) {
                callback(ele, data);
            }
            socketEventEmitter.emit(evt, {
                socket: ele,
                data
            });
        });
    });
}

/**
 * 服务器广播
 * @param evt
 * @param data
 */
function socketServerBroadcast(evt, data) {
    socketServer.emit(evt, data);
}

/**
 * 为客户端增加监听
 * @param evt
 * @param callback
 */
function socketClientOn(evt, callback) {
    socketClient.on(evt, (data) => {
        if(callback) {
            callback(data);
        }
        socketEventEmitter.emit(evt, data);
    });
}

/**
 * 客户端连接初始化
 * @param url
 * @param port
 */
function socketClientConnect(url, port) {
    socketClient = require("socket.io-client").connect(url + ":" + port);
    for(let item in EVENTS) {
        socketClient.on(EVENTS[item], (data) => {
            socketEventEmitter.emit(EVENTS[item], data);
        });
    }
}



module.exports = {
    socketServerStart,
    socketServerOnClientEvt,
    socketServerBroadcast,
    socketClientOn,
    socketClientConnect,
    EVENTS,
    socketEventEmitter
};
