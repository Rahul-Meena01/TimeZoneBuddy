# TimeZoneBuddy 🌍

A zero-backend, single-page web app that helps you track multiple timezones, find meeting overlaps, and share schedules with shareable links. Built with **pure HTML, CSS, and JavaScript** for optimal performance and simplicity.

## ✨ Features

- **Pin Favorite Cities**: Add cities from around the world to track their timezones
- **Live Time Display**: See real-time updates with day/night emoji indicators
- **Meeting Overlap Finder**: Green highlights show 9 AM - 6 PM working hours overlap
- **Hour Offset Slider**: Shift all times to find perfect meeting windows
- **Draggable Cards**: Reorder timezone cards by dragging
- **Shareable Links**: URLs automatically update with your configuration
- **Theme Toggle**: Light/dark mode with auto-detection based on time
- **Keyboard Shortcuts**: Quick actions with A, T, S, and Esc keys
- **Privacy First**: No data collection, no servers, all client-side
- **Responsive Design**: Works perfectly on desktop and mobile
- **Futuristic UI**: Glass morphism effects, smooth animations, gradient colors

## 🚀 Getting Started

**No build process required!** Simply:

1. **Download** or clone this repository
2. **Open** `index.html` in any modern web browser
3. **Start adding cities** and enjoy the futuristic timezone experience!

## ⌨️ Keyboard Shortcuts

| Key   | Action                       |
| ----- | ---------------------------- |
| `A`   | Focus search to add timezone |
| `T`   | Toggle light/dark theme      |
| `S`   | Copy shareable link          |
| `Esc` | Close about modal            |

## 🎯 How It Works

1. **Add Timezones**: Use the search bar to find and add cities
2. **Set Hour Offset**: Use the slider to shift all times for scheduling
3. **Find Overlaps**: Green cards show working hours (9 AM - 6 PM)
4. **Share Links**: Copy the URL to share your timezone configuration
5. **Drag to Reorder**: Organize cards by dragging them around

## 🏗️ Tech Stack

- **Pure HTML5** - Semantic markup
- **Pure CSS3** - Custom styling with CSS variables, animations, glass morphism
- **Vanilla JavaScript** - Modern ES6+ with class-based architecture
- **localStorage** - Data persistence
- **URL Hash** - Shareable links
- **Intl API** - Native timezone formatting

## 📁 File Structure

```
project6/
├── index.html      # Main HTML file
├── styles.css      # Futuristic CSS with animations
├── script.js       # Main JavaScript application
├── data.js         # Timezone data
├── README.md       # This file
└── .github/
    └── copilot-instructions.md
```

## 🎨 Design Highlights

### Futuristic Aesthetic

- **Glass Morphism**: Backdrop blur effects throughout
- **Animated Orbs**: Floating background elements
- **Gradient Colors**: Cyan primary (#00d4ff), purple accent (#7c3aed)
- **Smooth Animations**: CSS keyframes with easing functions
- **Hover Effects**: Transform, scale, and glow animations
- **Theme Transitions**: Smooth light/dark mode switching

### Performance

- **Zero Dependencies**: No external libraries or frameworks
- **Lightweight**: ~52KB total size
- **Fast Loading**: No build process or bundling
- **Efficient Animations**: GPU-accelerated CSS transforms
- **Responsive**: Mobile-first design approach

## 📱 Browser Support

- **Chrome/Edge** 88+
- **Firefox** 78+
- **Safari** 14+
- All modern browsers with Intl.DateTimeFormat support

## 🚀 Deployment

### Simple Static Hosting

1. Upload all files to any web server
2. Access via `index.html`
3. No server configuration needed!

### Popular Platforms

- **GitHub Pages**: Push to repo, enable Pages
- **Netlify**: Drag & drop the folder
- **Vercel**: Import from GitHub
- **Firebase Hosting**: `firebase deploy`

## 🎨 Customization

The app uses CSS variables for easy theming. Customize colors in `styles.css`:

```css
:root {
  --primary: #00d4ff; /* Main accent color */
  --secondary: #ff6b35; /* Secondary accent */
  --accent: #7c3aed; /* Purple accent */
  --success: #00ff88; /* Success/working hours */
  --bg-primary: #ffffff; /* Main background */
  /* ... more variables */
}
```

## 🤝 Contributing

1. Fork the repository
2. Make your changes
3. Test in multiple browsers
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ for remote teams and global friends trying to coordinate across timezones!**

_Simple. Fast. Beautiful. No frameworks needed._
