const express = require("express");
const helmet = require("helmet");
const Enmap = require("enmap");
const db = new Enmap({ name: "urls" })

const app = express();

app.use(helmet())

app.get("/", (req,res)=>{
    res.sendStatus(200);
})

app.get("/:id", (req,res)=>{
    res.sendStatus(200);
})

app.get("/info/:id", (req,res)=>{
    res.sendStatus(200);
})

app.listen(8080, ()=>{
    console.log("Listening")
})