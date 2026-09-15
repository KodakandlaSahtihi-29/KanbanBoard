# AuraBoard - Interview Guide & DSA Explainer

This document is your cheat sheet to explaining the **AuraBoard** project during an interview. It is structured to help you look prepared, confident, and knowledgeable about basic data structures.

---

## 1. The 30-Second Interview Pitch

> *"For my project, I built a Trello/Kanban task manager called **AuraBoard**. Instead of using simple built-in arrays to store tasks, I built it from the ground up using core Data Structures: a **Hash Map** combined with **Singly Linked Lists**. 
>
> In this app, each column on the board is a custom Singly Linked List, and all columns are indexed in a Hash Map. Moving a task from one column to another is done by searching and decoupling a node from one list and appending it directly to the target list."*

---

## 🚀 How to Open & Run the Project

Since AuraBoard is built with pure Vanilla HTML, CSS, and JavaScript, no complex build steps, installations, or Node.js runtime are required!

### 🌐 Option 1: View the Live Demo Online (Instant)
You can directly open and use the live application hosted via GitHub Pages:
👉 **[Live Demo on GitHub Pages](https://kodakandlasahtihi-29.github.io/KanbanBoard/)**

### 💻 Option 2: Direct File Opening Locally (Easiest)
1. Navigate to the project directory on your computer.
2. Simply double-click the **`index.html`** file (or right-click -> **Open with** -> your favorite browser like Chrome, Edge, Firefox, or Brave).
3. The board will immediately open and run locally.

### 🔌 Option 3: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if you haven't already.
3. Right-click on `index.html` and choose **"Open with Live Server"**.
4. Your browser will automatically launch at `http://127.0.0.1:5500`.

### ⚡ Option 4: Local Python HTTP Server
If you prefer running a lightweight command-line server:
```bash
# In the project directory, run:
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 2. The Architecture (In Simple Terms)

### A. The Tasks (Singly Linked List Nodes)
Every task card is a **Node** in memory. It holds:
- **Data**: Task ID, Description, Priority.
- **Pointer (`next`)**: The memory address of the next task card in that column. If it's the last card, `next` points to `NULL`.

```
[Task K001] (Address: 0x9040)
  |-- text: "Revise Heap Sort"
  |-- priority: "High"
  |-- next: 0x905E -------------------> [Task K002] (Address: 0x905E)
                                           |-- text: "Design UI"
                                           |-- priority: "Low"
                                           |-- next: NULL (Tail Node)
```

### B. The Columns (Singly Linked List)
Each column is a `TaskQueue` that holds reference points:
- `head`: Points to the first task in the column.
- `tail`: Points to the last task in the column (allows us to add new tasks instantly in $O(1)$ time).

### C. The Board Registry (Hash Map)
Instead of using complex lookup logic to find which column is which, we use a Hash Map:
- **Key**: Column Name string (e.g. `"Todo"`, `"In Progress"`, `"Done"`).
- **Value**: The respective `TaskQueue` (Singly Linked List) object.

---

## 3. High-Scoring Interview Questions & Answers

### Q1: Why did you use a Singly Linked List for the columns instead of an Array?
* **Answer**: 
  > *"With arrays, if you delete an element from the beginning or middle, the computer has to shift all remaining elements in memory to update their indices. This takes linear time $O(n)$. 
  > With a Linked List, there is no shifting. We delete elements by simply pointing the preceding node's `next` pointer to the succeeding node's address ($O(1)$ rewiring). It's more memory-efficient for continuous insertions and deletions."*

### Q2: Why did you maintain a `tail` pointer in your `TaskQueue` class?
* **Answer**: 
  > *"Normally, to add an item to the end of a Singly Linked List, you have to start at the head and walk all the way to the end, which takes $O(n)$ time. By keeping a pointer to the `tail` node, we can append new tasks to the end of any column instantly in $O(1)$ constant time."*

### Q3: How does the Hash Map help in this project?
* **Answer**: 
  > *"When a user adds or moves a task, we need to locate the target column's list. If we stored the columns in an array, we would have to search through them. By using a Hash Map, we can retrieve the correct column's list instantly using its name (like 'Todo') in $O(1)$ time."*

### Q4: Explain the exact step of moving a task from "Todo" to "In Progress".
* **Answer**:
  > *"To move a task, we perform three quick steps:
  > 1. Retrieve the source list ('Todo') and target list ('In Progress') from our Hash Map in $O(1)$ time.
  > 2. Search the source list to find the node, decouple it by setting `prev.next = node.next` ($O(n)$ search, $O(1)$ deletion).
  > 3. Append the node to the target list's tail pointer, updating the tail pointer in $O(1)$ time."*

---

## 4. Complexity Quick Table

Use this table to prove your understanding of Big-O complexity:

| Operation | Array-Based | AuraBoard (Our Project) | Why? |
|---|---|---|---|
| **Add Task to Tail** | $O(1)$ | **$O(1)$** | Target list is retrieved from the Hash Map in $O(1)$ and appended instantly using the `tail` pointer. |
| **Delete Head Task** | $O(n)$ | **$O(1)$** | Removing the head node only requires shifting the `head` pointer forward (`head = head.next`). No element shifting. |
| **Move Task** | $O(n)$ | **$O(n)$** | We must search for the task node in the source list ($O(n)$), decouple it, and append it to the target tail ($O(1)$). |
