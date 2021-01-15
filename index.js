const express = require("express");
const helmet = require("helmet");
const bodyparser = require("body-parser");
const shortid = require('shortid');
const Enmap = require("enmap");
const db = new Enmap({ name: "urls" });
const { hostname, port } = require("./config.json");

const app = express();

app.use(helmet());
app.use(bodyparser.json());

app.get("/", (_, res)=>{
    res.sendFile(__dirname + "/index.html");
})

app.post("/new", (req, res)=>{
    let url = req.body.url;

    let existing = db.findKey(v=>v.url==req.body.url);
    if(existing) {
        return res.send({
            text: `Created! ${hostname}${existing}`
        });
    }

    if(validateUrl(url)) {
        let short = shortid.generate();
        db.set(short, {
            url: url,
            clicks: 0,
            created: new Date().toUTCString()
        });
        res.send({
            text: `Created! ${hostname}${short}`
        });
    } else {
        res.send({
            text: "Invalid url"
        });
    }
})

app.get("/:id", (req,res)=>{
    if(db.has(req.params.id)) {
        db.inc(req.params.id, "clicks")
        res.redirect(db.get(req.params.id).url)
    } else {
        res.send("URL not found!")
    }
})

app.get("/info/:id", (req,res)=>{
    if(db.has(req.params.id)){
        let data = db.get(req.params.id);
        res.send(`${req.params.id} => ${data.url}<br>`
                +`Clicks:  ${data.clicks}<br>`
                +`Created: ${data.created}<br>`);
    }
    res.send(`Non existant`)
})

app.listen(port, ()=>{
    console.log("Listening")
})

function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}
