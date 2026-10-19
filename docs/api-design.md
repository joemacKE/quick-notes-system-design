# QuickNotes API Design

## 1. Overview

QuickNotes is a note-taking service that allows authenticated users to create, retrieve, update, organize and delete notes. The API follows REST principles and exchanges data in JSON format over HTTPS.

The production API is separate from the JSONPlaceholder practice API used by the browser client. The production service will persist notes in a database and enforce authentication, authorization and validation on the server.

**Base URL:** `https://api.quicknotes.example/v1`

**Content type:** `application/json`

**Authentication:** Bearer token authentication using the HTTP `Authorization` header.

Example:

```http
Authorization: Bearer <access_token>
```

All note operations are scoped to the authenticated user. A user must not be able to read, update or delete another user's notes.

## 2. REST endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account. | 201 Created |
| POST | `/auth/login` | Authenticate a user and issue an access token. | 200 OK |
| GET | `/notes` | List the authenticated user's notes, with pagination and optional filters. | 200 OK |
| POST | `/notes` | Create a new note. | 201 Created |
| GET | `/notes/{noteId}` | Retrieve one note owned by the authenticated user. | 200 OK |
| PATCH | `/notes/{noteId}` | Update selected fields of an existing note. | 200 OK |
| DELETE | `/notes/{noteId}` | Delete a note owned by the authenticated user. | 204 No Content |
| GET | `/tags` | List tags available to the authenticated user. | 200 OK |
| POST | `/notes/{noteId}/tags` | Associate a tag with a note. | 201 Created |

### Endpoint behaviour

- **Registration:** Validates the submitted account details and creates a user.
- **Login:** Verifies credentials and returns an access token and token expiry information.
- **List notes:** Supports pagination using `limit` and `offset`, with optional search and tag filters.
- **Create note:** Validates the title and body before storing the note.
- **Get note:** Returns a single note if the authenticated user owns it.
- **Update note:** Changes only the fields supplied in the request.
- **Delete note:** Permanently removes the note and its tag associations within a database transaction.
- **List tags:** Returns tags available to the authenticated user.
- **Add tag:** Associates an existing authorized tag with the specified note.

For the notes endpoints, the server derives the user identity from the authenticated token rather than trusting a client-supplied `userId`.

## 3. List notes request and response

### Request

```http
GET /v1/notes?limit=10&offset=0 HTTP/1.1
Host: api.quicknotes.example
Authorization: Bearer <access_token>
Accept: application/json
```

The `limit` parameter controls the maximum number of results, while `offset` identifies the starting position. The server enforces a maximum page size to prevent excessively expensive requests.

### Successful response

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "note_101",
      "title": "Project planning",
      "body": "Prepare the project milestones.",
      "createdAt": "2026-10-19T08:30:00Z",
      "updatedAt": "2026-10-19T08:30:00Z",
      "tags": [
        {
          "id": "tag_1",
          "name": "work"
        }
      ]
    },
    {
      "id": "note_102",
      "title": "Reading list",
      "body": "Review the recommended books.",
      "createdAt": "2026-10-18T14:00:00Z",
      "updatedAt": "2026-10-18T14:00:00Z",
      "tags": []
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 2,
    "hasMore": false
  }
}
```

The example contains two records for illustration. The actual number returned depends on the user's notes and the requested page size.

## 4. Create note request and response

### Request

```http
POST /v1/notes HTTP/1.1
Host: api.quicknotes.example
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Request body:

```json
{
  "title": "Project planning",
  "body": "Prepare the project milestones."
}
```

The title is required, must contain non-whitespace characters and cannot exceed 100 characters. The body is optional and may be an empty string. The authenticated user's identity is assigned by the server.

### Successful response

**Status:** `201 Created`

```http
Location: /v1/notes/note_101
```

```json
{
  "data": {
    "id": "note_101",
    "title": "Project planning",
    "body": "Prepare the project milestones.",
    "createdAt": "2026-10-19T08:30:00Z",
    "updatedAt": "2026-10-19T08:30:00Z",
    "tags": []
  }
}
```

