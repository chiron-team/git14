# Testing2 Prod

A production-ready HTML, CSS, JavaScript project with modern tooling and best practices.

## Features

- Clean, semantic HTML5 structure
- Modern CSS with CSS Grid and Flexbox
- Vanilla JavaScript with ES6+ features
- ESLint for code linting
- Prettier for code formatting
- Live development server
- Production build process with minification
- Responsive design

## Project Structure

```
├── src/
│   ├── css/
│   │   ├── style.css          # Main stylesheet
│   │   └── components/        # Component-specific styles
│   ├── js/
│   │   ├── main.js            # Main JavaScript entry point
│   │   ├── modules/           # JavaScript modules
│   │   └── utils/             # Utility functions
│   └── assets/
│       └── images/            # Image assets
├── dist/                      # Production build output
├── index.html                 # Main HTML file
├── package.json              # Project dependencies and scripts
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd testing2-prod
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

This will start a live server on `http://localhost:3000` with hot reloading.

### Building for Production

Create a production build:
```bash
npm run build
```

This will:
- Lint your code
- Minify CSS and JavaScript
- Output optimized files to the `dist/` directory

### Available Scripts

- `npm start` - Serve the project using a simple HTTP server
- `npm run dev` - Start development server with live reloading
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run build` - Create production build
- `npm run minify` - Minify CSS and JavaScript files

## Code Style

This project uses ESLint and Prettier for consistent code formatting. The configuration follows modern JavaScript best practices.

## Browser Support

This project supports all modern browsers:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.