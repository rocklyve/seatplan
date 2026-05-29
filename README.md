# 💒 Wedding Seat Planner

A visual, interactive wedding seat planner with drag-and-drop guest assignment, server-side persistence, and password protection.

## Features

- **Drag & Drop**: Assign guests to tables by dragging — works on mouse and touch screens
- **Touch Support**: Fully mobile-ready; drag-and-drop works on phones and tablets
- **Guest Management**: Add guests one by one or in bulk, remove, and track assignments
- **Table Configuration**: Customize number of tables and seats per table
- **Auto-Save**: Changes are saved automatically to the server after you enter the save passcode once per session
- **Password Protection**: The entire site is protected by a site password; saving requires an additional passcode
- **Export / Import**: Download a JSON backup or import one at any time
- **Undo / Redo**: Step back and forward through drag-and-drop history

## Prerequisites

- **Node.js** 18 or higher
- **npm** (included with Node.js)

```bash
node --version
npm --version
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the secrets file

Copy the template and fill in your own values:

```bash
cp secrets.template.json secrets.json
```

Edit `secrets.json`:

```json
{
  "adminPassword": "your-admin-password",
  "viewerPassword": "your-viewer-password",
  "sessionSecret": "a-long-random-string"
}
```

- **adminPassword** — full access: view, drag, edit, configure
- **viewerPassword** — read-only access: can see the plan and export, but cannot make changes
- **sessionSecret** — used to sign the session cookie; use a long random string

`secrets.json` is git-ignored and never committed.

## Running in Development

`npm run dev` is for **local development on your own machine only**. It starts Vite (port 5173) and the Express API server (port 3001) separately. Vite is not network-accessible by default.

```bash
npm run dev
```

## Deploying to a Server

On any server (Proxmox LXC, VPS, etc.), always use **production mode**. This builds the frontend once and lets Express serve everything on a single port:

```bash
npm run build
NODE_ENV=production node server.js
```

The app is then available at `http://<server-ip>:3001`.

To use port 80 instead (no port number in the URL):

```bash
PORT=80 NODE_ENV=production node server.js
```

### Auto-start with systemd

To have the app start automatically on boot and restart on crash, create a systemd service:

```bash
nano /etc/systemd/system/seatplan.service
```

```ini
[Unit]
Description=Wedding Seat Planner
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/seatplan
ExecStart=/usr/bin/node server.js
Environment=NODE_ENV=production
Environment=PORT=3001
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then enable and start it:

```bash
systemctl daemon-reload
systemctl enable seatplan
systemctl start seatplan
systemctl status seatplan
```

Useful commands:

```bash
systemctl stop seatplan      # stop
systemctl restart seatplan   # restart after code changes
journalctl -u seatplan -f    # live logs
```

### Deploying updates

After pulling new code on the server, run:

```bash
./restart.sh
```

This installs dependencies, rebuilds the frontend, and restarts the service.

## How to Use

### Initial Setup

1. Open the app — you will be prompted for the **site password**
2. Click **⚙️ Configure** to set the number of tables and seats per table

### Adding Guests

- Type a name in the input field and press **Add** or Enter
- Click **+ Bulk Add** to paste multiple names at once (one per line)

### Assigning Guests to Tables

1. Drag a guest from the **Unassigned Guests** sidebar onto any table
2. Drag between tables to reassign
3. Drag back to the unassigned area to unassign

Changes are saved automatically to the server.

### Removing Guests

Click the **×** button next to a guest in the unassigned list.

### Undo / Redo

Use **↶ Undo** and **↷ Redo** in the header to step through drag-and-drop history.

### Export / Import

- **💾 Export** — downloads a JSON file of the current plan
- **📂 Import** — loads a previously exported JSON file

### Logout

Click **🔓 Logout** to end your session.

## Data Persistence

- The seating plan is stored in `seatplan.json` at the project root
- It is saved automatically on every change (after the save passcode is entered)
- `seatplan.json` is git-ignored and never committed
- To seed the initial data from an existing export: `cp your-export.json seatplan.json`

## Technology Stack

- **React 18** — UI
- **Vite** — dev server and build tool
- **@dnd-kit** — accessible, touch-ready drag-and-drop
- **Express** — API server and production static file server
- **express-session** — session-based authentication

## Project Files (git-ignored)

| File | Purpose |
|---|---|
| `secrets.json` | Site password, save passcode, session secret |
| `seatplan.json` | Live seating plan data |

Use `secrets.template.json` as the reference for the required structure.

## Troubleshooting

**Server won't start — "secrets.json not found"**
Copy the template: `cp secrets.template.json secrets.json` and fill in the values.

**Port already in use**
Set a different port: `PORT=4000 node server.js`

**npm install hangs or fails**
```bash
rm -rf node_modules package-lock.json
npm install
```

**App not loading in dev**
Make sure both servers are running (`npm run dev` starts both). Check the terminal for errors.

---

*Happy Planning! 🎉*
