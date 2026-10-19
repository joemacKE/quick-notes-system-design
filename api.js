
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();

  return { data, status: response.status };
}

function showStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = type;
}

function renderEmptyState() {
  const item = document.createElement("li");
  item.textContent = "No notes found. Create your first note!";
  notesList.replaceChildren(item);
}

function renderNote(note) {
  const item = document.createElement("li");
  item.className = "note";
  item.dataset.id = String(note.id);

  const title = document.createElement("h3");
  title.textContent = note.title || "(Untitled note)";

  const body = document.createElement("p");
  body.textContent = note.body || "No body provided.";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-btn";

  deleteButton.addEventListener("click", () => {
    deleteNote(note.id, deleteButton);
  });

  item.append(title, body, deleteButton);
  return item;
}

function renderNotes(notes) {
  notesList.replaceChildren();

  if (notes.length === 0) {
    renderEmptyState();
    return;
  }

  notes.forEach((note) => {
    notesList.appendChild(renderNote(note));
  });
}

// Task 1: GET the first 10 notes.
async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    renderNotes(result.data);

    if (result.data.length === 0) {
      showStatus("No notes found.", "success");
    } else {
      showStatus(
        `Loaded ${result.data.length} notes from the server.`,
        "success"
      );
    }
  } catch (error) {
    showStatus(
      "Unable to load notes. Please check your connection and try again.",
      "error"
    );
    console.error("Load notes error:", error);
  } finally {
    loadButton.disabled = false;
  }
}

// Task 2: POST a new note.
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title for your note.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    const newNote = result.data;

    // JSONPlaceholder simulates POST responses but does not persist
    // new posts. Keep the returned note visible in this browser session.
    const emptyMessage = notesList.querySelector("li");

    if (
      notesList.children.length === 1 &&
      emptyMessage?.textContent.includes("No notes found")
    ) {
      notesList.replaceChildren();
    }

    notesList.prepend(renderNote(newNote));
    noteForm.reset();

    showStatus(
      `Note created (status ${result.status}, id ${newNote.id}).`,
      "success"
    );
  } catch (error) {
    showStatus(
      "Unable to create the note. Please try again.",
      "error"
    );
    console.error("Create note error:", error);
  } finally {
    submitButton.disabled = false;
  }
}

// Task 3: DELETE a note.
async function deleteNote(id, button) {
  button.disabled = true;
  showStatus("Deleting note...");

  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    const noteElement = notesList.querySelector(
      `[data-id="${CSS.escape(String(id))}"]`
    );

    if (noteElement) {
      noteElement.remove();
    }

    if (notesList.children.length === 0) {
      renderEmptyState();
    }

    // JSONPlaceholder simulates deletion but does not persist changes.
    showStatus(
      "Note deleted from the current view. The practice API does not permanently save changes.",
      "success"
    );
  } catch (error) {
    showStatus(
      "Unable to delete the note. Please try again.",
      "error"
    );
    console.error("Delete note error:", error);
    button.disabled = false;
  } finally {
    // A successfully deleted button is removed with its note.
    // A failed request leaves the button available for another attempt.
    if (button.isConnected) {
      button.disabled = false;
    }
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
