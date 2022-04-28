//io() -> 알아서 socket.io를 실행하고 있는 서버를 찾아서 연결
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("input");
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



function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    //방에 참가시 방이름 알려주기
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    //메세지 보내기
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit);
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

form.addEventListener("submit", handleRoomSubmit);

//백엔드에서 보낸 welcome 이벤트실행
socket.on("welcome", () => {
    addMessage("Someone joined!");
});

socket.on("bye", () => {
    addMessage("Someone left ㅠㅠ");
});

socket.on("new_message", addMessage);