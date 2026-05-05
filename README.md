# JobPortal Frontend

Frontend application for a multi-role recruitment platform built with `React`, `Vite`, `Tailwind CSS`, and `Redux Toolkit`.

The system serves four main user groups:

- `Candidate`
- `HR`
- `Company Admin`
- `Admin`

It covers authentication, role-based routing, job discovery, resume management, applications, company management, and realtime notifications.

## Overview

This project is the client-side application for a recruitment ecosystem where:

- candidates browse jobs, save jobs, manage resumes, update profiles, and track applications
- HR users manage jobs and review candidates
- company admins manage company data, invitations, and team-level recruitment activity
- admins manage users, companies, industries, categories, and overall platform data

The app is structured around domain-based `api/` and `services/` layers, Redux-managed authentication state, and route guards for authorization.

## Core Capabilities

### Candidate features

- Register and sign in
- Email verification flow
- Additional profile completion flow
- Browse jobs and companies
- Save and unsave jobs
- View job details and company details
- Manage profile information and avatar
- Upload resumes
- Parse resumes with AI-backed API endpoints
- View application history and status timeline

### HR features

- Access HR dashboard
- Manage company job postings
- Review candidate-facing recruitment data

### Company Admin features

- Access company dashboard
- Manage company profile
- Manage team members
- Manage invitation codes
- Manage jobs and candidate lists

### Admin features

- Manage users
- Manage companies
- Review company verification requests
- Manage industries/categories
- Manage jobs across the platform

### Platform features

- Role-based access control
- Automatic session restore on app boot
- Token refresh on `401`
- Realtime notifications over WebSocket
- Shared component library and design tokens

## Tech Stack

- `React 19`
- `Vite 7`
- `Tailwind CSS 3`
- `React Router DOM 7`
- `Redux Toolkit`
- `React Hook Form`
- `Axios`
- `Framer Motion`
- `SockJS + STOMP`
- `ESLint`

## Project Architecture

### Application bootstrap

The app starts in [`src/main.jsx`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/main.jsx), where it mounts:

- Redux `Provider`
- toast provider
- root `App`

[`src/App.jsx`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/App.jsx) dispatches `fetchCurrentUser()` on startup so the frontend can restore the authenticated session before the user navigates deeper into the app.

### Routing and authorization

Routing lives in [`src/routes/AppRoutes.jsx`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/routes/AppRoutes.jsx).

The app uses:

- `ProtectedRoute` for authenticated access
- `RequireRole` for role-based access checks
- lazy-loaded page modules

Role constants are defined in [`src/constants/roles.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/constants/roles.js):

- `ADMIN = 1`
- `COMPANY_ADMIN = 2`
- `HR = 3`
- `CANDIDATE = 4`

### State management

Redux store configuration is in [`src/store/index.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/store/index.js).

Main slices:

- `user`
- `notifications`

Authentication state is stored in [`src/store/userSlice.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/store/userSlice.js).

### API and service layering

The codebase separates transport from business-facing usage:

- `src/api/`: raw HTTP requests
- `src/services/`: service wrappers used by pages and components
- `src/utils/handleApi.js`: normalizes successful API return values

Main API domains currently present:

- `auth`
- `users`
- `jobs`
- `companies`
- `company admin`
- `dashboard`
- `applications`
- `resumes`
- `notifications`
- `categories`
- `HR`

## Folder Structure

```text
src/
  api/             HTTP clients for backend endpoints
  assets/          Static images
  components/      Reusable UI building blocks
  configs/         Navigation and app configuration
  constants/       Roles and shared constants
  contexts/        React context providers
  hooks/           Custom hooks
  pages/           Route-level pages grouped by domain and role
  routes/          Route definitions and guards
  services/        Domain services wrapping API calls
  store/           Redux store and slices
  utils/           Utilities and helpers
```

Page modules are grouped under:

- `pages/public`
- `pages/Auth`
- `pages/Admin`
- `pages/HR`
- `pages/CompanyAdmin`

## Main User Flows

### Authentication flow

Authentication is implemented through [`src/api/authApi.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/api/authApi.js) and [`src/services/authService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/authService.js).

Current auth flow includes:

- register
- login
- logout
- get current user
- refresh session
- verify email
- resend verification email

The route layer also enforces:

- redirect to `/verify` if the email is not verified
- redirect to `/additional-information` when required profile fields are incomplete
- role-aware redirect after login

### Job discovery flow

The public jobs page supports:

- keyword search
- location filtering
- industry filtering
- employment type filtering
- experience level filtering
- salary range filtering
- pagination
- saved jobs toggling

Primary modules:

- [`src/pages/public/Jobs.jsx`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/pages/public/Jobs.jsx)
- [`src/services/jobService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/jobService.js)
- [`src/hooks/useSaveJob.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/hooks/useSaveJob.js)

### Resume flow

Resume management includes:

- create resume
- upload resume file
- update resume
- delete resume
- set primary resume
- set public resume
- AI parsing endpoint integration

Primary modules:

- [`src/pages/public/MyResumes.jsx`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/pages/public/MyResumes.jsx)
- [`src/services/resumeService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/resumeService.js)
- [`src/api/resumeApi.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/api/resumeApi.js)

### Application flow

Application handling supports:

- apply to jobs
- view application history
- review application status history
- update application status from recruiter-side flows

Primary modules:

- [`src/pages/public/ApplicationHistory.jsx`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/pages/public/ApplicationHistory.jsx)
- [`src/api/ApplicationApi.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/api/ApplicationApi.js)
- [`src/services/applicationService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/applicationService.js)

### Company management flow

Company-related modules support:

- company listing and details
- company profile updates
- invitation creation
- company verification requests
- verification review
- industry management

Primary modules:

- [`src/api/companyApi.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/api/companyApi.js)
- [`src/services/companyService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/companyService.js)
- [`src/services/companyAdminService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/companyAdminService.js)

