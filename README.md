# QuickNotes System Design

## Project Description

QuickNotes is a note-taking application project that demonstrates how a browser-based client communicates with a REST API and how a production backend can be designed to support one million registered users.

The front end uses HTML, CSS and vanilla JavaScript to load, create and delete notes through the JSONPlaceholder practice API. The design documentation describes the production API, relational database schema and scalable system architecture that a backend engineering team could implement.

## Features

- **Load notes:** Retrieve up to 10 notes using an HTTP GET request.
- **Create notes:** Submit a title and optional body using POST, with client-side title validation.
- **Delete notes:** Remove notes from the current displayed list using DELETE.
- **Request feedback:** Display loading, success, error and empty states.
- **Input safety:** Use `textContent` when displaying note content.
- **Request handling:** Handle HTTP failures, disable relevant buttons during requests and restore their state after completion.
- **System design:** Document the REST API, database model and production architecture for one million registered users.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- JSONPlaceholder practice API
- PostgreSQL
- SQL and Mermaid diagrams
- Git and GitHub

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run the API Client

### Prerequisites

- A modern web browser.
- An internet connection to access JSONPlaceholder.
- Optionally, Visual Studio Code with the Live Server extension.

### Option 1: Run using VS Code Live Server

1. Clone the repository or open the project folder in VS Code.
2. Install the Live Server extension if it is not already installed.
3. Open `index.html`.
4. Right-click inside the editor and select **Open with Live Server**.
5. Click **Load notes** to retrieve the first 10 notes.
6. Use the form to create a note or click a note's **Delete** button to remove it from the displayed list.

### Option 2: Open directly in a browser

Open `index.html` in a modern browser. The page will load its local JavaScript and CSS files and make requests to the external API when you interact with it.

Live Server is recommended for a more consistent local development experience.

### API endpoint

The client uses:

```text
https://jsonplaceholder.typicode.com/posts
```

The GET operation requests:

```text
https://jsonplaceholder.typicode.com/posts?_limit=10
```

POST requests send JSON containing `title`, `body` and `userId: 1`. DELETE requests target the individual post URL.

**Important limitation:** JSONPlaceholder is a practice API. It simulates successful creation and deletion responses but does not persist those changes as a real production service would. Newly created notes are displayed in the current browser session, while a subsequent reload retrieves the practice API's existing data.

## System Design Documentation

The following documents describe the proposed production QuickNotes service.

1. [API Design](docs/api-design.md) — REST endpoints, HTTP methods, request and response examples, status codes, validation and security.
2. [Data Model](docs/data-model.md) — Users, notes, tags, relationships, PostgreSQL schema, SQL queries, indexes and database selection.
3. [Architecture](docs/architecture.md) — Functional and non-functional requirements, capacity estimates, architecture diagram, request flows, trade-offs and high availability.

## What I Learned

1. **Working with REST APIs:** How to use JavaScript's Fetch API for GET, POST and DELETE operations, handle HTTP errors, validate input and communicate request status to users.
2. **Relational database design:** How primary keys, foreign keys, one-to-many relationships, many-to-many relationships, SQL joins and indexes support a maintainable data model.
3. **Scalable system architecture:** How load balancers, multiple application servers, caching, database replicas, message queues and background workers support reliability and growth.
4. **Error handling and security:** Why client-side validation must be complemented by server-side validation, authentication and authorization.
5. **Version control:** How meaningful Git commits document project progress and make changes easier to review.
6. **Design trade-offs:** How caching, database replication and asynchronous processing improve performance while introducing consistency and operational challenges.

## Future Improvements

- Replace JSONPlaceholder with a persistent QuickNotes backend.
- Implement user registration, authentication and authorization.
- Add note editing, searching, sorting and pagination.
- Implement tags and note-tag associations.
- Add automated unit and integration tests.
- Introduce deployment automation, monitoring, backups and production-grade security.

## Author

Developed as a system design and API integration project.