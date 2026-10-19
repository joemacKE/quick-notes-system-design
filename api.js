
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // JSONPlaceholder may return an empty body for DELETE.
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

function renderNote(note) {
  const item = document.createElement("li");
  item.className = "note";

  const title = document.createElement("h3");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body;

  item.append(title, body);
  return item;
}

function renderNotes(notes) {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No notes found. Create your first note!";
    notesList.appendChild(item);
    return;
  }

  notes.forEach((note) => {
    notesList.appendChild(renderNote(note));
  });
}

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

loadButton.addEventListener("click", loadNotes);
