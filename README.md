# File Uploader with Cloudflare R2 Integration

Welcome to the **File Uploader** project! This is a modern file management application built with **Next.js**. It’s designed to make uploading, managing, and interacting with files as smooth as possible. With features like **file renaming**, **deletion**, and **copy-to-clipboard**, this app is perfect for anyone looking for a simple yet powerful file management solution. Plus, it integrates seamlessly with **Cloudflare R2** for fast and reliable file storage.

---

## Features

### 🚀 **File Upload**

- Drag-and-drop or select files for upload.
- Upload multiple files at once.
- A **Pending Files** section lets you:
  - Edit file names before uploading.
  - Remove files from the pending list if needed.

### 🛠️ **File Management**

- View uploaded files in a clean, organized list.
- Rename files directly from the UI with instant updates.
- Delete files with a single click.

### 📋 **Copy-to-Clipboard**

- Quickly copy a file's URL to your clipboard.
- A tooltip confirms success with a "Copied!" message.

### ☁️ **Cloudflare R2 Integration**

- Files are uploaded to and retrieved from **Cloudflare R2**, ensuring fast and secure storage.
- The app uses R2's API for efficient file operations like uploading, renaming, and deleting.

---

## How It Works

### Uploading Files

1. Drag-and-drop files into the **Pending Files** section or use the file input.
2. Edit file names if needed.
3. Click the **Upload Files** button to send files to **Cloudflare R2**.
4. Uploaded files appear in the **Uploaded Files** section with their URLs.

### Renaming Files

1. Click the **Edit** button next to a file in the **Uploaded Files** section.
2. Modify the file name in the input field.
3. Press `Enter` or click the **Check** button to save changes.
4. The file name is updated in **Cloudflare R2**.

### Deleting Files

1. Click the **Delete** button next to a file in the **Uploaded Files** section.
2. The file is removed from the UI and deleted from **Cloudflare R2**.

### Copying File URLs

1. Click the **Copy Link** button next to a file.
2. The file's URL is copied to your clipboard.
3. A tooltip displays "Copied!" to confirm the action.

---

## Technologies Used

### Frontend

- **Next.js**: A React framework for building fast, server-rendered applications.
- **TypeScript**: Adds type safety and improves the developer experience.
- **Tailwind CSS**: Provides a modern, responsive design system.

### Backend Integration

- **Cloudflare R2**: Object storage for file uploads, renaming, and deletion.
- **REST API**: Handles communication between the frontend and R2.

### UI Components

- **Lucide Icons**: Clean and intuitive icons for a polished UI.
- **Custom Tooltip**: Provides dynamic feedback for user actions like copying URLs.

---

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- A Cloudflare R2 account with API credentials.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/file-uploader-r2.git
   cd file-uploader-r2
   ```
