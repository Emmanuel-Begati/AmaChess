# Simplified PDF Book Reader

## What Changed

The BookReader component has been simplified to focus on the core functionality you requested:

1. **Upload PDFs**: Simple file upload with title and author
2. **View PDFs**: Clean PDF viewer with zoom controls
3. **No Complex Dependencies**: Removed react-pdf library that was causing CORS issues

## How to Use

### Upload a PDF
1. Go to `/book` or `/library/book` (without an ID)
2. Fill in the book title and author
3. Select a PDF file (max 50MB)
4. Click "Upload & View PDF"

### View a PDF
- Once uploaded, the PDF will be displayed in a clean viewer
- Use zoom controls to adjust the view
- Open in new tab or download the PDF

## New Components

### SimplePDFViewer
- Uses native browser PDF viewing (iframe)
- Built-in zoom controls
- No external dependencies
- No CORS issues

### Updated BookReader
- Handles both upload and viewing
- Clean, modern UI
- Error handling for file size and format
- Proper loading states

## Routes Available

- `/book` - Go directly to upload page
- `/library/book/:bookId` - View a specific book
- `/library` - View all books in library

## Technical Changes

1. **Removed react-pdf dependency** - was causing CORS worker issues
2. **Created SimplePDFViewer** - uses browser's native PDF rendering
3. **Simplified upload flow** - focused on core functionality
4. **Better error handling** - clearer messages for users

## File Structure

```
src/
├── pages/
│   └── BookReader.tsx (simplified, handles upload + viewing)
├── components/
│   └── SimplePDFViewer.tsx (new, simple PDF viewer)
└── services/
    ├── booksApi.ts (existing API service)
    └── pdfViewer.ts (updated, simplified)
```

## Backend Requirements

The backend should continue to work as-is:
- POST `/api/books/upload` - upload PDF files
- GET `/api/books/:bookId/pdf` - serve PDF files
- GET `/api/books/:bookId/pdf-status` - check if PDF exists

## Test the Functionality

1. Start both frontend and backend servers
2. Go to `http://localhost:5173/book`
3. Upload a PDF file
4. View it in the browser

The solution is much simpler and more reliable than the previous react-pdf implementation.
