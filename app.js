//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function connect() {
  try {
    await mongoose.connect("mongodb+srv://Ebishu:Yoniab23@cluster0.vx1dviu.mongodb.net/todolistDB");
    console.log("database Connected")
  } catch (err) {
    console.error(err);
  }
}

connect();


const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist"
})

const item2 = new Item({
  name: "press + button to add alist"
})

const item3 = new Item({
  name: "hir this to delete"
})

const defaultItem = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  list: [itemsSchema]
})


const List = mongoose.model('List', listSchema);


app.get("/", function (req, res) {
  const day = date.getDate();

  Item.find(function (err, items) {
    if (err) {
      console.log(err);
    } else {

      if (items.length === 0) {
        Item.insertMany(defaultItem, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("successfully inserted");
          }
        });
      } else res.render("list", { listTitle: "today", newListItems: items });
    }
  })
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listTitle === "today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle }, function (err, result) {
      if (!err) {
        result.list.push(item);
        result.save();
        res.redirect("/" + listTitle);
      }
    })
  }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "today") {
    Item.findByIdAndRemove({ _id: itemId }, function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("successfully Deleted!");
        res.redirect('/');
      }
    })
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { list: { _id: itemId } } }, function (err) {
      if (!err) {
        res.redirect('/' + listName);
      }
    })
  }

})

app.get("/:type", function (req, res) {

  const name = _.capitalize(req.params.type);
  List.findOne({ name: name }, function (err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name: name,
          list: defaultItem
        });
        list.save()
        res.redirect("/" + name);
      } else
        res.render("list", { listTitle: result.name, newListItems: result.list });
    }
  })
});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
