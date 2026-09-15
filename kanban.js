/**
 * AuraBoard - Kanban Task Manager Logic
 * Uses custom Singly Linked Lists for column cards
 * and a Hash Map to index the columns.
 */

// ==========================================
// 1. DATA STRUCTURE DEFINITIONS
// ==========================================

class TaskNode {
    /**
     * @param {string} id - Task ID (e.g., 'K001')
     * @param {string} text - Description of task
     * @param {string} priority - Low, Medium, High
     * @param {string} address - Simulated memory address (e.g., '0x94B0')
     */
    constructor(id, text, priority, address) {
        this.id = id;
        this.text = text;
        this.priority = priority;
        this.address = address;
        
        // Singly Linked List pointer
        this.next = null; 
    }
}

class TaskQueue {
    constructor() {
        this.head = null;
        this.tail = null; // Maintain tail pointer for O(1) appends
        this.size = 0;
    }

    /**
     * Appends a task to the end of the Singly Linked List
     * Complexity: O(1)
     */
    append(node) {
        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
        node.next = null; // Ensure next is reset
        this.size++;
    }

    /**
     * Deletes a node by its ID
     * Complexity: O(n)
     */
    deleteById(id) {
        if (!this.head) return null;

        let curr = this.head;
        let prev = null;

        while (curr) {
            if (curr.id === id) {
                // If it's the head node
                if (curr === this.head) {
                    this.head = this.head.next;
                    if (!this.head) {
                        this.tail = null; // List is now empty
                    }
                } 
                // If it's the tail node or middle node
                else {
                    prev.next = curr.next;
                    if (curr === this.tail) {
                        this.tail = prev; // Update tail pointer
                    }
                }
                this.size--;
                curr.next = null;
                return curr; // Return the extracted node
            }
            prev = curr;
            curr = curr.next;
        }
        return null;
    }
}

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================

// Registry (Hash Map) mapping Key (Column Name) -> Value (TaskQueue List)
const boardRegistry = new Map();
boardRegistry.set("Todo", new TaskQueue());
boardRegistry.set("In-Progress", new TaskQueue());
boardRegistry.set("Done", new TaskQueue());

// Simulated memory address allocator
let heapAddressCounter = 0x9040;
function allocateAddress() {
    const hex = '0x' + heapAddressCounter.toString(16).toUpperCase();
    heapAddressCounter += Math.floor(Math.random() * 20) + 10; // Jump reference
    return hex;
}

// Task unique ID generator
let taskIdCounter = 1;
function generateTaskId() {
    return 'K' + String(taskIdCounter++).padStart(3, '0');
}

// ==========================================
// 3. CORE LOGIC OPERATIONS
// ==========================================

// Add a brand new task
function handleAddTask(text, colName, priority) {
    const id = generateTaskId();
    const address = allocateAddress();
    const newTask = new TaskNode(id, text, priority, address);

    // Retrieve column list from Hash Map in O(1)
    const list = boardRegistry.get(colName);
    if (list) {
        list.append(newTask);
        renderBoard();
        highlightRegistrySlot(colName);
    }
}

// Move a task from one column to another
function handleMoveTask(taskId, sourceCol, targetCol) {
    // 1. Retrieve the list from Hash Map in O(1)
    const sourceList = boardRegistry.get(sourceCol);
    const targetList = boardRegistry.get(targetCol);

    if (sourceList && targetList) {
        // 2. Delete node from source Singly Linked List (O(n) search & delete)
        const node = sourceList.deleteById(taskId);
        if (node) {
            // 3. Append to target list in O(1) time
            targetList.append(node);
            renderBoard();
            highlightRegistrySlot(targetCol);
        }
    }
}

// Delete a task entirely
function handleDeleteTask(taskId, colName) {
    const list = boardRegistry.get(colName);
    if (list) {
        list.deleteById(taskId);
        renderBoard();
        highlightRegistrySlot(colName);
    }
}

// ==========================================
// 4. RENDERING FUNCTIONS
// ==========================================

function renderBoard() {
    // A. Render Task Nodes inside columns
    boardRegistry.forEach((list, colName) => {
        const listContainer = document.getElementById(`list-${colName}`);
        const countSpan = document.getElementById(`count-${colName}`);
        
        listContainer.innerHTML = "";
        countSpan.innerText = list.size;

        if (list.size === 0) {
            listContainer.innerHTML = `<div class="empty-col-text">No tasks here</div>`;
            return;
        }

        let curr = list.head;
        while (curr) {
            const cardWrapper = document.createElement("div");
            cardWrapper.className = "task-card-container";

            // Determine if "Move Next" is applicable
            let nextCol = null;
            if (colName === "Todo") nextCol = "In-Progress";
            else if (colName === "In-Progress") nextCol = "Done";

            const moveBtnHtml = nextCol 
                ? `<button class="btn-move" onclick="handleMoveTask('${curr.id}', '${colName}', '${nextCol}')">Move Next &rarr;</button>`
                : "";

            cardWrapper.innerHTML = `
                <div class="task-card" id="card-${curr.id}">
                    <div class="card-header">
                        <span class="card-id">${curr.id}</span>
                        <span class="card-priority ${curr.priority.toLowerCase()}">${curr.priority}</span>
                    </div>
                    <div class="card-body">${curr.text}</div>
                    <div class="card-address">Address: ${curr.address}</div>
                    <div class="card-pointer-info">
                        next pointer: <strong>${curr.next ? curr.next.address : 'NULL'}</strong>
                    </div>
                    <div class="card-actions">
                        ${moveBtnHtml}
                        <button class="btn-del" onclick="handleDeleteTask('${curr.id}', '${colName}')">Delete</button>
                    </div>
                </div>
            `;

            listContainer.appendChild(cardWrapper);

            // Add visual down arrow between nodes if there is a next task
            if (curr.next) {
                const arrowDiv = document.createElement("div");
                arrowDiv.className = "visual-arrow-down";
                arrowDiv.innerHTML = `
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                `;
                listContainer.appendChild(arrowDiv);
            }

            curr = curr.next;
        }
    });

    // B. Render Hash Map Registry status
    const registryContainer = document.getElementById("registry-grid");
    registryContainer.innerHTML = "";

    boardRegistry.forEach((list, colName) => {
        const card = document.createElement("div");
        card.className = "registry-card";
        card.id = `reg-col-${colName}`;
        card.innerHTML = `
            <div class="registry-key">"${colName}"</div>
            <div class="registry-val">&rarr; Head: ${list.head ? list.head.address : 'NULL'}</div>
            <div class="registry-size">${list.size} tasks in SLL</div>
        `;
        registryContainer.appendChild(card);
    });
}

function highlightRegistrySlot(colName) {
    const slot = document.getElementById(`reg-col-${colName}`);
    if (slot) {
        slot.classList.add("active-map");
        setTimeout(() => slot.classList.remove("active-map"), 1500);
    }
}

// ==========================================
// 5. INITIALIZATION &preset loaders
// ==========================================

function preloadDemoTasks() {
    handleAddTask("Set up project architecture", "Todo", "Medium");
    handleAddTask("Revise Linked List pointer deletion", "Todo", "High");
    handleAddTask("Draft coding documentation", "In-Progress", "Low");
    handleAddTask("Initialize repository", "Done", "Medium");
}

document.addEventListener("DOMContentLoaded", () => {
    // Form submission binding
    const form = document.getElementById("add-task-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = document.getElementById("task-text").value;
        const col = document.getElementById("task-column").value;
        const priority = document.getElementById("task-priority").value;

        handleAddTask(text, col, priority);
        form.reset();
    });

    // Preload items
    preloadDemoTasks();
});
