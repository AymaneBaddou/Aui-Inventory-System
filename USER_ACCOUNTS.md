# AUI Inventory System - Authentication

## Current Features

✅ **Simplified Dashboard:** Shows only current stock/inventory items
✅ **File Upload for Images:** Upload item pictures directly instead of URLs
✅ **Authentication System:** Login/logout with protected routes
✅ **Database Synchronization:** Fixed CORS and schema for proper data sync
✅ **Base64 Image Storage:** Large image support in database

## Backend Updates

### CORS Configuration
- **Expanded Port Range:** Now supports ports 5173-5185 for frontend connections
- **Localhost Support:** Both localhost and 127.0.0.1 addresses supported

### Database Schema
- **Picture Field:** Increased from 500 to 1,000,000 characters for base64 images
- **Image Support:** Full support for uploaded image files converted to base64

## Dashboard

The dashboard now displays only the current stock, showing all inventory items with their quantities and pictures.

## Adding Items

When adding new items, users can now upload image files directly:
- **File Upload:** Click to select image files from device
- **Supported Formats:** All common image formats (JPG, PNG, GIF, etc.)
- **Base64 Conversion:** Images automatically converted for database storage
- **Large File Support:** Database schema supports large image data

## How to Use

1. **Login:** Enter any email and password combination
2. **View Stock:** Dashboard shows current inventory with images
3. **Add Items:** Use "Add Item" page to upload pictures and set initial quantities
4. **Manage Operations:** Log in/out operations for inventory tracking
5. **Logout:** Use sidebar logout button

## Technical Details

- **Frontend:** React + Vite on port 5184
- **Backend:** FastAPI + SQLAlchemy on port 8000
- **Database:** SQLite with updated schema
- **Image Storage:** Base64 encoded in database
- **CORS:** Configured for multiple development ports
