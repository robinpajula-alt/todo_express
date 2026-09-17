const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile("./tasks.json", "utf8", (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const tasks = JSON.parse(data);
      resolve(tasks);
    });
  });
};

const writeFile = (filename, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, 'utf-8', err => {
      if (err) {
        console.error(err);
        return;
      }
      resolve(true);
    });
  });
};

// get tasks list
app.get("/", (req, res) => {
  readFile("./tasks.json").then((tasks) => {
    console.log(tasks);
    res.render("index", {
      tasks: tasks,
      error: null
    });
  });
});

// add new task
app.post("/", (req, res) => {
  // tasks list data from file
  let error = null 
  if(req.body.task.trim().length == 0) {
    error = "Please insert correct task data"
    readFile("./tasks.json").then(tasks => {
      res.render("index", { tasks: tasks, error: error

       });
    });
  } else {
  readFile("./tasks.json").then((tasks) => {
    // create new id a 
    // utomatically
    let index;
    if (tasks.length === 0) {
      index = 0;
    } else {
      index = tasks[tasks.length - 1].id + 1;
    }

    // create task object
    const newTask = {
      "id": index,
      "task": req.body.task
    };

    // add form sent task to tasks array
    tasks.push(newTask);
    data = JSON.stringify(tasks, null, 2);

    writeFile("tasks.json", data);
    // redirect to / to see result
    res.redirect("/");
    })
  };
});

// delete task by id
app.get('/delete-task/:taskId', (req, res) => {
  let deletedTaskId = parseInt(req.params.taskId);

  readFile('./tasks.json').then(tasks => {
    tasks.forEach((task, index) => {
      if (task.id === deletedTaskId) {
        tasks.splice(index, 1);
      }
    });

    data = JSON.stringify(tasks, null, 2);

    writeFile("tasks.json", data);
    // redirect to / to see result
    res.redirect('/');
  });
});

// delete all tasks
app.get("/delete-tasks", (req, res) => {
  const emptyData = JSON.stringify([], null, 2);

  writeFile("./tasks.json", emptyData).then(() => {
    // redirect to / to see result
    res.redirect('/');
  });
});

//edit task
app.get("/update-task/:taskId", (req, res) => {
  const taskId = parseInt(req.params.taskId);
  readFile("./tasks.json").then(tasks => {
    const taskToUpdate = tasks.find(t => t.id === taskId)
    console.log("Task for updating =>", taskToUpdate);
    res.render("update", { task: taskToUpdate, error: null });
  })
})

// update task
app.post("/update-task", (req, res) => {
  const taskId = parseInt(req.body.taskId);
  const updatedTaskText = req.body.task;
  console.log("Task data from update form =>", { id: taskId, task: updatedTaskText });
  if (!updatedTaskText || updatedTaskText.trim().length === 0) {
    const error = "Please insert correct task data";
    res.render("update", { 
      task: { id: taskId, task: updatedTaskText }, 
      error: error 
    });
  } else {
    readFile("./tasks.json").then(tasks => {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].task = updatedTaskText;
      }
      const data = JSON.stringify(tasks, null, 2);
      writeFile("./tasks.json", data).then(() => {
        res.redirect("/");
      });
    });
  }
});
app.listen(3001, () => {
  console.log("Example app is started at http://localhost:3001");
})