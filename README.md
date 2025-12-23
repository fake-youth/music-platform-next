# Music Platform Next.js

A modern, full-featured music streaming application built with Next.js, Prisma, and Tailwind CSS.

## Features

- **Music Streaming**: Audio playback with chunked streaming, seeking, and volume control.
- **Browse & Discovery**: Advanced search, filtering by genre/duration, sorting, and new releases.
- **Library Management**: Playlist creation, favorites (likes), and listening history.
- **Social**: Follow artists and users, comments on songs, and real-time notifications.
- **Artist & Album Pages**: Dedicated pages for artists and albums with discography.
- **PWA Support**: Installable on mobile/desktop with offline support.
- **Premium Subscription**: Tiered access (Free/Premium) with feature locking.
- **Internationalization**: Multi-language support (English / Bahasa Indonesia).
- **Admin Dashboard**: Manage songs, users, and view analytics.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [SQLite](https://www.sqlite.org/index.html) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/fake-youth/music-platform-next.git
    cd music-platform-next
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Database**:
    ```bash
    npx prisma db push
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  **Open Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint.
- `npm run test`: Run Vitest tests.

## License

MIT
