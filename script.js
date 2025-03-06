
function toggleSection(sectionId, button, content) {
    let section = document.getElementById(sectionId);
    if (!section) return;

    let existingBox = section.querySelector(".rectangle");

    if (existingBox) {
        existingBox.style.display = existingBox.style.display === "none" ? "block" : "none";
        return;
    }

    let box = document.createElement("div");
    box.className = "rectangle dynamic-section";
    box.innerHTML = content + `<div class="resizer"></div>`;

    section.appendChild(box);
    section.style.display = "block";
    
    makeDraggable(box);
    makeResizable(box);
}

function toggleActivitiesRectangle(button) {
    let section = document.getElementById("activities-container");
    if (!section) return;

    let existingBox = section.querySelector(".rectangle");
    if (existingBox) {
        existingBox.style.display = existingBox.style.display === "none" ? "block" : "none";
        return;
    }

    // 🏗️ Create Activity Logging Box
    let box = document.createElement("div");
    box.className = "rectangle dynamic-section";
    box.innerHTML = `
        <div class="input-container">
            <input type="text" id="activityInput" placeholder="Type your activity..." class="input-box">
            <button id="saveActivityBtn" class="save-btn">Save</button>
        </div>
        <ul id="activityList"></ul>
        <div class="resizer"></div>
    `;

    section.appendChild(box);
    section.style.display = "block";

    makeDraggable(box);
    makeResizable(box);
    loadActivities(); // 🏆 Load past activities

    // 🔥 Event Listeners for Saving Activities
    let inputField = document.getElementById("activityInput");
    let saveButton = document.getElementById("saveActivityBtn");

    // 🎯 Click Save Button to Save Activity
    saveButton.addEventListener("click", saveActivity);

    // ⏎ Pressing "Enter" Saves Activity
    inputField.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Stops accidental form submission
            saveActivity();
        }
    });

    // 🚀 Auto-focus input for quick typing
    inputField.focus();
}

function saveActivity() {
    let input = document.getElementById("activityInput");
    if (!input) return;

    let activity = input.value.trim();
    if (activity === "") return;

    let carbonData = estimateCarbonOutput(activity);
    let activities = JSON.parse(localStorage.getItem("activities")) || [];

    activities.unshift({ 
        name: activity, 
        carbon: carbonData.carbon, 
        category: carbonData.category,
        date: new Date().toISOString() 
    });

    localStorage.setItem("activities", JSON.stringify(activities));

    input.value = "";
    loadActivities();
    updateTotalCarbon();
    updateClimateStreak();
    updateEcoScore(); // 🌟 Update Eco Score dynamically

    console.log("Activity saved:", activities);
}

// 📌 Ensure Save Button Works Even After UI Refresh
function toggleActivitiesRectangle(button) {
    let section = document.getElementById("activities-container");
    if (!section) return;

    let existingBox = section.querySelector(".rectangle");
    if (existingBox) {
        existingBox.style.display = existingBox.style.display === "none" ? "block" : "none";
        return;
    }

    // 🏗️ Rebuild UI for Activity Input
    let box = document.createElement("div");
    box.className = "rectangle dynamic-section";
    box.innerHTML = `
        <div class="input-container">
            <input type="text" id="activityInput" placeholder="Type your activity..." class="input-box">
            <button id="saveActivityBtn" class="save-btn">Save</button>
        </div>
        <ul id="activityList"></ul>
        <div class="resizer"></div>
    `;

    section.appendChild(box);
    section.style.display = "block";

    makeDraggable(box);
    makeResizable(box);
    loadActivities(); // 🏆 Load past activities

    // 🔥 Reattach Event Listener to Save Button
    document.getElementById("saveActivityBtn").addEventListener("click", saveActivity);
}

function loadActivities() {
    let activityList = document.getElementById("activityList");
    if (!activityList) return;

    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activityList.innerHTML = ""; // Clear previous activities

    activities.forEach((activity, index) => {
        let listItem = document.createElement("li");

        let carbonValue = parseFloat(activity.carbon);
        let color = carbonValue > 0 ? "#D9534F" : "#3BB143"; // Red for emitting, green for neutral

        let carbonSquare = `
            <span class="carbon-square" style="background-color: ${color};">
                <input type="number" value="${carbonValue.toFixed(1)}" 
                    class="carbon-input" id="carbon-input-${index}" 
                    onchange="updateCarbon(${index}, this.value)">
                kg CO₂
            </span>`;

        listItem.innerHTML = `${carbonSquare} ${activity.name} 
            <button class="delete-btn" onclick="deleteActivity(${index})">❌</button>`;

        activityList.appendChild(listItem);
    });
}

function updateCarbonColor(index, newValue) {
    let carbonSquare = document.getElementById(`carbon-input-${index}`).parentNode;
    let color = newValue > 0 ? "#D9534F" : "#3BB143"; // Red for high emissions, green for low/neutral
    carbonSquare.style.backgroundColor = color;
}

function deleteActivity(index) {
    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.splice(index, 1);
    localStorage.setItem("activities", JSON.stringify(activities));

    loadActivities();
    updateTotalCarbon();
    updateEcoScore();
    updateClimateStreak(); // ✅ Ensure streak updates when activities are deleted
}

// 🏆 Dragging Function
function makeDraggable(element) {
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    element.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("resizer")) return;
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.position = "absolute";

        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", () => { 
            isDragging = false; 
            document.removeEventListener("mousemove", onDrag); 
        });
    });

    function onDrag(e) {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }
}

// 🔧 Resizing Function
function makeResizable(element) {
    let resizer = element.querySelector(".resizer");
    if (!resizer) return;

    let isResizing = false;

    resizer.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isResizing = true;

        document.addEventListener("mousemove", onResize);
        document.addEventListener("mouseup", () => { 
            isResizing = false; 
            document.removeEventListener("mousemove", onResize); 
        });
    });

    function onResize(e) {
        if (!isResizing) return;
        element.style.width = `${e.clientX - element.getBoundingClientRect().left}px`;
        element.style.height = `${e.clientY - element.getBoundingClientRect().top}px`;
    }
}

/* old question of the day databsase : make it structured so it's a giant
array that can be navigated through
*/
