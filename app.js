var express = require("express");
var exphbs = require("express-handlebars");
var port = process.env.PORT || 3000;

var app = express();

global.notification;

// SDK de Mercado Pago
const mercadopago = require("mercadopago");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

// Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
});

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home", {"name": 'home'});
});

app.get("/detail", function (req, res) {
  res.render("detail", {"req": req.query, "name": 'item'});
});

app.get("/success", function (req, res) {
  res.render("success", {"req": req.query, "notification": global.notification, "name": ''});
});

app.get("/pending", function (req, res) {
  res.render("pending", {"req": req.query, "notification": global.notification, "name": ''});
});

app.get("/failure", function (req, res) {
  res.render("failure", {"req": req.query, "name": ''});
});

app.post("/notification-webhook", function (req, res) {
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body, "webhook response");
      global.notification = JSON.parse(body);
      
      res.end("OK");
    });
  }
  res.status(200);
});

app.post("/procesar-pago", function (req, res) {
  // Crea un objeto de preferencia
  let preference = {
    items: [
      {
        id: 1234,
        title: req.body.title,
        picture_url: "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif",
        description: "Dispositivo móvil de Tienda e-commerce",
        quantity: parseInt(req.body.unit),
        unit_price: parseInt(req.body.price),
      },
    ],
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
        area_code: "11",
        number: 22223333,
      },
      address: {
        street_name: "Falsa",
        street_number: 123,
        zip_code: "1111",
      },
    },
    back_urls: {
      success: "https://lmontelongo-mp-ecommerce-node.herokuapp.com/success",
      failure: "https://lmontelongo-mp-ecommerce-node.herokuapp.com/failure",
      pending: "https://lmontelongo-mp-ecommerce-node.herokuapp.com/pending",
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex",
        },
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
      installments: 6,
      default_installments: 1,
    },
    notification_url:
      "https://lmontelongo-mp-ecommerce-node.herokuapp.com/notification-webhook?source_news=webhooks",
    statement_descriptor: "Tienda e-commerce",
    external_reference: "lucasmontelongo@outlook.com",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.redirect(response.body.init_point);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.listen(port);
