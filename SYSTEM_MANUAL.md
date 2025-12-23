# Music Platform System Manual

## 1. Overview
This is a fully featured modern music streaming platform built with Next.js 14, TailwindCSS, and Prisma (SQLite). It includes three distinct roles: **User**, **Admin**, and **Super Admin**.

---

## 2. Core Features (User Side)
- **Music Playback**: Persistent player, continuous playback, skip/prev/shuffle/repeat.
- **Discovery**:
  - **Explore**: Trending songs, new releases.
  - **Search**: Filter by Song, Artist, Album, Genre, Duration.
  - **Genre Browser**: Visual genre categories.
- **Library**:
  - **Liked Songs**: Quick access to favorites.
  - **Playlists**: Create, edit, and delete personal playlists.
  - **History**: Recently played tracks.
- **Social**:
  - **Follow System**: Follow artists or other users.
  - **Comments**: Nested discussions on songs.
  - **Notifications**: Real-time alerts for likes, follows, etc.
- **Premium**: Subscription mock flow (Free vs Premium plans).

---

## 3. Admin Panel (`/admin`)
Designed for Content Managers.
- **Dashboard**: Real-time stats (Users, Songs, Streams) & Charts.
- **Content Management (CRUD)**:
  - **Songs**: Upload audio (MP3), auto-duration detection, relative file optimization.
  - **Albums**: Create albums, link to artists.
  - **Artists**: Manage profiles, verification status.
  - **Comments**: Moderate user discussions.
- **System Safety**:
  - **Auto-Cleanup**: Deleting a song physically deletes the file from the server.
  - **Integrity**: Deleting a genre is protected if songs rely on it.
  - **Global Error Handling**: Custom Cyberpunk 500/404 pages.
  - **PWA Ready**: Manifest and Icons installed.

---

## 4. Super Admin Panel (`/super-admin`)
Designed for System Owners.
- **User Management**:
  - List all users with Search.
  - **Ban/Unban** users.
  - **Change Roles** (Promote User to Admin).
- **System Control**:
  - Direct sidebar access to all Global Content (Songs, etc.).
  - **Audit Logs**: Track critical actions (Who banned whom, who deleted what).
- **Settings**: Global app configuration.

---

## 5. Technical Highlights
- **Stack**: Next.js 14 (App Router), Prisma, SQLite, TailwindCSS.
- **Performance**:
  - `React.memo` & `useCallback` for heavy UI components.
  - In-memory caching for API responses.
  - Debounced search & database queries.
- **Security**:
  - Middleware-based role protection.
  - Audit logging for accountability.
  - Input validation (Zod) on all APIs.
  - **Self-Service Security**: Change Password feature.

## 6. Future Recommendations (Versions 2.0)
- **Email Service**: Integration with SendGrid/SMTP for Forgot Password.
- **Cloud Storage**: Migrate `public/uploads` to AWS S3/Cloudinary for scalability.
- **Payment Gateway**: Integrate Midtrans/Stripe for real payments.
