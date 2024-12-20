require("dotenv/config");

const port = process.env.PORT || 1337;
const NODE_ENV = process.env.NODE_ENV

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");

const documents = require("./docs.js");
const auth = require("./auth.js");
const mail = require("./mail.js");

const clientUrl = require("./environment.js");

const app = express();
const httpServer = require("http").createServer(app);

// GraphQL
const visual = false;
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema } = require("graphql");
const RootQueryType = require("./graphql/root.js");

const schema = new GraphQLSchema({ query: RootQueryType });

const io = require("socket.io")(httpServer, {
    cors: {
        origin: clientUrl,
        methods: ["GET", "POST"],
    },
});

io.on("connection", function (socket) {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", async (documentId) => {
        socket.join(documentId);
        console.log(`Socket ${socket.id} joined room ${documentId}`);

        const doc = await documents.getOne(documentId)
        socket.emit('enterDoc', doc);
    });

    let throttle;
    socket.on("update", async (documentData) => {
        const { doc_id, title, content, comments } = documentData;
        console.log(`Received update for doc_id ${doc_id}`);

        io.to(doc_id).emit('update', { doc_id, title, content, comments });

        clearTimeout(throttle);
        throttle = setTimeout( async () => {
            await documents.editOne({ doc_id, title, content, comments })
            console.log(`Document ${doc_id} updated in db`);
            await documents.getOne(doc_id);
        }, 2000);
    });

    socket.on("disconnect", (reason) => {
        console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
});

app.use(
    cors({
        origin: true,
        allowedHeaders: "Content-Type,Authorization,Session-Variable",
    })
);

app.disable("x-powered-by");
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: visual
}));

if (NODE_ENV !== "test") {
    // use morgan to log at command line
    app.use(morgan("combined")); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    req.user = req.headers['session-variable'];
    next();
});

app.put("/add/:type", async (req, res) => {
    const body = req.body
    const user = await auth.getOne(body.email);
    const details = {
        ...body,
        owner: user._id
    }

    return res.json({ new_id: await documents.addOne(details) });
});

app.put("/edit", async (req, res) => {
    return res.json({ doc: await documents.editOne(req.body) });
});

app.put("/comment/add", async (req, res) => {
    let storedUser;
    if (req.user) {
        storedUser = JSON.parse(req.user);
    }
    const details = {
        ...req.body, 
        user: storedUser ? storedUser.email : req.body.user
    }

    const doc = await documents.commentOne(details);
    if (doc != null) {
        io.to(doc.doc_id).emit('update', doc);
    }
    return res.json({ doc });
});

app.put("/comment/delete", async (req, res) => {
    const doc = await documents.deleteComment(req.body);
    if (doc != null) {
        io.to(doc.doc_id).emit('update', doc);
    }
    return res.json({ doc });
});

app.get("/docs/:id", async (req, res) => {
    const doc = await documents.getOne(req.params.id);
    if (doc != null) {
        io.to(doc.doc_id).emit('update', doc);
    }
    return res.json({ doc });
});

app.get("/accept/:id", async (req, res) => {
    let storedUser;
    if (req.user) {
        storedUser = JSON.parse(req.user);
    }
    const details = { email: storedUser.email, docId: req.params.id };
    return res.json({ accepted: await documents.acceptInvitation(details) });
});

app.delete("/delete", async (req, res) => {
    return res.json({ deleted: await documents.deleteOne(req.body.id) });
});

app.get("/reset", async (req, res) => {
    await documents.resetDb();
    return res.redirect(`/`);
});

app.post("/users/register", async (req, res) => {
    return res.json({ success: await auth.register(req.body) });
});

app.post("/users/login", async (req, res) => {
    return res.json(await auth.login(req.body));
});

app.get("/users/:user", async (req, res) => {
    return res.json({ user: await auth.getOne(req.params.user) });
});

app.post("/send", async (req, res) => {
    const response = await documents.addInvite(req.body);
    if (response !== "already invited") {
        const document = await documents.getOne(req.body.doc_id)
        const body = {
            ...req.body,
            title: document.title
        }
        return await mail.sendEmail(body);
    } else {
        console.log(response);
        return
    }
});

const server = httpServer.listen(port, () => {
    console.log(`SSR Editor running port ${port}`);
});

module.exports = { app, server, io };