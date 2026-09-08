const express = require("express");
const app = express();
const fs = require("fs");

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile("./tasks.json", "utf8", (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const tasks = JSON.parse(data)
      resolve(tasks);
    });
  });
};

app.get("/", (req, res) => {
  readFile("./tasks.json").then((tasks) => {
    console.log(tasks);
    res.render("index", { tasks: tasks });
  });
});
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  readFile("./tasks.json").then((tasks) => {
    let index
    if(tasks.length === 0)
    {
      index = 0
    } else{
      index=tasks[tasks.length-1].id + 1;
    } 
    const newTask ={
      "id" : index,
      "task" : req.body.task
    }  
    console.log(newTask)
    tasks.push(newTask)
    console.log(tasks)
    data= JSON.stringify(tasks, null, 2)
    console.log(data)
    fs.writeFile("./tasks.json", data, (err) => {
      if (err) {
        console.error(err);
        return;
      } else{
        console.log("saved")
      } 
      res.redirect("/");
    });
  });
});

app.listen(3001, () => {
  console.log("Example app is started at http://localhost:3001");
});
