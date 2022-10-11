const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

const client_list = {};
//{socket.id: chatName}
//Object.values(client_list) 하면 값만 배열로 받을 수 있다.
//Object.values(client_list).includes(chatName)
const userData = [];
const chatNames = [];

io.on("connection", (socket) => {
    console.log("server socket connected");

    socket.on("setChatname", (chatName) => {
        if (!Object.values(client_list).includes(chatName)) {
            socket.emit("enterSuccess", Object.values(client_list));

            client_list[socket.id] = chatName;

            console.log("enter-show all users:", client_list);

            socket.broadcast.emit("enterNotice", chatName);
        } else {
            socket.emit("errNotice", "there is same user name send it again");
        }
    });

    socket.on("sendMsg", (chatName, selectChatUsers, msg) => {
        if (selectChatUsers === "all") {
            socket.broadcast.emit("receiveMsg", chatName, msg);
        } else {
            // client_list.find(selectChatUsers
            const socketId = Object.keys(client_list).find(
                (key) => client_list[key] === selectChatUsers
            );

            io.to(socketId).emit("receiveDm", chatName, msg);
        }
    });

    socket.on("disconnect", (reason) => {
        // console.log(reason);
        const exitUser = client_list[socket.id];

        delete client_list[socket.id];
        console.log("after delete: ", client_list, exitUser);
        socket.broadcast.emit("exitNotice", exitUser);
    });
});

http.listen(8000, () => console.log("app listening to port 8000"));
