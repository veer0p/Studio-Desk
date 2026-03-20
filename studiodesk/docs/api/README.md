# StudioDesk API Documentation

Welcome to the StudioDesk API documentation. All endpoints are versioned under `/api/v1`.

## 🔒 Authentication

All protected endpoints require a valid Supabase session cookie or a Bearer token in the `Authorization` header.

| Endpoint | Method | Description | Docs |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/signup` | `POST` | Register new studio & owner | [Auth Docs](./auth.md) |
| `/api/v1/auth/login` | `POST` | Login user | [Auth Docs](./auth.md) |
| `/api/v1/auth/me` | `GET` | Get current session info | [Auth Docs](./auth.md) |

---

## 📅 Bookings

Manage your photography bookings and leads.

| Endpoint | Method | Description | Docs |
| :--- | :--- | :--- | :--- |
| `/api/v1/bookings` | `GET`, `POST` | List and create bookings | [Bookings Docs](./bookings.md) |
| `/api/v1/bookings/:id` | `GET`, `PATCH`, `DELETE` | Manage single booking | [Bookings Docs](./bookings.md) |
| `/api/v1/bookings/:id/status` | `PATCH` | Update booking status | [Bookings Docs](./bookings.md) |

---

## 📄 Proposals

Create and send proposals to clients.

| Endpoint | Method | Description | Docs |
| :--- | :--- | :--- | :--- |
| `/api/v1/proposals` | `GET`, `POST` | List and create proposals | [Proposals Docs](./proposals.md) |
| `/api/v1/proposals/:id/send` | `POST` | Send proposal to client | [Proposals Docs](./proposals.md) |

---

## 📦 Packages

Define your service packages and add-ons.

| Endpoint | Method | Description | Docs |
| :--- | :--- | :--- | :--- |
| `/api/v1/packages` | `GET`, `POST` | Manage packages | [Packages Docs](./packages.md) |

---

## 🏢 Studio

Manage your studio profile and team.

| Endpoint | Method | Description | Docs |
| :--- | :--- | :--- | :--- |
| `/api/v1/studio/profile` | `GET`, `PATCH` | Studio profile | [Studio Docs](./studio.md) |
| `/api/v1/studio/team` | `GET`, `POST` | Team management | [Team Docs](./team.md) |

---

## Error Handling

All errors follow the standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
