import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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
const httpServer = http.createServer(app);
//socketIO를 서버에 설치
const wsServer = new Server(httpServer, {
    cors: {
        origin : ["https://admin.socket.io"],
        credentials : true,
    },
});

instrument(wsServer, {
    auth: false
});

function publicRooms() {
    const { 
        sockets: { 
            adapter: { sids, rooms },
        },
    } = wsServer;
    //채팅방 리스트 보여주기
    //sids는 소켓id
    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

//채팅방 참여인원
function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    //프론트에서 보낸 event 받기
    socket.on("enter_room", (roomName, showRoom) => {
        //방에 참가하기
        socket.join(roomName);
        //방 이름 보여주기
        showRoom(countRoom(roomName));
        //특정 이벤트(welcome)를 roomName에 emit -> 입장메세지 전송(본인 제외)
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        //연결된 모두에게 방 리스트 전송
        wsServer.sockets.emit("room_change", publicRooms());
    });
    //연결이 끊어지는 중 (끊어진것x)
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) -1));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    //메세지 보내기
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });
    //닉네임 저장하기
    socket.on("nickname", (nickname) => socket["nickname"] = nickname);
});


// const wss = new WebSocketServer({server});
// //fake database 만들기
// const sockets = [];

// //connection이 생기면 socket을 받음 여기서의 socket = 연결된 브라우저
// wss.on("connection", (socket) => {
//     //연결되면 db에 넣기
//     sockets.push(socket);
//     //닉네임을 정하지 않았을때 익명으로 정해주기
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser ✅");
//     //소켓 종료
//     socket.on("close", () => {
//         console.log("Disconnected from Browser ❌");
//     });
//     //브라우저로부터 온 메세지 받기
//     socket.on("message", (msg) => {
//         //Stirng으로 온 메세지를 js object로 변경
//         const message = JSON.parse(msg);
//         //메세지 타입에 따라 다르게 보여주기
//         switch (message.type) {
//             case "new_message" :
//              //연결된 모든 소켓으로 받은 메세지 보내기
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`));   
//             case "nickname" :
//                 socket["nickname"] = message.payload;
//         }
//     });
// });

httpServer.listen(3000, handleListen);