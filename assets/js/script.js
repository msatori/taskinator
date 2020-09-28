var taskIdCounter = 0;

var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEL = document.querySelector("#page-content");
var tasksinProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];

var taskFormHandler = function (event) {
    event.preventDefault();
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    if (taskNameInput === "" || taskTypeInput === "") {
        alert("You need to fill out the task form!");
        return false;
    }

    //reset the text content
    document.querySelector("input[name='task-name']").value = "";
    document.querySelector("select[name='task-type']").selectedIndex = 0;


    var isEdit = formEl.hasAttribute("data-task-id");
    //has data attribute, so get task id and call function to complete edit process
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    //no data attribute, so create object as normal and pass to createTaskEl function
    else {
        var taskDataObj = {

            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        };

        createTaskEl(taskDataObj);
    }
};


var createTaskEl = function (taskDataObj) {
    //create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";
    listItemEl.setAttribute("data-task-id", taskIdCounter);
    listItemEl.setAttribute("draggable", "true");

    //create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    //give it a class name
    taskInfoEl.className = "task-info";
    //add HTMl content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
    listItemEl.appendChild(taskInfoEl);

    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);
    tasksToDoEl.appendChild(listItemEl);
    console.log(taskDataObj);
    console.log(taskDataObj.status);
    taskDataObj.id = taskIdCounter;

    tasks.push(taskDataObj);
    //increase task counter for next unique ID
    taskIdCounter++;

    //save to local storage
    saveTasks();
};

var createTaskActions = function (taskId) {
    var actionContainerEl = document.createElement("div")
    actionContainerEl.className = "task-actions";

    //create edit  button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);
    actionContainerEl.appendChild(editButtonEl);


    //create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);
    actionContainerEl.appendChild(deleteButtonEl);
    //change status dropdown 
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(statusSelectEl);

    var statusChoices = ["To Do", "In Progress", "Completed"];

    for (var i = 0; i < statusChoices.length; i++) {
        //create option element 
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        //append to select
        statusSelectEl.appendChild(statusOptionEl);
    }
    return actionContainerEl;
};

var completeEditTask = function (taskName, taskType, taskId) {
    // find task list item with taskId value
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    //loop through tasks array and task objects with new content
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };
    alert("Task Updated!");

    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";
    //save to local storage
    saveTasks();
    

};


var taskButtonHandler = function (event) {
    // get target element from event
    var targetEl = event.target;

    //edit button was clicked
    if (targetEl.matches(".edit-btn")) {
        console.log("edit", targetEl);
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }

    //if delete button was clicked
    else if (event.target.matches(".delete-btn")) {
        //get the elements task id
        console.log("Delete", targetEl);
        var taskId = event.target.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};
var taskstatusChangeHandler = function (event) {
    //get the task items id
    var taskId = event.target.getAttribute("data-task-id");

    //get the currently selected options value and convert to the lowercase
    var statusValue = event.target.value.toLowerCase();

    //find the parent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "' ]")

    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected)
    }
    else if (statusValue === "in progress") {
        tasksinProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    //update task's in the tasks array
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }
    console.log(tasks);
    //save to local storage
    saveTasks();
};
var editTask = function (taskId) {
    console.log("editing task #" + taskId);

    // get task list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    console.log(taskName);

    var taskType = taskSelected.querySelector("span.task-type").textContent;
    console.log(taskType);

    // write values of taskname and taskType to form to be edited
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    // set data attribute to the form with a value of the task's id so it knows which one is being edited
    formEl.setAttribute("data-task-id", taskId);
    // update form's button to reflect editing a task rather than creating a new one
    formEl.querySelector("#save-task").textContent = "Save Task";
};

var deleteTask = function (taskId) {
    console.log(taskId);
    // find task list element with taskId value and remove it
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

};


var deleteTask = function (taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    console.log(taskSelected);
    taskSelected.remove();

    //create a new array to hold the updated list of tasks
    var updatedTasksArr = [];

    //loop through current tasks
    for (var i = 0; i < tasks.length; i++) {
        //if tasks[i].id doesnt match the value of taskId, let's keep the task & push it to the new array
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTasksArr.push(tasks[i]);
        }
    }
    //reassign tasks array to be the same as updatedTaskArr
    tasks = updatedTasksArr;
    //save to local storage
    saveTasks();
}; 

var dropTaskHandler = function (event) {
    var id = event.dataTransfer.getData("text/plain");
    var draggableElement = document.querySelector("[data-task-id='" + id + "']");
    var dropZoneEl = event.target.closest(".task-list");

    dropZoneEl.removeAttribute("style");

    var statusType = dropZoneEl.id;
    //set status of task based on dropZone id
    var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
    if (statusType === "tasks-to-do") {
        statusSelectEl.selectedIndex = 0;
    }
    else if (statusType === "tasks-in-progress") {
        statusSelectEl.selectedIndex = 1;
    }

    else if (statusType === "tasks-completed") {
        statusSelectEl.selectedIndex = 2;
    }
    dropZoneEl.appendChild(draggableElement);

    //loop through tasks array to find and update the updates task's status
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(id)) {
            tasks[i].status = statusSelectEl.value.toLowerCase();
        }
    }
    console.log(tasks);
    //save to local storage
    saveTasks();
};

var dropZoneDragHandler = function (event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        event.preventDefault();
        taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");

    }
};

var dragTaskHandler = function (event) {
    var taskId = event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
    var getId = event.dataTransfer.getData("text/plain");
    console.log("getId", getId, typeof getId);
};

var dragLeaveHandler = function (event) {
    var taskListEl = event.target.closest(".task-list");

    if (taskListEl) {
        event.target.closest(".task-list").removeAttribute("style");
    }
};

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Event Listeners
formEl.addEventListener("submit", taskFormHandler);
pageContentEL.addEventListener("click", taskButtonHandler);
pageContentEL.addEventListener("change", taskstatusChangeHandler);
//for dragging 
pageContentEL.addEventListener("dragstart", dragTaskHandler);
pageContentEL.addEventListener("dragover", dropZoneDragHandler);
pageContentEL.addEventListener("drop", dropTaskHandler);
pageContentEL.addEventListener("dragleave", dragLeaveHandler);