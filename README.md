# 📊 Gantt-Bang

**Gantt-Bang** is a modern, interactive online Gantt Chart maker for project timeline management. Built with pure HTML, CSS, and vanilla JavaScript - no frameworks required!

![Gantt-Bang Demo](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### Core Functionality
- ✅ **Create, Edit & Delete Tasks** - Full CRUD operations
- ✅ **Interactive Timeline** - Visual project timeline representation
- ✅ **Drag to Move** - Drag task bars to change dates
- ✅ **Drag to Resize** - Resize tasks from left or right edges
- ✅ **Auto-Scaling Timeline** - Switch between Day, Week, and Month views
- ✅ **Custom Task Colors** - Color-code your tasks with visual color picker
- ✅ **Today Indicator** - Highlights current date on timeline

### Themes
- 🌞 **Light** - Clean, bright interface
- 🌙 **Dark** - Easy on the eyes for late-night planning
- ⚪ **Professional Minimal** - Sleek, distraction-free design
- 📚 **Research Mode** - Warm, paper-like aesthetic

### Export Options
- 🖼️ **Export to PNG** - High-resolution image export
- 📄 **Export to PDF** - Professional PDF documents

### Technical Features
- 💾 **Local Storage** - Your data persists in browser
- 🎨 **Smooth Animations** - Polished user experience
- 📱 **Responsive Design** - Works on desktop and tablets
- ⚡ **100% Client-Side** - No server required, works offline
- 🚀 **Fast & Lightweight** - Optimized performance

---

## 🎯 Quick Start

### Option 1: Use Online (GitHub Pages)

Simply visit the live demo:
```
https://yourusername.github.io/gantt-bang/
```

### Option 2: Download and Use Locally

#### Step 1: Download the Project

**Using Git:**
```bash
git clone https://github.com/yourusername/gantt-bang.git
cd gantt-bang
```

**Using Download:**
1. Click the green **"Code"** button on GitHub
2. Select **"Download ZIP"**
3. Extract the ZIP file to your desired location

#### Step 2: Open in Browser

Simply open `index.html` in any modern web browser:

**On Windows:**
- Double-click `index.html`
- Or right-click → Open with → Your browser

**On Mac:**
- Double-click `index.html`
- Or right-click → Open With → Your browser

**On Linux:**
```bash
xdg-open index.html
```

That's it! No installation, no dependencies, no build process required.

---

## 📁 Project Structure

```
gantt-bang/
│
├── index.html          # Main HTML file
├── styles.css          # All styling and themes
├── script.js           # Application logic
└── README.md           # This file
```

### File Breakdown

| File | Description |
|------|-------------|
| `index.html` | Main application structure and HTML markup |
| `styles.css` | Complete styling including all 4 themes and responsive design |
| `script.js` | Core application logic: task management, drag handlers, exports |

---

## 🎨 Usage Guide

### Adding Tasks

1. **Enter Task Name** - Give your task a descriptive name
2. **Set Start Date** - Choose when the task begins
3. **Set End Date** - Choose when the task ends
4. **Pick a Color** - Select a color for easy identification
5. **Click "Add Task"** - Task appears in both sidebar and timeline

### Editing Tasks

**Method 1 - Edit Button:**
- Click the ✏️ edit icon next to any task
- Modify details in the form
- Click "Update Task"

**Method 2 - Drag on Timeline:**
- **Drag the task bar** to move the entire task
- **Drag left edge** to change start date
- **Drag right edge** to change end date

### Deleting Tasks

- Click the 🗑️ delete icon next to any task
- Confirm deletion in the popup

### Changing View

Use the **View** dropdown to switch between:
- **Day View** - See daily progress
- **Week View** - Weekly overview (default)
- **Month View** - High-level monthly planning

### Switching Themes

Use the **Theme** dropdown to select:
- Light
- Dark
- Professional Minimal
- Research Mode

### Exporting Your Chart

**Export as PNG:**
- Click the **"Export PNG"** button
- High-resolution image downloads automatically

**Export as PDF:**
- Click the **"Export PDF"** button
- PDF document downloads automatically

---

## 🛠️ Technical Details

### Dependencies

Gantt-Bang uses two external libraries for export functionality:

- **html2canvas** (v1.4.1) - For rendering HTML to canvas
- **jsPDF** (v2.5.1) - For PDF generation

Both are loaded from CDN, so an internet connection is required for exports only.

### Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Storage

- Uses `localStorage` to persist data
- Storage keys: `ganttBangTasks`, `ganttBangTheme`, `ganttBangViewScale`
- Data is stored locally in your browser
- Clear browser data to reset the application

---

## 🎯 Use Cases

Perfect for:
- 📊 **Project Management** - Plan and track project timelines
- 📚 **Research Planning** - Organize research phases
- 🎓 **Academic Projects** - Track semester assignments
- 💼 **Business Planning** - Visualize business milestones
- 🏗️ **Construction Planning** - Coordinate construction phases
- 📝 **Content Calendars** - Plan content publication schedules
- 🎯 **Goal Tracking** - Visualize personal goals and deadlines

---

## 🚀 Deployment

### Deploy to GitHub Pages

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/gantt-bang.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository **Settings**
   - Navigate to **Pages** section
   - Under **Source**, select **main** branch
   - Click **Save**
   - Your site will be live at `https://yourusername.github.io/gantt-bang/`

### Deploy to Other Platforms

Since Gantt-Bang is a static site, it can be deployed anywhere:

- **Netlify**: Drag and drop the folder
- **Vercel**: Import the GitHub repository
- **GitHub Pages**: Follow instructions above
- **Any Web Server**: Upload files to public directory

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Ideas for Contributions
- Add more themes
- Implement task dependencies
- Add task progress indicators
- Create import/export JSON functionality
- Add print stylesheet
- Implement task search/filter
- Add keyboard shortcuts
- Mobile optimization improvements

---

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- ✅ Core Gantt chart functionality
- ✅ Drag and drop support
- ✅ 4 professional themes
- ✅ PNG/PDF export
- ✅ Responsive design
- ✅ Local storage persistence

---

## 🐛 Known Issues

None at the moment! Found a bug? [Open an issue](https://github.com/yourusername/gantt-bang/issues)

---

## ❓ FAQ

**Q: Does this work offline?**
A: Yes! Once loaded, it works completely offline. Only the export features require internet for the CDN libraries.

**Q: Where is my data stored?**
A: All data is stored locally in your browser using localStorage. Your data never leaves your computer.

**Q: Can I use this commercially?**
A: Yes! Use it however you like.

**Q: How do I clear all my data?**
A: Clear your browser's localStorage or use your browser's developer tools to delete the `ganttBang*` keys.

**Q: Can I customize the colors?**
A: Yes! Each task can have its own custom color selected via the color picker.

**Q: Is there a limit to the number of tasks?**
A: No hard limit, but performance may vary with hundreds of tasks depending on your device.

---

## 🙏 Acknowledgments

- Built with pure vanilla JavaScript - no frameworks!
- Icons: Emoji
- Export functionality: html2canvas & jsPDF

---

## 📧 Contact

Have questions or suggestions? Feel free to:
- Open an issue on GitHub
- Submit a pull request
- Contact: your.email@example.com

---

## 🌟 Star This Repository

If you find Gantt-Bang useful, please consider giving it a star ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for project managers everywhere**

[View Demo](https://yourusername.github.io/gantt-bang/) • [Report Bug](https://github.com/yourusername/gantt-bang/issues) • [Request Feature](https://github.com/yourusername/gantt-bang/issues)

</div>
