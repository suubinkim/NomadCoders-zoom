//여기서의 sockt = 서버로의 연결
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

//서버로 메세지 보내기
setTimeout(() => {
    socket.send("hello from the browser!");
}, 10000);

