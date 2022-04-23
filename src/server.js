import express from "express";
import {WebSocketServer} from "ws";
import http from "http";

const app = express();

//뷰엔진을 pug로 지정
app.set("view engine", "pug");
//template이 어디에 있는지 지정
app.set("views", __dirname + "/views");
//public url을 생성해서 파일 공유
app.use("/public", express.static(__dirname + "/public"));
//get 작동시 home으로 렌더링
app.get("/", (req, res) => res.render("home"));
//다른 url은 사용하지 않기 때문에 다른 url 접속시 home으로 리다이렉트
app.get("/*", (req, res) => res.redirect("/"));
const handleListen = () => console.log('Listening on http://localhost:3000');

//같은 서버(port)에서 http, webSocket 둘 다 작동 시키기
const server = http.createServer(app);
    //http 서버 위에 ws 서버 만들기
const wss = new WebSocketServer({server});


//fake database 만들기
const sockets = [];

//connection이 생기면 socket을 받음 여기서의 socket = 연결된 브라우저
wss.on("connection", (socket) => {
    //연결되면 db에 넣기
    sockets.push(socket);
    console.log("Connected to Browser ✅");
    //소켓 종료
    socket.on("close", () => {
        console.log("Disconnected from Browser ❌");
    });
    //브라우저로부터 온 메세지 받기
    socket.on("message", (message) => {
        //연결된 모든 소켓으로 받은 메세지 보내기
        sockets.forEach(aSocket => aSocket.send(message.toString()));
    });
});

server.listen(3000, handleListen);