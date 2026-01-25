# Organizational Chart App

A modern, responsive organizational chart application built with React that allows you to manage your company's employee hierarchy with ease.

## Features

### 🏢 **Organizational Chart View**
- Visual tree-like representation of your company structure
- Color-coded hierarchy levels for easy identification
- Interactive employee cards with contact information
- Smooth hover effects and animations

### 👥 **Employee Management**
- **Add Employees**: Create new employee profiles with all necessary information
- **Edit Employees**: Update employee details including position, department, and manager
- **Delete Employees**: Remove employees (with validation to prevent orphaned subordinates)
- **Manager Assignment**: Assign employees to managers with circular reference prevention

### 📋 **List View**
- Tabular display of all employees
- **Search Functionality**: Find employees by name, position, or email
- **Department Filtering**: Filter employees by department
- **Sortable Columns**: Sort by name, position, department, or manager
- **Responsive Design**: Works perfectly on all device sizes

### 🎨 **Modern UI/UX**
- Beautiful gradient design with modern color scheme
- Responsive layout that works on desktop, tablet, and mobile
- Smooth animations and transitions
- Intuitive user interface with clear visual hierarchy

### 💾 **Data Persistence**
- Local storage integration to save your organizational data
- Automatic data persistence between sessions
- Sample data included for immediate testing

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd orgchartapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Adding Employees
1. Click the "Add Employee" button in the header
2. Fill in the required information:
   - **Full Name**: Employee's complete name
   - **Position**: Job title or role
   - **Department**: Department or team
   - **Email**: Work email address
   - **Phone**: Contact number
   - **Manager**: Select from existing employees (optional)
3. Click "Add Employee" to save

### Editing Employees
1. Click the edit button (pencil icon) on any employee card
2. Modify the information as needed
3. Click "Update Employee" to save changes

### Deleting Employees
1. Click the delete button (trash icon) on any employee card
2. Confirm the deletion (employees with subordinates cannot be deleted)

### Switching Views
- Use the "Chart View" and "List View" buttons in the header to switch between organizational chart and table view

### Searching and Filtering (List View)
- Use the search box to find employees by name, position, or email
- Use the department filter to show only employees from specific departments
- Click column headers to sort the table
- Use "Clear Filters" to reset all search and filter options

## Data Structure

Each employee object contains:
```javascript
{
  id: number,           // Unique identifier
  name: string,         // Full name
  position: string,     // Job title
  department: string,   // Department/team
  email: string,        // Email address
  phone: string,        // Phone number
  managerId: number,    // ID of manager (null for top-level)
  image: string         // Profile image URL (optional)
}
```

## Technical Details

### Built With
- **React 19** - Frontend framework
- **Lucide React** - Modern icon library
- **CSS3** - Custom styling with modern design patterns
- **Local Storage** - Data persistence

### Project Structure
```
src/
├── components/
│   ├── OrgChart.js          # Organizational chart visualization
│   ├── OrgChart.css         # Chart styling
│   ├── EmployeeForm.js      # Add/edit employee form
│   ├── EmployeeForm.css     # Form styling
│   ├── EmployeeList.js      # Table view component
│   └── EmployeeList.css     # List styling
├── App.js                   # Main application component
├── App.css                  # Main application styling
└── index.js                 # Application entry point
```

### Key Features Implementation
- **Hierarchy Building**: Recursive algorithm to build the organizational tree
- **Validation**: Form validation with error handling
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: Proper focus management and keyboard navigation
- **Performance**: Optimized rendering and state management

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue in the repository.

---

**Happy Organizing! 🎉**
