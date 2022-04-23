//여기서의 sockt = 서버로의 연결
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new WebSocket(`ws://${window.location.host}`);

//socket이 connection을 open했을 때 발생
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

//서버에서 보낸 메세지 받기
socket.addEventListener("message", (message) => {
    console.log("New Message : ", message.data);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    //메세지 보내기 프론트 -> 백
    socket.send(input.value);
    //메세지 보낸후 창 비우기
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);

