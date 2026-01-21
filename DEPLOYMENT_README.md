# Organizational Chart App Deployment Guide

This application can be deployed both as a standalone web application and as a monday.com app.

## Features

- **Organizational Chart Visualization**: Interactive tree view of employee hierarchy
- **Employee Management**: Add, edit, delete employees
- **Data Import/Export**: CSV import and PDF/CSV export functionality
- **Monday.com Integration**: Automatic data loading from monday.com boards
- **Customizable Design**: Theme support and design customization
- **Responsive Design**: Works on desktop and mobile devices

## Running Standalone (Browser)

### Local Development
```bash
npm install
npm start
```
The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```
The app will be served from the `build` folder.

## Deploying to monday.com

### Step 1: Create a monday.com App

1. Go to [monday.com developers](https://developer.monday.com/)
2. Click "Create App"
3. Choose "App Features" → "Dashboard"
4. Upload the `monday-app-manifest.json` file when prompted
5. Set the app URL to your deployment URL (see hosting options below)

### Step 2: Configure App Permissions

In your monday.com app settings, ensure these scopes are enabled:
- `boards:read`
- `items:read`
- `users:read`
- `workspaces:read`

### Step 3: Host the Application

#### Option A: Netlify (Recommended)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the entire `build` folder to deploy
3. Copy the deployment URL
4. Update your monday.com app settings with this URL

#### Option B: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your project or drag the `build` folder
3. Deploy and copy the URL
4. Update your monday.com app settings

#### Option C: GitHub Pages
1. Create a GitHub repository
2. Upload the `build` folder contents
3. Enable GitHub Pages in repository settings
4. Use the GitHub Pages URL in monday.com

#### Option D: Any Static Host
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any web server that can serve static files

### Step 4: Add to monday.com Workspace

1. Go to your monday.com workspace
2. Click "Add" → "Apps" → "Manage Apps"
3. Find your app and install it
4. Add the dashboard widget to your board

## Monday.com Data Structure

The app expects your monday.com board to have these columns:
- **Person** (People column): Employee name and details
- **Position** (Text column): Job title/role
- **Department** (Text column): Department name
- **Manager** (Text column): Manager's name (optional)
- **Phone** (Text column): Phone number (optional)
- **Email** (Text column): Email address (optional)

### Sample Board Setup
1. Create a new board called "Employee Data"
2. Add groups for departments (Executive, Technology, HR, etc.)
3. Add items for each employee
4. Fill in the person, position, and department columns
5. Set manager relationships using the Manager column

## Development Mode

The app includes development tools for testing monday.com integration:

### Keyboard Shortcuts (when running locally)
- `Ctrl + M`: Trigger mock monday.com context
- `Ctrl + L`: Set light theme
- `Ctrl + D`: Set dark theme
- `Ctrl + N`: Set night theme

### Development API
Access development tools via `window.mondayDev`:
```javascript
// Trigger mock context
window.mondayDev.triggerContext()

// Mock API calls
window.mondayDev.api('query here')

// Get mock context data
window.mondayDev.getMockContext()
```

## Configuration

### Custom Fields
The app supports custom fields stored in localStorage:
```javascript
localStorage.setItem('customFields', JSON.stringify([
  { id: 'start_date', name: 'Start Date', type: 'date' },
  { id: 'salary', name: 'Salary', type: 'number' }
]));
```

### Design Settings
Customize appearance:
```javascript
localStorage.setItem('designSettings', JSON.stringify({
  cardStyle: 'rounded', // 'rounded' | 'square'
  avatarSize: 'medium', // 'small' | 'medium' | 'large'
  showContactInfo: true,
  showDepartment: true,
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  edgeType: 'straight', // 'straight' | 'curved'
  edgeColor: '#3b82f6',
  edgeWidth: 3
}));
```

## Troubleshooting

### Monday.com Integration Issues
1. **"Insufficient permissions"**: Check app scopes in monday.com developer console
2. **"column_values is empty"**: Ensure your board has the expected column structure
3. **Theme not syncing**: Verify monday.com context is being received

### Build Issues
1. **Dependencies not found**: Run `npm install`
2. **Build fails**: Check for ESLint errors and fix them
3. **SDK not loading**: Ensure monday.com SDK script is included in index.html

### Performance Issues
- Large org charts (>100 employees) may need optimization
- Use pagination for very large datasets
- Consider lazy loading for deep hierarchies

## Support

For support and questions:
- Email: team@syncoora.com
- Check the code comments for detailed explanations
- Review the monday.com developer documentation

## License

This application is developed by Syncoora.