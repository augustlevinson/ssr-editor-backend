require('dotenv/config');

const port = process.env.PORT || 1337;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const documents = require('./docs.js');
const auth = require('./auth.js');

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: "Content-Type,Authorization"
}));

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/add', async (req, res) => {
    return res.json({new_id: await documents.addOne("Namnlöst dokument", "", userId)})
});

app.put("/edit", async (req, res) => {
    return res.json({doc: await documents.editOne(req.body)})
});

app.get('/docs/:id', async (req, res) => {
    return res.json({doc: await documents.getOne(req.params.id)});
});

app.get('/search/:string', async (req, res) => {
    console.log(req.params.string);
});

app.get('/', async (req, res) => {
    let validate = false;
    let userCookie;
    if (req.cookies.user) {
        userCookie = JSON.parse(req.cookies.user);
        validate = await auth.validateToken(userCookie)
    }
    if (validate) {
        const user = await auth.getOne(userCookie.email);
        return res.json({docs: await documents.getAllByUser(user._id)});
    } return res.json({docs: "unauthenticated"});
});

app.get('/all', async (req, res) => {
    return res.json({docs: await documents.getAll()});
});

app.delete("/delete", async (req, res) => {
    return res.json({deleted: await documents.deleteOne(req.body.id)});
});

app.get("/reset", async (req, res) => {
    await documents.resetDb();
    return res.redirect(`/`);
});

app.get('/users/all', async (req, res) => {
    return res.json({users: await auth.getAll()});
});

app.get('/users/clear', async (req, res) => {
    return res.json({users: await auth.clearDb()});
});

app.post('/users/register', async (req, res) => {
    return res.json({success: await auth.register(req.body)});
});

app.post('/users/login', async (req, res) => {
    return res.json(await auth.login(req.body));
});

app.post('/users/update', async (req, res) => {
    return res.json(await auth.editOne(req.body));
});

app.get('/users/:user', async (req, res) => {
    return res.json({user: await auth.getOne(req.params.user)});
});

const server = app.listen(port, () => {
    console.log(`SSR Editor running port ${port}`)
});

module.exports = { app, server }
