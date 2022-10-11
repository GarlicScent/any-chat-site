const enterForm = document.querySelector("#enterForm");
const msgForm = document.querySelector("#msgForm");

const contentBox = document.querySelector("#contentBox");
const msgBox = document.querySelector("#msgBox");
const ul = msgBox.querySelector("ul");

const selectChatUser = document.querySelector("#chatUsers");

const socket = io.connect();

let chatName;

contentBox.hidden = true;

function enterChat(event) {
    event.preventDefault();

    chatName = enterForm.chatName.value;

    socket.emit("setChatname", chatName);
}

enterForm.addEventListener("submit", enterChat);

function printMsg(name, msg, className) {
    const div = document.createElement("div");
    const span = document.createElement("span");
    if (className === "meDm" || className === "othersDm") {
        span.innerText = `(속닥속닥) ${name}: ${msg}`;
    } else {
        span.innerText = `${name}: ${msg}`;
    }
    div.append(span);
    div.classList.add(className);

    msgBox.append(div);
    msgBox.scrollTop = msgBox.scrollHeight - msgBox.clientHeight;
}

socket.on("enterSuccess", (chatNames) => {
    contentBox.hidden = false;
    enterForm.hidden = true;
    const h1 = document.querySelector("h1");
    h1.innerText = "채팅 시작ㅎㅎ";
    for (let element of chatNames) {
        insertChatUsers(element);
    }

    socketEvent();
});

function insertChatUsers(chatName) {
    const option = document.createElement("option");
    option.value = chatName;
    option.innerText = chatName;
    option.id = `chatNameOption${chatName}`;

    selectChatUser.append(option);
}

function socketEvent() {
    socket.on("enterNotice", (chatNames) => {
        const div = document.createElement("div");
        const span = document.createElement("span");

        span.innerText = `${chatNames}님이 입장하셨습니다.`;
        div.append(span);
        div.classList.add("noticeMsg");
        msgBox.append(div);

        if (!(chatNames === chatName)) {
            insertChatUsers(chatNames);
        }
    });

    socket.on("receiveMsg", (name, msg) => {
        printMsg(name, msg, "othersMsg");
    });

    socket.on("receiveDm", (name, msg) => {
        printMsg(name, msg, "othersDm");
    });

    socket.on("exitNotice", (exitChatName) => {
        const div = document.createElement("div");
        const span = document.createElement("span");

        if (exitChatName) {
            span.innerText = `${exitChatName}님이 퇴장하셨습니다.`;
            div.append(span);
            div.classList.add("noticeMsg");
            msgBox.append(div);

            const d_option = document.querySelector(
                `#chatNameOption${exitChatName}`
            );
            console.log(exitChatName);
            console.log("select:", selectChatUser, "option:", d_option);
            selectChatUser.removeChild(d_option);
        }
        msgBox.scrollTop = msgBox.scrollHeight - msgBox.clientHeight;
    });
}
//err same username
socket.on("errNotice", (err) => {
    alert(err);
});

function sendMessage(event) {
    event.preventDefault();

    const selectChatUsers = selectChatUser.value;
    const msg = msgForm.chatMsg.value;

    socket.emit("sendMsg", chatName, selectChatUsers, msg);

    const chatUser = selectChatUser.value;
    if (selectChatUsers === "all") {
        printMsg(chatName, msg, "meMsg");
    } else {
        printMsg(chatName, msg, "meDm");
    }

    msgForm.chatMsg.value = "";

    // 채팅 스크롤 밑으로 내려두기.
    msgBox.scrollTop = msgBox.scrollHeight - msgBox.clientHeight;
}

msgForm.addEventListener("submit", sendMessage);

selectChatUser.addEventListener("change", (event) => {
    console.log(event);
    const dmAlert = document.querySelector("#dm");
    // console.log(event.target.value);
    if (event.target.value === "all") {
        dmAlert.innerText = ``;
    } else {
        dmAlert.innerText = `${event.target.value}님에게 귓속말 중입니다.`;
    }
});
