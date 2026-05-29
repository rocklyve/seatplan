# 💒 Wedding Seat Planner

A beautiful, interactive wedding seat planner application with drag-and-drop functionality to easily organize your guests and table assignments.

## Features

- ✨ **Drag & Drop Interface**: Intuitive drag-and-drop to assign guests to tables
- 🎯 **Visual Feedback**: Real-time capacity indicators and visual cues
- 📊 **Guest Management**: Add, remove, and track all your wedding guests
- 🍽️ **Table Configuration**: Customize the number of tables and seats per table
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 💾 **Browser Storage**: Your data persists in the browser (note: not saved to disk)

## Prerequisites

Before running the application, make sure you have the following installed:

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)

To check if you have Node.js installed, run:
```bash
node --version
npm --version
```

If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/)

## Installation

1. Navigate to the project directory:
```bash
cd wedding-seat-planner
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

The application will automatically reload if you make changes to the code.

## How to Use

### Initial Setup

1. **Configure Tables**: Click the "⚙️ Configure" button in the header
2. Set the number of tables at your venue
3. Set how many seats each table has
4. Click "Save Configuration"

### Adding Guests

1. In the left sidebar, enter a guest's name in the input field
2. Click "Add" or press Enter
3. The guest will appear in the "Unassigned Guests" list

### Assigning Guests to Tables

1. Click and drag a guest from the unassigned list
2. Drop them onto any table on the right
3. The table will show a visual indicator when you hover over it
4. Release to assign the guest to that table

### Moving Guests Between Tables

1. You can drag guests from one table to another
2. To unassign a guest, drag them back to the "Unassigned Guests" area

### Removing Guests

1. Click the "×" button next to any guest in the unassigned list
2. To remove an assigned guest, first drag them back to unassigned, then remove

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## Technology Stack

- **React 18**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **@dnd-kit**: Accessible drag-and-drop library
- **CSS3**: Modern styling with gradients and animations

## Data Persistence

Currently, the application stores data in the browser's memory. When you refresh the page, your data will be lost. To persist data:

1. **Option 1**: Keep the browser tab open while planning
2. **Option 2**: Take screenshots of your final arrangement
3. **Future Enhancement**: Add localStorage or file export functionality

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (version 90+)
- Firefox (version 88+)
- Safari (version 14+)

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.)

### Installation errors
If you encounter errors during `npm install`, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Application not loading
1. Make sure the dev server is running (`npm run dev`)
2. Check the terminal for any error messages
3. Try clearing your browser cache
4. Try a different browser

## License

This project is free to use for personal wedding planning purposes.

## Support

For issues or questions, please create an issue in the project repository.

---

**Happy Planning! 🎉**
