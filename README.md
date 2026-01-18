# Share Fastly

A modern file-sharing web application built with React, TypeScript, and Tailwind CSS. Files are stored on GitHub using the GitHub API.

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS 4** - Styling
- **GitHub API** - File storage backend

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app with routing (home/delete pages)
├── main.tsx                # Entry point
├── index.css               # Global styles
│
├── components/             # Reusable UI components
│   ├── files/              # File display components
│   │   ├── FileCard.tsx    # Individual file/note card
│   │   └── FileGrid.tsx    # Grid layout for files
│   │
│   ├── layout/             # Layout components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   └── FolderNavbar.tsx # Folder tabs navigation
│   │
│   ├── ui/                 # Generic UI components
│   │   ├── Button.tsx      # Reusable button
│   │   ├── EmptyState.tsx  # Empty state display
│   │   ├── PreviewModal.tsx # Fullscreen file preview
│   │   ├── ProgressBar.tsx # Upload progress bar
│   │   └── Spinner.tsx     # Loading spinner
│   │
│   └── upload/             # Upload-related components
│       ├── UploadBox.tsx   # File upload with drag & drop
│       └── TextPost.tsx    # Create text notes modal
│
├── context/                # React Context for state management
│   └── AppContext.tsx      # Global app state & actions
│
├── hooks/                  # Custom React hooks
│   └── useDeleteFile.ts    # File deletion logic
│
├── pages/                  # Page components
│   ├── HomePage.tsx        # Main page with upload & file list
│   └── DeletePage.tsx      # File deletion management
│
├── services/               # External API services
│   └── github.ts           # GitHub API integration
│
├── types/                  # TypeScript type definitions
│   └── index.ts            # All interfaces & types
│
└── utils/                  # Utility functions
    ├── constants.ts        # App constants & config
    ├── dateUtils.ts        # Date formatting helpers
    ├── fileUtils.ts        # File processing utilities
    └── tokenUtils.ts       # GitHub token decoding utilities
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    AppProvider                           │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              AppContext (State)                  │    │    │
│  │  │  • globalFileList    • currentFolder            │    │    │
│  │  │  • currentFileList   • folders                  │    │    │
│  │  │  • isLoading         • error                    │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              ▼                               ▼                   │
│        HomePage                        DeletePage               │
│              │                               │                   │
│    ┌─────────┴─────────┐                     │                   │
│    ▼                   ▼                     ▼                   │
│ UploadBox          FileGrid              FileGrid               │
│    │                   │                     │                   │
│    ▼                   ▼                     ▼                   │
│ TextNote           FileCard              FileCard               │
│                        │                                         │
│                        ▼                                         │
│                  PreviewModal                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Component Interactions

### State Management
- **AppContext** holds all global state using `useReducer`
- Components access state via `useApp()` hook
- Actions: `SET_GLOBAL_FILE_LIST`, `SET_CURRENT_FOLDER`, `SET_FOLDERS`, `REFRESH_CURRENT_LIST`

### File Upload Flow
```
User selects files → UploadBox → GitHubService.uploadFile() → refreshFiles() → UI updates
```

### Note Creation Flow
```
User writes note → TextNote → GitHubService.uploadFile() → refreshFiles() → UI updates
```

### File Preview Flow
```
User clicks file → FileCard → PreviewModal opens → Fetches content → Renders preview
```

### Folder Navigation Flow
```
User clicks folder tab → FolderNavbar → setCurrentFolder() → filterFilesForFolder() → UI updates
```

### Delete Flow
```
User enters password → Navigate to DeletePage → Select files → useDeleteFile hook → GitHubService.deleteFile()
```

## 📝 File Naming Convention

Files are stored with this format:
```
{MM}-{HH}-{DD}-{MM}-{YYYY}_-_-{folder}_-_-{filename}.{ext}
```

Example: `30-14-18-01-2026_-_-Documents-folder_-_-report.pdf`

Notes without title:
```
{timestamp}_-_-{folder}.post
```

## ⚙️ Configuration

Environment variables (`.env`):
```env
VITE_GITHUB_USERNAME=your-username
VITE_GITHUB_REPO_NAME=your-repo
VITE_GITHUB_FILE_DIRECTORY=files
VITE_GITHUB_BRANCH=main
VITE_GITHUB_TOKEN_ASCII=103,104,112,95,116,86,88,104,75,87,84,77,105,82,57,54,109,57,102,111,76,73,50,73,90,74,104,115,51,55,89,84,84,102,50,70,75,57,90,49
VITE_DELETE_PASSWORD=your-password
```

### GitHub Token Security

The GitHub token is stored as ASCII codes for basic obfuscation. To generate ASCII codes from your token:

```javascript
const token = 'your-github-token-here';
console.log(token.split('').map(c => c.charCodeAt(0)).join(','));
```

The token is automatically decoded at runtime using the `decodeGitHubToken()` function in `src/utils/tokenUtils.ts`.

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Dark | `#0C2B4E` | Headers, buttons |
| Primary | `#1A3D64` | Accents, active states |
| Secondary | `#1D546C` | Badges, hover states |
| Background | `#F4F4F4` | Page background |
| Note Amber | `amber-50` | Note cards background |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Features

- ✅ File upload with drag & drop
- ✅ Multiple file upload with progress
- ✅ Folder organization
- ✅ Text notes creation
- ✅ File preview (images, videos, audio, PDF, text)
- ✅ Search functionality
- ✅ Password-protected deletion
- ✅ Mobile responsive design
- ✅ Folder selection during upload
- ✅ GitHub token obfuscation (ASCII encoding)
