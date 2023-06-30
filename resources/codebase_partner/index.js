const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const supplier = require("./app/controller/supplier.controller");
const bean = require("./app/controller/bean.controller");
const app = express();
const mustacheExpress = require("mustache-express")
const favicon = require('serve-favicon');

bean_model = require('./app/models/bean.model')
const sqs_consumer = require('./app/sqs/consumer')(bean_model)


// parse requests of content-type: application/json
app.use(bodyParser.json());
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.options("*", cors());
app.engine("html", mustacheExpress())
app.set("view engine", "html")
app.set("views", __dirname + "/views")
app.use(express.static('public'));
app.use(favicon(__dirname + "/public/img/favicon.ico"));

app.get("/", (req, res) => {
    res.render("home", {});
});

// =========== suppliers ============
// list all the suppliers
app.get("/suppliers/", supplier.findAll);
// show the add suppler form
app.get("/supplier-add", (req, res) => {
    res.render("supplier-add", {});
});
// receive the add supplier POST
app.post("/supplier-add", supplier.create);
// show the update form
app.get("/supplier-update/:id", supplier.findOne);
// receive the update POST
app.post("/supplier-update", supplier.update);
// receive the POST to delete a supplier
app.post("/supplier-remove/:id", supplier.remove);

// =========== beans ============
// list all the beans
app.get("/beans/", bean.findAll);
// list all the beans
app.get("/beans.json", bean.findAllJson);
// show the add suppler form
app.get("/bean-add", (req, res) => {
    res.render("bean-add", {});
});
// receive the add supplier POST
app.post("/bean-add", bean.create);
// show the update form
app.get("/bean-update/:id", bean.findOne);
// receive the update POST
app.post("/bean-update", bean.update);
// receive the POST to delete a supplier
app.post("/bean-remove/:id", bean.remove);


// handle 404
app.use(function (req, res, next) {
    res.status(404).render("404", {});
})


// set port, listen for requests
const app_port = process.env.APP_PORT || 3000
app.listen(app_port, () => {
    console.log(`Server is running on port ${app_port}.`);
});