## Realtime Notifications

Notifications are initialized after authentication and torn down on logout.

Relevant modules:

- [`src/store/notificationActions.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/store/notificationActions.js)
- [`src/store/notificationSlice.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/store/notificationSlice.js)
- [`src/services/webSocketService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/webSocketService.js)

Implementation notes:

- WebSocket client uses `SockJS('/ws')`
- STOMP subscribes to `/user/queue/notifications`
- notification state is stored in Redux

## Styling System

The design system is centered around Tailwind plus shared CSS utility classes defined in [`src/index.css`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/index.css).

Notable style conventions:

- CSS variables for brand, text, surface, and feedback colors
- reusable semantic classes such as `vw-card`, `vw-input`, `vw-btn-*`, and `vw-badge-*`
- custom Tailwind theme extensions in [`tailwind.config.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/tailwind.config.js)
- font stack based on `Be Vietnam Pro` and `Rubik`

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

This variable is used by [`src/api/axiosClient.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/api/axiosClient.js).

If not provided, the app falls back to:

```text
http://localhost:8080/api/v1
```

## Local Development

### Requirements

- `Node.js >= 20`
- `npm >= 10`

### Install dependencies

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

## Available Scripts

- `npm run dev`: start the Vite development server
- `npm run build`: build the production bundle
- `npm run preview`: preview the production build locally
- `npm run lint`: run ESLint

## Backend Integration Notes

The frontend expects a backend that supports:

- cookie-based auth with `withCredentials: true`
- `/auth/refresh` for session refresh
- role-based user responses
- REST endpoints under `/api/v1`
- WebSocket endpoint at `/ws`

`axiosClient` is configured with:

- `baseURL` from `VITE_API_BASE_URL`
- `withCredentials: true`
- automatic retry after refresh when a request fails with `401`

## External Dependencies

The application also depends on a third-party Vietnamese address API in [`src/services/addressService.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/services/addressService.js):

```text
https://tinhthanhpho.com/api/v1
```

This is used for:

- provinces
- districts
- wards/communes

If this API is unavailable, address selectors and related forms may degrade.

## Build and Deployment

### Production build

```bash
npm run build
```

Build output is generated in:

```text
dist/
```

### Docker

The project includes a multi-stage [`Dockerfile`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/Dockerfile):

1. Build the app with `node:20-alpine`
2. Serve static assets with `nginx:alpine`

Build the image:

```bash
docker build -t jobportal-fe .
```

Run the container:

```bash
docker run -p 3000:80 jobportal-fe
```

Then open:

```text
http://localhost:3000
```

## Development Notes

- The project uses the `@` alias for `src/`.
- Vite dev server proxies `/ws` to `http://localhost:8080` for WebSocket development.
- Many page modules are lazy-loaded to reduce initial bundle cost.
- Error messages are normalized in [`src/utils/errorHandler.js`](/d:/tai%20nguyen/DuAn/JobPortal/JobPortalFe/src/utils/errorHandler.js).

## Recommended Next Improvements

- Add `.env.example`
- Add API contract documentation for backend integration
- Add deployment examples for reverse proxy and WebSocket forwarding
- Document known incomplete or placeholder admin dashboard data where applicable
