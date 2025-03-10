// Here I am accessing the HTML elements by DOM with by using getElementById() : 
const taskForm = document.getElementById('task-form');
const pendingTasksList = document.getElementById('pending-tasks-list');
const completedTasksList = document.getElementById('completed-tasks-list');
const filterPriority = document.getElementById('filter-priority');
const filterDueDate = document.getElementById('filter-due-date');
const filterStatus = document.getElementById('filter-status');
const applyFiltersButton = document.getElementById('apply-filters');
const progressTasksList = document.getElementById('progress-tasks-list');

// This is to load the tasks from the local storage or initialize an empty array 
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// This function is to save the tasks to the local storage : 
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// This function is to check if a due date is within a specific range : 
function isDueDateInRange(dueDate, range) {
    // This will help us to get today's date : 
    const today = new Date();

    // Here we are converting the due date to a date object : 
    const taskDate = new Date(dueDate);

    // Check if the range in today : 
    if (range === 'today') {
        
        // Here we are comparing if the task date is the same as today's date : 
        // And here we are using "toDateString()" which converts the date object into a human readable string. This method doesn't check the specific time like hours minutes and seconds. 
        if (taskDate.toDateString() === today.toDateString()) {
            return true;
        }
        else {
            return false;
        }
    }
    else if (range === 'week') {

        // calucate the date one week from today : 
        const nextWeek = new Date(today);

        // Here the "getDate()" is a built in function in javascript which return the day of the date. 
        // And the "setDate()" is also a built in function in the javascript which sets the day of the date. 
        nextWeek.setDate(today.getDate() + 7);

        // Here we are checking if the task date is between today and next week : 
        if (taskDate >= today && taskDate <= nextWeek) {
            return true;
        }
        else {
            return false;
        }
    }

    // If the range is not "today" or "week", it will return true (No filtering)
    else {
        return true;
    }
}

// Function to render tasks based on filters
function renderTasks() {

    // Here we are getting the selected filter values : 
    const filterPriorityValue = filterPriority.value;
    const filterDueDateValue = filterDueDate.value;
    const filterStatusValue = filterStatus.value;

    // Here we are clearing the current tasks list : 
    pendingTasksList.innerHTML = '';
    progressTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        let matchesPriority = false;
        
        //check if the task matches with the priority filter : 
        if (filterPriorityValue === 'all' || filterPriorityValue === task.priority) {
            matchesPriority = true;
        }

        let matchesDueDate = false;
        
        // checking if the taks matches with the due date filter : 
        // If the filter is "all" or the task's due date is in range. set it to true : 
        if (filterDueDateValue === 'all' || isDueDateInRange(task.dueDate, filterDueDateValue)) {
            matchesDueDate = true;
        }

        let matchesStatus = false;

        // If the filter is "all" or the task's status matches, set it to true : 
        if (filterStatusValue === "all" || filterStatusValue === task.status) {
            matchesStatus = true;
        }

        // If the task matches all filters (priority, due date, and status), then render it : 
        if (matchesPriority && matchesDueDate && matchesStatus) {

            const li = document.createElement('li');

            li.className = `task-priority-${task.priority}`;

            // if the task is completed, add the "In-progress" class to the list item : 
            if (task.status === 'In-progress') {
                li.classList.add('In-progress');
            }
            else {
                li.classList.remove('In-progress');
            }
            
            // If the task is completed, add the "completed" class to the list item : 
            if (task.status === 'completed') {
                li.classList.add('completed');
            }
            else {
                li.classList.remove('completed');
            }

            // Here I am setting the inner HTML of the list items to display the task details : 
            li.innerHTML = `
            <div>
                <h4> ${task.title} </h4>
                <p> ${task.description} </p>
                <h4> ${task.dueDate} | Priority: ${task.priority} </h4> 
            </div>
            <div class="task-actions">
                <button class="edit" onclick="editTask(${task.id})">Edit</button>
                <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
            `;

            // Here we are adding the "complete" or "Mark as Pending" button based on the task's status
            if (task.status === 'pending') {
    
                // If the task is pending then add a "complete" button : 
                li.innerHTML += `<button class="complete" onclick="markAsCompleted(${task.id})">complete</button>`;
                li.innerHTML += `<button class="In-progress" onclick="markAsInProgress(${task.id})">In Progress</button>`;
            }
            else if (task.status === 'In-progress') {
                
                // if the task is in the progress then add "mark as completed" and "mark as pending" buttons
                li.innerHTML += `<button class="complete" onclick="markAsCompleted(${task.id})">complete</button>`;
                li.innerHTML += `<button class="pending" onclick="markAsPending(${task.id})">Mark as Pending</button>`; 
            }
            else {

                // If the task is completed then add  "Mark as pending" and "Mark as In-progress" buttons : 
                li.innerHTML += `<button class="pending" onclick="markAsPending(${task.id})">Mark as Pending</button>`; 
                li.innerHTML += `<button class="In-progress" onclick="markAsInProgress(${task.id})">In Progress</button>`;
            }

            // Here we are closing the 'task-actions' div : 
            li.innerHTML += `</div>`;

            // Append the task to the appropriate list based on its status : 
            if (task.status === 'pending') {
                pendingTasksList.appendChild(li);
            }
            else if (task.status === 'In-progress') {
                progressTasksList.appendChild(li);
            }
            else {
                completedTasksList.appendChild(li);
            }
        }
    }
}

// add event listner on the apply filter button : 
applyFiltersButton.addEventListener('click', renderTasks);

// Using add event listener on form : 
taskForm.addEventListener('submit', addTask);

// This function is to add a new task : 
function addTask(e) {
    e.preventDefault();

    const newTitle = document.getElementById('task-title').value;
    const newDescription = document.getElementById('task-description').value;
    const newDueDate = document.getElementById('task-due-date').value;
    const newPriority = document.getElementById('task-priority').value;

    const newTask = {
        id: Date.now(),
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate,
        priority: newPriority,
        status: 'pending'
    }

    // Now let's push the new tasks in the tasks : 
    tasks.push(newTask);

    // Calling saveTask() function to save the tasks : 
    saveTasks();

    // Calling renderTasks() to render the saved task : 
    renderTasks();

    // Here we will reset the form : 
    taskForm.reset();
}

// Function to edit the task : 
window.editTask = (id) => {
    // Here this find function will find the tasks in the tasks array : 
    const task = tasks.find(task => task.id === id);

    if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;

        // we will delete the task from the list : 
        deleteTask(id);
    }
}

// Function to delete the task : 
window.deleteTask = (id) => {

    // Remove the task with the specified id from the tasks array :  
    tasks = tasks.filter(task => task.id !== id);

    // This will save the updated tasks in the array : 
    saveTasks();

    // Render the tasks : 
    renderTasks();
}

// Function to mark a task as completed : 
window.markAsCompleted = (id) => {
    
    // Find the task in the tasks array : 
    const task = tasks.find(task => task.id === id);

    // If it found the task : 
    if (task) {

        // Update the task status : 
        task.status = 'completed';
        saveTasks();
        renderTasks();
    }
}

// Function to mark the tasks as progress tasks :
window.markAsInProgress = (id) => {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.status = 'In-progress';
        saveTasks();
        renderTasks();
    }
}

// Function to mark the task as pending : 
window.markAsPending = (id) => {

    // Find the task : 
    const task = tasks.find(task => task.id === id);

    // when the task is found :  
    if (task) {
        
        // Update the task status : 
        task.status = 'pending';
        saveTasks();
        renderTasks();
    }
}

// Render the tasks : 
renderTasks();