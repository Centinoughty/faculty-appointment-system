# FAMS System - Beginner's Developer Guide

Welcome to the FAMS (Faculty Appointment Management System) codebase!

This document is tailored for developers, students, or faculty who might not be highly experienced in modern React or Next.js but need to understand, modify, or add features to this application.

## 1. What Technologies Are We Using?

- **React:** A JavaScript library for building user interfaces using reusable "Components".
- **Next.js (App Router):** A framework built on top of React. It handles routing (the URLs of the website) automatically based on the folders inside `src/app`.
- **Tailwind CSS:** A utility-first CSS framework. Instead of writing custom CSS files, we style our components directly using class names like `bg-blue-600`, `text-white`, `p-4` (padding 4), etc.
- **Lucide React:** A library for easy-to-use SVG icons (like `User`, `Clock`, `Calendar`).

## 2. Core Concepts to Understand

### State (`useState`)

In React, `useState` is how a component "remembers" things.

```tsx
import { useState } from "react";

function Counter() {
  // 'count' is the current value (starts at 0)
  // 'setCount' is the function we use to change the value
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
  );
}
```

Whenever `setCount` is called, React automatically re-draws the component on the screen with the new value. We use this for search boxes, opening/closing popups, and storing data.

### Components and Props

We broke the UI down into custom components (like `Card`, `Button`, `Input`) so they can be reused easily. "Props" are arguments you pass into those components.

```tsx
// Using our custom Button component
<Button variant="outline" size="lg">
  Click Me!
</Button>
```

### Folder Based Routing (Next.js)

In Next.js, the URL exactly matches the folder structure inside the `src/app` folder. The file `page.tsx` is what actually renders on the screen.

- `src/app/page.tsx` -> The root login page (`/`)
- `src/app/dashboard/student/page.tsx` -> The dashboard overview page (`/dashboard/student`)
- `src/app/dashboard/student/profile/page.tsx` -> The profile page (`/dashboard/student/profile`)

If you want to create a new page called `/dashboard/student/grades`, you just:

1. Create a folder named `grades` inside `src/app/dashboard/student/`
2. Inside `grades`, create a file named `page.tsx`
3. Export a React component from that file!

## 3. How to Modify Existing Features

### Editing Colors or Styles

All styling relies on Tailwind. If you see `<div className="text-gray-500 bg-white p-4">`, you can swap them directly:

- Change text color: `text-red-500`, `text-blue-700`
- Change background: `bg-green-100`, `bg-gray-900`
- Change spacing: `p-2` (padding), `m-4` (margin), `mt-6` (margin-top)
  _(For a full list of classes, search Google for "Tailwind CSS Documentation")_

### Adding a new button to the Sidebar Menu

1. Open `src/app/dashboard/student/layout.tsx`. (The `layout.tsx` file wraps around all pages in that folder, creating the sidebar/navigation).
2. Locate the `<nav>` section.
3. Copy one of the existing `<Link>` tags and paste it. Change the `href` to your new page, and swap the text and Icon.

### How Mock Data is being used

Currently, because the backend database isn't hooked up yet, you will see variables like `MOCK_REQUESTS` or `MOCK_PROFILE` at the top of the files.

```tsx
const MOCK_PROFILE = {
  name: "Nadeem M Siyam",
  program: "B.Tech Computer Science",
};
```

If you need to change what displays on the screen, just change these object values! Eventually, a backend API (like fetching from a real database) will replace these objects using the `useEffect` hook.

## 4. Useful Terminal Commands

Make sure you are in the directory containing `package.json` before running these. The project uses `bun` (a fast alternative to npm).

- **Start the website locally for development:** `bun run dev` (It will run on `http://localhost:3000`)
- **Add a new package:** `bun add <package-name>`
- **Build the website for deployment:** `bun run build`

## 5. File Structure Cheat Sheet

- `/src/app/` - The pages of the site linked to URLs
- `/src/components/ui/` - Reusable stylized components like generic Buttons and Cards designed simply for you to plug-and-play.
- `/src/lib/utils.ts` - Helper logic used mostly to merge CSS classnames cleanly.

## 6. Asking for Help

Always remember that you can ask ChatGPT or Github Copilot to explain a specific file. Just copy the code block and ask: _"Explain what this React component is doing step-by-step."_
React code is highly readable once you understand the core mechanics!
