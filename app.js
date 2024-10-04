require("dotenv/config");

const port = process.env.PORT || 1337;

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const documents = require("./docs.js");
const auth = require("./auth.js");
const mail = require("./mail.js");

const clientUrl = require("./environment.js")

const app = express();
const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ["GET", "POST"]
    }
});

io.sockets.on('connection', function(socket) {
    console.log("====================")
    console.log(socket.id); // Nått lång och slumpat
    console.log("====================")
    socket.on('create', function(room) {
        socket.join(room);
    });
});

app.use(
    cors({
        origin: true,
        credentials: true,
        allowedHeaders: "Content-Type,Authorization",
    })
);

app.disable("x-powered-by");

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
    // use morgan to log at command line
    app.use(morgan("combined")); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/add", async (req, res) => {
    let userCookie;
    let user;
    if (req.cookies.user) {
        userCookie = JSON.parse(req.cookies.user);
        user = await auth.getOne(userCookie.email);
    }
    return res.json({ new_id: await documents.addOne("Namnlöst dokument", "", user._id) });
});

app.put("/edit", async (req, res) => {
    return res.json({ doc: await documents.editOne(req.body) });
});

app.get("/docs/:id", async (req, res) => {
    return res.json({ doc: await documents.getOne(req.params.id) });
});

app.get("/", async (req, res) => {
    let validate = false;
    let userCookie;
    if (req.cookies.user) {
        userCookie = JSON.parse(req.cookies.user);
        validate = await auth.validateToken(userCookie);
    }
    if (validate) {
        const user = await auth.getOne(userCookie.email);
        return res.json({ docs: await documents.getAllByUserId(user._id) });
    }
    return res.json({ docs: "unauthenticated" });
});

app.get("/all", async (req, res) => {
    return res.json({ docs: await documents.getAll() });
});

app.get("/role/:role", async (req, res) => {
    const role = req.params.role;

    let userCookie;
    if (req.cookies.user) {
        userCookie = JSON.parse(req.cookies.user);
        if (role === "invited") {
            return res.json({ docs: await documents.getInvitedByEmail(userCookie.email) });
        } else if (role === "collaborator") {
            return res.json({ docs: await documents.getCollaboratorByEmail(userCookie.email) });
        }
    }

});

app.get("/accept/:id", async (req, res) => {
    let userCookie;
    if (req.cookies.user) {
        userCookie = JSON.parse(req.cookies.user);
    }
    const details = { email: userCookie.email, docId: req.params.id };
    return res.json({ accepted: await documents.acceptInvitation(details) });
});

app.delete("/delete", async (req, res) => {
    return res.json({ deleted: await documents.deleteOne(req.body.id) });
});

app.get("/reset", async (req, res) => {
    await documents.resetDb();
    return res.redirect(`/`);
});

app.get("/users/all", async (req, res) => {
    return res.json({ users: await auth.getAll() });
});

app.get("/users/clear", async (req, res) => {
    return res.json({ users: await auth.clearDb() });
});

app.post("/users/register", async (req, res) => {
    return res.json({ success: await auth.register(req.body) });
});

app.post("/users/login", async (req, res) => {
    return res.json(await auth.login(req.body));
});

app.post("/users/update", async (req, res) => {
    return res.json(await auth.editOne(req.body));
});

app.get("/users/:user", async (req, res) => {
    return res.json({ user: await auth.getOne(req.params.user) });
});

app.post("/send", async (req, res) => {
    await documents.addInvite(req.body);
    return await mail.sendEmail(req.body);
});

const server = httpServer.listen(port, () => {
    console.log(`SSR Editor running port ${port}`);
});

module.exports = { app, server };