The server generates the note identifier and timestamps. The response confirms that the note has been persisted.

## 5. Update and delete examples

### Update a note

Request:

```http
PATCH /v1/notes/note_101
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Updated project plan"
}
```

Response: `200 OK`

```json
{
  "data": {
    "id": "note_101",
    "title": "Updated project plan",
    "body": "Prepare the project milestones.",
    "createdAt": "2026-10-19T08:30:00Z",
    "updatedAt": "2026-10-19T09:00:00Z",
    "tags": []
  }
}
```

### Delete a note

Request:

```http
DELETE /v1/notes/note_101
Authorization: Bearer <access_token>
```

Response:

```http
HTTP/1.1 204 No Content
```

A successful deletion returns no response body. The server also removes the note's tag associations. The design uses a permanent delete; if recovery becomes a product requirement, soft deletion can be introduced.

## 6. Error handling

The API uses standard HTTP status codes and a consistent JSON error format. Error responses must not expose database details, stack traces, credentials or other sensitive information.

### Error status codes

| Status | Name | Meaning |
|---|---|---|
| 400 | Bad Request | Invalid JSON, malformed parameters or invalid input format. |
| 401 | Unauthorized | Missing, invalid or expired authentication credentials. |
| 403 | Forbidden | The user is authenticated but lacks permission for the requested operation. |
| 404 | Not Found | The requested resource does not exist or is not accessible to the user. |
| 409 | Conflict | A conflicting operation, such as registering an existing email address. |
| 413 | Content Too Large | The request exceeds the permitted payload size. |
| 415 | Unsupported Media Type | The request uses an unsupported content type. |
| 422 | Unprocessable Content | Valid JSON fails business validation, such as a missing title. |
| 429 | Too Many Requests | The client has exceeded its rate limit. |
| 500 | Internal Server Error | An unexpected server-side failure occurred. |
| 503 | Service Unavailable | The service is temporarily unavailable. |

### Example error response

**Status:** `422 Unprocessable Content`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must not exceed 100 characters."
      }
    ],
    "requestId": "req_a81c92"
  }
}
```

The `requestId` allows support and engineering teams to trace failures through application logs without exposing internal implementation details.

## 7. Pagination, filtering and sorting

The list endpoint supports:

- `limit`: Maximum number of notes returned, with a configurable server-side cap.
- `offset`: Number of records to skip.
- `q`: Optional text search across note titles and bodies.
- `tag`: Optional tag identifier or supported tag filter.
- `sort`: An approved sort field, such as `createdAt`.
- `order`: `asc` or `desc`.

Example:

```http
GET /v1/notes?limit=20&offset=0&sort=createdAt&order=desc
```

The API validates all query parameters and uses parameterized database queries to prevent SQL injection. For large datasets, cursor-based pagination may replace offset pagination to improve performance.

## 8. Security and reliability

1. All production traffic uses HTTPS.
2. Authentication tokens are verified on every protected request.
3. Authorization checks restrict notes and tag associations to their owners.
4. Request bodies are validated on the server, even when client-side validation exists.
5. SQL queries use parameterized statements or a safe database abstraction.
6. Rate limiting helps protect against abusive traffic and accidental request storms.
7. Logs include request identifiers and operational details without storing passwords or access tokens.
8. Database backups, monitoring and tested recovery procedures protect against data loss.
9. Database transactions preserve consistency when notes and their tag associations are modified.
10. API versions are included in the URL so future breaking changes can be introduced in a controlled manner.

## 9. Design decisions

REST is appropriate because the service manages identifiable resources such as users, notes and tags. Standard HTTP methods make operations predictable, while JSON provides a convenient format for browser clients and other consumers.

The API separates the practice client from the production service. JSONPlaceholder is useful for demonstrating GET, POST and DELETE requests, but it is not the persistent backend for QuickNotes. The production API must implement authentication, ownership checks, durable database storage and the error-handling contract described above.

