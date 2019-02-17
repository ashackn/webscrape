// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var methodOverride = require("method-override");
var Note = require("./models/note.js");
var Article = require("./models/article.js");

// Scrape
var request = require("request");
var cheerio = require("cheerio");
mongoose.Promise = Promise;
var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(methodOverride('_method'));

app.use(express.static("./public"));

var exphbs = require("express-handlebars");

app.set('views', __dirname + '/views');
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: __dirname + "/views/layouts" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose
var databaseUri = "mongodb://localhost/mongoHeadlines";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//Routes

app.get("/", function (req, res) {
  Article.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      }
      else {
        var newsObj = {
          Article: data
        };
        res.render("index", newsObj);
      }
    });
});

app.get("/scrape", function(req, res) {
  request("https://www.harpersbazaar.com/beauty/", function(error, response, html) {
    var $ = cheerio.load(html);
  
    var result = {
      title:"",
      link:""
    };

    $("h2.card__headline").each(function(i, element) {

      result.title = $(element).children("a").text();
      result.link = $(element).children("a").attr("href");
      console.log(result);

      var entry = new Article(result);

      entry.save(function(err, doc) {
        
        if (err) {
          console.log(err);
        }
        
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/");
    console.log("Successfully Scraped");
  });
});

app.post("/notes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Article.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "note": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("note saved: " + doc);
            res.redirect("/notes/" + req.params.id);
          }
        });
    }
  });
});

app.get("/notes/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Article.find({
    "_id": req.params.id
  }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Article: doc
        };
        console.log(notesObj);
        res.render("notes", notesObj);
      }
    });
});

app.get("/delete/:id", function (req, res) {
  Note.remove({
    "_id":req.params.id
  }).exec(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("note deleted");
      res.redirect("/" );
    }
  });
});


app.listen(PORT, function() {
  console.log("App running on PORT " + PORT + "!");
});