//io() -> 알아서 socket.io를 실행하고 있는 서버를 찾아서 연결
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${value}`);
    });
    input.value = "";
}

function addMessage(msg) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}

function handleNameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

function showRoom(newCount) {
    welcome.hidden = true;
    room.hidden = false;
    //방에 참가시 방이름 알려주기
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    //메세지 보내기
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    //socket.send 대신 원하는 event를 emit하고 object 전송 가능
    //마지막 argument는 서버에서 호출하는 function (실행은 프론트에서 됨)
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

//참가인원 업데이트 함스
function countRoom(newCount){
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
}

form.addEventListener("submit", handleRoomSubmit);

//백엔드에서 보낸 welcome 이벤트실행
socket.on("welcome", (user, newCount) => {
    countRoom(newCount);
    addMessage(`${user} arrived!`);
});

socket.on("bye", (user, newCount) => {
    countRoom(newCount);
    addMessage(`${user} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    //오픈방이 없을땐 새로고침이 안되므로 if절로 처리해줌
    if(rooms.length === 0) {
        roomList.innerHTML = "";
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});