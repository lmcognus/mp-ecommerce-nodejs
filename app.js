var express = require("express");
var exphbs = require("express-handlebars");
var port = process.env.PORT || 3000;

var app = express();

// SDK de Mercado Pago
const mercadopago = require("mercadopago");

const bodyParser = require("body-parser");

const fileSystem = require('fs');
var stream = fs.createWriteStream("myfile.txt");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-8729976997648654-071617-f4675b47bc4402f060cc533a54a3a43d-792288000",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
});

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", function (req, res) {
  res.render("detail", req.query);
});

app.get("/success", function (req, res) {
  res.render("success", req.query);
});

app.get("/pending", function (req, res) {
  res.render("pending", req.query);
});

app.get("/failure", function (req, res) {
  res.render("failure", req.query);
});

app.post("/notification-webhook", function (req, res) {
  if (req.method === "POST") { 
    let body = ""; 
    req.on("data", chunk => {  
      body += chunk.toString();
    });
    req.on("end", () => {  
      console.log(body, "webhook response"); 
      
      stream.once('open', (fd) => {
        stream.write("First line\n");
        stream.write("Second line\n");
    
        // Importante para cerrar la transmisión cuando estés listo
        stream.end();
    });
    
      res.end("ok");
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
        unit_price: parseInt(req.body.price)
      },
    ],
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
          area_code: "11",
          number: 22223333
      },
      address: {
          street_name: "Falsa",
          street_number: 123,
          zip_code: "1111"
      }
  },
    back_urls: {
      success: "https://sebad95-mp-commerce-nodejs.herokuapp.com/success",
      failure: "https://sebad95-mp-commerce-nodejs.herokuapp.com/failure",
      pending: "https://sebad95-mp-commerce-nodejs.herokuapp.com/pending",
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex",
        }
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
      installments: 6,
      default_installments: 6
    },
    notification_url:"https://sebad95-mp-commerce-nodejs.herokuapp.com/notification-webhook",
    statement_descriptor: "Tienda e-commerce",
    external_reference: "sebadiaz95@hotmail.com"
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