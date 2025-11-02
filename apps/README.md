# FuzzyFindJS Apps

This directory contains standalone HTML applications for FuzzyFindJS.

## 📊 Test Dashboard (`tests.html`)

Displays results from the actual Vitest test suite in a beautiful dashboard.

**Features:**
- ✅ Shows ALL 191 tests from `src/__tests__/`
- ✅ Real-time results display
- ✅ Test statistics (total, passed, failed, duration)
- ✅ Export results as JSON
- ✅ Clean, modern UI with Tailwind CSS
- ✅ Detailed error messages for failed tests
- ✅ Per-suite breakdown with pass rates

**Usage:**
```bash
# Step 1: Generate test results
npm run test:json

# Step 2: Open the dashboard
open apps/tests.html

# Or serve with a local server
npx serve apps
# Then visit: http://localhost:3000/tests.html
```

**Test Suites Included:**
- All 11 test files from `src/__tests__/`
- 191 total tests
- Includes: Basic, Highlighting, Cache, Batch Search, Serialization, Accent Normalization, Field Weighting, Stop Words, Word Boundaries, Inverted Index, Data Indexer

## 📚 Documentation (`docs.html`)

Interactive documentation viewer that automatically fetches and renders the README.md.

**Features:**
- ✅ Automatic README.md fetching
- ✅ Sidebar navigation (desktop) with all headings (h2-h6)
- ✅ Mobile-responsive with hamburger menu
- ✅ Scroll spy (highlights current section)
- ✅ Smooth scrolling
- ✅ Clean, modern design (no rounded corners, minimal borders, no shadows)
- ✅ Markdown rendering with syntax highlighting

**Usage:**
```bash
# Open in browser
open apps/docs.html

# Or serve with a local server
npx serve apps
```

**Navigation:**
- Desktop: Fixed left sidebar with all chapters
- Mobile: Hamburger menu (top-left)
- Auto-generated from README.md headings

## 🎨 Design System

Both pages use:
- **Tailwind CSS** (CDN)
- **No rounded corners**
- **Minimal borders** (1px solid)
- **No shadows**
- **Clean, modern aesthetic**
- **Responsive design**

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/LucaIsMyName/fuzzyfindjs.git
cd fuzzyfindjs

# Install dependencies
npm install

# Build the library
npm run build

# Serve the apps
npx serve apps

# Open in browser
# http://localhost:3000/tests.html
# http://localhost:3000/docs.html
```

## 📝 Notes

- Both pages work standalone (no build step required)
- Tests run directly in the browser using ES modules
- Documentation is dynamically generated from README.md
- All styling is inline (no external CSS files)
