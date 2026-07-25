# SvelteKit Notes Vault — Full Stack Notes & Tag Manager

A full-stack server-rendered notes application built with SvelteKit 5, TypeScript, and Vanilla CSS. Features server-side data loading (`+page.server.ts`), SvelteKit Form Actions for zero-JS fallback mutations (create, edit, delete, pin), tag indexing, real-time search filtering, and custom accent color options.

## Stack
- **Framework**: SvelteKit 5 + Vite + `@sveltejs/adapter-vercel`
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Dark Glassmorphic Design System)
- **State & SSR**: Svelte 5 Runes (`$state`, `$props`) & SvelteKit Form Actions
- **Testing**: Vitest

## Setup
```bash
# Clone the repository
git clone https://github.com/breakingthebot/sveltekit-notes-build43.git
cd sveltekit-notes-build43

# Install dependencies
npm install

# Run dev server
npm run dev
```

## Environment Variables
Refer to `.env.example`:
```
PUBLIC_APP_TITLE=SvelteKit Notes Vault
```

## Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Running Tests
```bash
npm run test
```

## Deployed
- **Live Vercel Production**: [https://sveltekit-notes-build43.vercel.app](https://sveltekit-notes-build43.vercel.app)
- **GitHub Repository**: [https://github.com/breakingthebot/sveltekit-notes-build43](https://github.com/breakingthebot/sveltekit-notes-build43)

## Architecture Notes
Plain English explanation of what was built and why:
"I built SvelteKit Notes Vault as a full-stack server-rendered notes application. By leveraging SvelteKit's `+page.server.ts` load functions, note data and tag indices are fetched on the server side prior to rendering HTML, providing instant page load times and optimal SEO. I implemented SvelteKit Form Actions (`?/create`, `?/update`, `?/delete`, `?/togglePin`) for native form submissions that work even if JavaScript is disabled. Svelte 5 Runes (`$state`, `$props`) power reactive modal states."

## Features
- 🚀 **Full-Stack Server Data Loading**: Server-rendered notes and tag indices loaded via `+page.server.ts`.
- ⚡ **SvelteKit Form Actions**: Native `POST` form action handlers for `create`, `update`, `delete`, and `togglePin`.
- 🏷️ **Tag Indexing & Filter Pills**: Filter notes dynamically by custom tags (`#sveltekit`, `#design`, `#productivity`).
- 🔍 **Real-Time Search Bar**: Instant search filtering across note titles, contents, and tags.
- 📌 **Pin & Priority Ordering**: Toggle pinned status to lock critical notes to the top of the grid.
- 🎨 **Color Accents & Glassmorphism**: Custom color themes (*Cyan*, *Emerald*, *Purple*, *Amber*, *Pink*) with dark glassmorphic styling.

## Data Handling
Default posture: All note operations and tag indices are processed server-side in memory during runtime. No personal user data is sold or transmitted to third-party tracking services.

## License
MIT License
