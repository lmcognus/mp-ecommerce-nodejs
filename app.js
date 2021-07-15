var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000

var app = express();

// SDK de Mercado Pago
const mercadopago = require ('mercadopago');

// Agrega credenciales
mercadopago.configure({
    access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398'
  });  

  // Crea un objeto de preferencia
let preference = {
    items: [
      {
        title: 'Mi producto',
        unit_price: 100,
        quantity: 1,
      }
    ],
    back_urls: {
        "success": "https://sebad95-mp-commerce-nodejs.herokuapp.com/success",
        "failure": "https://sebad95-mp-commerce-nodejs.herokuapp.com/failure",
        "pending": "https://sebad95-mp-commerce-nodejs.herokuapp.com/pending"
    },
    auto_return: "approved"
  };
  
  mercadopago.preferences.create(preference)
  .then(function(response){
  // Este valor reemplazará el string "<%= global.id %>" en tu HTML
    global.id = response.body.id;
  }).catch(function(error){
    console.log(error);
  });
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.get('/success', function (req, res) {
    res.render('success');
});

app.get('/pending', function (req, res) {
    res.render('pending');
});

app.get('/failure', function (req, res) {
    res.render('failure');
});

app.listen(port);