import 'dotenv/config'

const port = process.env.PORT || 1337;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import documents from "./docs.mjs";

const app = express();

app.use(cors());

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

app.post("/", async (req, res) => {
    await documents.addOne(req.body);

    return res.redirect(`/`);
});

app.post("/edit", async (req, res) => {
    const result = await documents.editOne(req.body);

    return res.redirect(`/docs/${req.body.id}`);
});

app.get('/docs/:id', async (req, res) => {
    return res.json({doc: await documents.getOne(req.params.id)});
});

app.get('/search/:string', async (req, res) => {
    console.log(req.params.string);
});

app.get('/', async (req, res) => {
    return res.json({docs: await documents.getAll()});
});

app.get('/add', async (req, res) => {
    return res.render("add");
});

app.post("/delete", async (req, res) => {
    await documents.deleteOne(req.body.id);

    return res.redirect(`/`);
});

app.get("/reset", async (req, res) => {
    await documents.resetDb();
    return res.redirect(`/`);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});
