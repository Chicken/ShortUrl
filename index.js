const express = require("express");
const helmet = require("helmet");
const bodyparser = require("body-parser");
const { customAlphabet } = require("nanoid");
const Enmap = require("enmap");
const db = new Enmap({ name: "urls" });
const { hostname, port, users } = require("./config.json");
const { createHash } = require("crypto");

let hash = pw => createHash("sha256").update(pw).digest("hex"); 

let genId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 6);

const app = express();

app.use(helmet());
app.use(bodyparser.json());

app.use("/", express.static("static"));

app.post("/new", (req, res) => {
    let url = req.body?.url;
    if(typeof url != "string" || url.length == 0) {
        res.status(400).send({
            status: 400
        });
        return;
    }
    if(!(/^https?:\/\//m.test(url))) url = "http://" + url;

    if(req.body.custom) {
        let pwHash = hash(req.body.password);
        let user = users.find(u => u.password == pwHash);
        if(user != undefined) {
            db.set(req.body.customUrl, {
                url,
                clicks: 0,
                creator: user.name,
                created: new Date().toUTCString()
            });
            res.status(201).send({
                status: 201,
                url: `${hostname}${req.body.customUrl}`
            });
        } else {
            res.status(401).send({
                status: 401
            });
        }
    } else {
        let existing = db.findKey(v => v.url == url);
        if(existing) {
            res.status(200).send({
                status: 200,
                url: `${hostname}${existing}`
            });
        } else {
            let short = genId();
            for(let tries = 0; db.has(short) && tries < 5; tries++) short = genId();
            if(db.has(short)) {
                res.status(500).send({
                    status: 500
                });
            } else {
                db.set(short, {
                    url,
                    clicks: 0,
                    created: new Date().toUTCString()
                });
                res.status(201).send({
                    status: 201,
                    url: `${hostname}${short}`
                });
            }
        }
    }
});

app.get("/:id", (req, res) => {
    if(req.originalUrl.endsWith("?")) {
        if(db.has(req.params.id)) {
            let { url, clicks, created, creator } = db.get(req.params.id);
            if(creator == undefined) {
                res.status(200).send({
                    status: 200,
                    id: req.params.id,
                    url,
                    clicks,
                    created
                });
            } else {
                res.status(200).send({
                    status: 200,
                    id: req.params.id,
                    url,
                    clicks,
                    creator,
                    created
                });
            }
        } else {
            res.status(404).send({
                status: 404
            });
        }
    } else if(db.has(req.params.id)) {
        db.inc(req.params.id, "clicks");
        res.redirect(db.get(req.params.id).url);
    } else {
        res.status(404).send({
            status: 404
        });
    }
});

app.listen(port, () => {
    console.log(`Webserver on line on ${hostname}. Running on port ${port}.`);
});
