//여기서의 sockt = 서버로의 연결
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

//socket이 connection을 open했을 때 발생
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

//서버에서 보낸 메세지 받기
socket.addEventListener("message", (message) => {
    //받은 메세지 보여주기
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

//받은 json 메시지를 string 으로
function makeMessage(type, payload) {
    const msg = { type, payload};
    return JSON.stringify(msg);
}

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    //메세지 보내기 프론트 -> 백
    socket.send(makeMessage("new_message", input.value));
    //메세지 보낸후 창 비우기
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    //메세지 보낸후 창 비우기
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

