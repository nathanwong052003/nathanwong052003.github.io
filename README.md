# Nathan Wong Shih Hao - Portfolio Website

A modern, responsive personal portfolio website showcasing my projects, skills, and experiences as a Computer Science student specializing in Data Science and Data Engineering.

## 🌟 Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Smooth Animations**: Elegant scroll animations and transitions
- **Interactive Navigation**: Fixed header with smooth scrolling to sections
- **Project Showcase**: Display of featured projects with descriptions and links
- **Experience Timeline**: Professional and organizational experience sections
- **Skills Visualization**: Visual representation of technical skills with progress bars
- **Photo Gallery**: Personal photography gallery with hover effects
- **Contact Form**: Integrated contact form using Formspree
- **Modern UI**: Clean, professional design with blue color scheme

## 🚀 Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `<your-username>.github.io` (e.g., `nathanwong052003.github.io`)
3. Make it public
4. Don't initialize with README (we already have one)

### Step 2: Upload Files

You have two options:

#### Option A: Using Git (Recommended)

```bash
# Navigate to your project folder
cd path/to/your/website

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/your-username/your-username.github.io.git

# Push to GitHub
git push -u origin main
```

#### Option B: Using GitHub Web Interface

1. Click "uploading an existing file" on your new repository page
2. Drag and drop all files from your project folder
3. Commit the changes

### Step 3: Enable GitHub Pages

1. Go to your repository settings
2. Scroll down to "Pages" section
3. Under "Source", select the `main` branch
4. Click "Save"
5. Your site will be published at: `https://your-username.github.io`

## 📁 File Structure

```
.
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── style.css      # Stylesheet
│   └── js/
│       └── main.js        # JavaScript for interactivity
├── documents/
│   └── Nathan_Wong_CV.pdf # CV file (you need to add this)
└── README.md              # This file
```

## 🔧 Customization

### Update Personal Information

1. **Contact Information**: Update email, location, and social links in `index.html`
2. **Projects**: Modify the projects section with your own projects
3. **Skills**: Adjust skill levels and add/remove skills as needed
4. **Experience**: Update job and organizational experiences
5. **Gallery**: Replace image URLs with your own photos

### Add Your CV

1. Create a `documents` folder in your project root
2. Add your CV as `Nathan_Wong_CV.pdf` (or update the link in `index.html`)

### Customize Colors

Edit the CSS variables in `assets/css/style.css`:

```css
:root {
    --primary-color: #2563eb;      /* Main blue color */
    --primary-dark: #1d4ed8;       /* Darker blue for hover */
    --secondary-color: #3b82f6;    /* Secondary blue */
    /* ... other colors */
}
```

### Update Images

Replace the Unsplash image URLs in `index.html` with your own images:
- Hero section background image
- Project images
- Gallery photos

## 📱 Contact Form Setup

The contact form is already configured to use Formspree. To receive emails:

1. Go to [Formspree](https://formspree.io/)
2. Create an account
3. Create a new form
4. Replace the form action URL in `index.html`:
   ```html
   <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

## 🌐 Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Vanilla JS for interactivity
- **Font Awesome**: Icons
- **Formspree**: Contact form handling

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio.

## 📧 Contact

- **Email**: nathanwongshihhao@gmail.com
- **LinkedIn**: [Nathan Wong Shih Hao](https://www.linkedin.com/in/nathan-wong-shih-hao)
- **GitHub**: [nathanwong052003](https://github.com/nathanwong052003)

---

Made by Nathan Wong Shih Hao
