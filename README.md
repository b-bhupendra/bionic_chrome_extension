# Bionic Reader Extension

An assistive technology extension for the web that converts text into Bionic Reading format to enhance focus and comprehension, particularly for individuals with ADHD.

## Features

- **Custom Boding (Fixation)**: Adjust how many characters at the start of words are bolded.
- **Saccade Control**: Control the jump distance between eye fixation points.
- **Site Controls**: Whitelist or Blacklist domains for automatic conversion.
- **Targeted Reading**: Use CSS selectors to target specific areas of a page (e.g., just the main article text).
- **Live Sandbox**: Test settings in the options page before applying them globally.
- **Dark Mode Support**: Native dark mode for the dashboard.

## Installation

1. Clone this repository.
2. Run `npm install`.
3. Run `npm run build`.
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable "Developer mode".
6. Click "Load unpacked" and select the `dist` folder.

## Development

- `npm run dev`: Start the dashboard in development mode (preview).
- `npm run test`: Run the suite of bionic engine tests.
- `npm run build`: Generate the production extension bundle.

## Tech Stack

- **React 19** & **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Vitest** for testing
- **Lucide React** for iconography
- **Chrome Extension Manifest V3**
