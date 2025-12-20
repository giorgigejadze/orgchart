import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import OrgChart from './components/OrgChart';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import ImportExport from './components/ImportExport';
import Settings from './components/Settings';
import { Plus, Users, Settings as SettingsIcon, Sun, Moon, Download, Palette, List, X, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

function App() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [showImportExportMenu, setShowImportExportMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState('field-management');
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [viewedEmployee, setViewedEmployee] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showAppNavigator, setShowAppNavigator] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showSubordinatesError, setShowSubordinatesError] = useState(false);
  const [employeeWithSubordinates, setEmployeeWithSubordinates] = useState(null);
  const [designSettings, setDesignSettings] = useState({
    cardStyle: 'rounded',
    avatarSize: 'medium',
    showContactInfo: true,
    showDepartment: true,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    edgeType: 'straight',
    edgeColor: '#3b82f6',
    edgeWidth: 3
  });
  const dropdownRef = useRef(null);
  const viewDropdownRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const orgChartRef = useRef(null);

  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedDesignSettings = localStorage.getItem('designSettings');
    
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }

    if (savedDesignSettings) {
      const parsedSettings = JSON.parse(savedDesignSettings);
      // Merge with default settings to ensure new properties are included
      const defaultSettings = {
        cardStyle: 'rounded',
        avatarSize: 'medium',
        showContactInfo: true,
        showDepartment: true,
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        edgeType: 'straight',
        edgeColor: '#3b82f6',
        edgeWidth: 3
      };
      setDesignSettings({ ...defaultSettings, ...parsedSettings });
    } else {
      // Initialize with 20 sample employees
      const generateSampleEmployees = () => {
        const names = [
          'John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Wilson',
          'Emma Wilson', 'James Brown', 'Sophia Davis', 'Michael Johnson', 'Olivia Garcia',
          'Daniel Miller', 'Ava Rodriguez', 'Christopher Martinez', 'Isabella Anderson', 'Matthew Taylor',
          'Mia Thomas', 'Andrew Jackson', 'Charlotte White', 'Joshua Harris', 'Amelia Martin',
          'Ryan Thompson', 'Harper Garcia', 'Nicholas Moore', 'Evelyn Lee', 'Christopher Clark',
          'Grace Lewis', 'Kevin Hall', 'Chloe Allen', 'Steven Young', 'Zoe King',
          'Brian Wright', 'Lily Green', 'Timothy Baker', 'Hannah Adams', 'Jeffrey Nelson',
          'Victoria Carter', 'Mark Mitchell', 'Penelope Perez', 'Donald Roberts', 'Layla Turner',
          'Paul Phillips', 'Riley Campbell', 'George Parker', 'Nora Evans', 'Edward Edwards',
          'Scarlett Collins', 'Robert Stewart', 'Aria Morris', 'Thomas Rogers', 'Luna Reed'
        ];

        const positions = [
          'CEO', 'CTO', 'CFO', 'COO', 'VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR',
          'Senior Software Engineer', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
          'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Data Analyst',
          'UX Designer', 'UI Designer', 'Graphic Designer', 'Marketing Manager', 'Marketing Specialist',
          'Sales Manager', 'Sales Representative', 'Account Executive', 'Customer Success Manager',
          'HR Manager', 'HR Coordinator', 'Recruiter', 'Finance Manager', 'Financial Analyst',
          'Accountant', 'Operations Manager', 'Operations Specialist', 'DevOps Engineer',
          'QA Engineer', 'Technical Lead', 'Architect', 'Database Administrator', 'System Administrator',
          'Content Strategist', 'SEO Specialist', 'Social Media Manager', 'Brand Manager',
          'Legal Counsel', 'Compliance Officer', 'Security Engineer', 'Network Engineer', 'Support Engineer'
        ];

        const departments = [
          'Executive', 'Technology', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
          'Human Resources', 'Finance', 'Operations', 'Customer Success', 'Business Development', 
          'Research & Development', 'Legal', 'Security', 'Support'
        ];

        const employees = [];
        
        // Create CEO (no manager)
        employees.push({
          id: 1,
          name: names[0],
          position: 'CEO',
          department: 'Executive',
          email: `${names[0].toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + 1).padStart(3, '0')}-${String(1000 + 1).padStart(4, '0')}`,
          managerId: null,
          image: null
        });

        // Create C-level executives (report to CEO)
        const cLevelPositions = ['CTO', 'CFO', 'COO'];
        for (let i = 0; i < cLevelPositions.length; i++) {
          employees.push({
            id: i + 2,
            name: names[i + 1],
            position: cLevelPositions[i],
            department: cLevelPositions[i] === 'CTO' ? 'Technology' : cLevelPositions[i] === 'CFO' ? 'Finance' : 'Operations',
            email: `${names[i + 1].toLowerCase().replace(' ', '.')}@company.com`,
            phone: `+1-555-${String(100 + i + 2).padStart(3, '0')}-${String(1000 + i + 2).padStart(4, '0')}`,
            managerId: 1,
            image: null
          });
        }

        // Create VPs (report to C-level)
        const vpPositions = ['VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR'];
        const vpDepartments = ['Technology', 'Marketing', 'Sales', 'Human Resources'];
        for (let i = 0; i < vpPositions.length; i++) {
          const managerId = i < 2 ? 2 : i < 3 ? 3 : 4; // CTO, CTO, CFO, COO
          employees.push({
            id: i + 5,
            name: names[i + 4],
            position: vpPositions[i],
            department: vpDepartments[i],
            email: `${names[i + 4].toLowerCase().replace(' ', '.')}@company.com`,
            phone: `+1-555-${String(100 + i + 5).padStart(3, '0')}-${String(1000 + i + 5).padStart(4, '0')}`,
            managerId: managerId,
            image: null
          });
        }

        // Create remaining employees (report to VPs and other managers)
        let currentId = 9;
        for (let i = 9; i < 21; i++) {
          const name = names[i];
          const position = positions[Math.floor(Math.random() * positions.length)];
          const department = departments[Math.floor(Math.random() * departments.length)];
          
          // Assign manager based on department and hierarchy
          let managerId;
          if (department === 'Technology' || department === 'Engineering') {
            managerId = Math.random() > 0.5 ? 2 : 5; // CTO or VP Engineering
          } else if (department === 'Marketing') {
            managerId = 6; // VP Marketing
          } else if (department === 'Sales') {
            managerId = 7; // VP Sales
          } else if (department === 'Human Resources') {
            managerId = 8; // VP HR
          } else if (department === 'Finance') {
            managerId = 3; // CFO
          } else if (department === 'Operations') {
            managerId = 4; // COO
          } else {
            // For other departments, randomly assign to existing managers
            const existingManagers = employees.filter(emp => 
              emp.position.includes('VP') || emp.position.includes('Manager') || emp.position.includes('Lead')
            );
            if (existingManagers.length > 0) {
              managerId = existingManagers[Math.floor(Math.random() * existingManagers.length)].id;
            } else {
              managerId = 1; // Default to CEO
            }
          }

          employees.push({
            id: currentId,
            name: name,
            position: position,
            department: department,
            email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
            phone: `+1-555-${String(100 + currentId).padStart(3, '0')}-${String(1000 + currentId).padStart(4, '0')}`,
            managerId: managerId,
            image: null
          });
          currentId++;
        }

        return employees;
      };

      const sampleEmployees = generateSampleEmployees();
      setEmployees(sampleEmployees);
      localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    }
  }, []);

  // Save employees to localStorage whenever employees change
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // Save theme to localStorage and update DOM whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowImportExportMenu(false);
      }
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target)) {
        setShowViewMenu(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };

    if (showImportExportMenu || showViewMenu || showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImportExportMenu, showViewMenu, showSettingsMenu]);

  // Double click outside to close popups
  useEffect(() => {
    const handleDoubleClickOutside = (event) => {
      // Check if click is outside the form overlay, settings modal, and view popup
      const isOutsideForm = !event.target.closest('.form-overlay');
      const isOutsideSettings = !event.target.closest('.settings-modal-overlay');
      const isOutsideViewPopup = !event.target.closest('.view-popup-overlay');
      
      if (isOutsideForm && isOutsideSettings && isOutsideViewPopup) {
        if (showForm) {
          setShowForm(false);
          setSelectedEmployee(null);
        }
        if (showSettingsModal) {
          setShowSettingsModal(false);
        }
        if (showViewPopup) {
          closeViewPopup();
        }
      }
    };

    if (showForm || showSettingsModal || showViewPopup) {
      document.addEventListener('dblclick', handleDoubleClickOutside);
    }

    return () => {
      document.removeEventListener('dblclick', handleDoubleClickOutside);
    };
  }, [showForm, showSettingsModal, showViewPopup]);

  // Monday.com SDK context listener with ngrok support
  useEffect(() => {
    // Delay SDK initialization to avoid timing issues
    const initializeSDK = () => {
      // First, let's check if monday SDK is available
      if (typeof monday !== 'undefined' && monday.get) {
        try {
          // Check if we're in monday.com environment
          monday.get('context').then((context) => {

            // Apply initial theme from monday.com context
            if (context && context.data && context.data.theme) {
              const mondayTheme = context.data.theme;
              // Convert monday.com themes to app themes
              // light = light mode, dark/night = dark mode
              if (mondayTheme === "light") {
                setTheme("light");
              } else {
                // Both "dark" and "night" should result in dark mode
                setTheme("dark");
              }
            }

            return context;
          }).catch((error) => {
            return null;
          }).then((context) => {
            // Set up context listener
            if (monday.listen) {
              monday.listen("context", (res) => {
                // Apply theme from monday.com context
                if (res && res.data && res.data.theme) {
                  const mondayTheme = res.data.theme;
                  // Convert monday.com themes to app themes
                  // light = light mode, dark/night = dark mode
                  if (mondayTheme === "light") {
                    setTheme("light");
                  } else {
                    // Both "dark" and "night" should result in dark mode
                    setTheme("dark");
                  }
                }
              });
            }

            // If we have context, use it
            if (context) {
              // Load employees from Monday.com board
              if (context.data && context.data.boardId) {
                loadEmployeesFromBoard(context.data.boardId);
              }
            } else {
              // Enable development mode with mock context
              enableDevelopmentMode();
            }
          });
        } catch (error) {
          enableDevelopmentMode();
        }
      } else {
        // Enable development mode even without SDK
        enableDevelopmentMode();
      }
    };

    // Initialize after a longer delay to ensure SDK is fully loaded
    setTimeout(initializeSDK, 500);
  }, []);

  // Development mode helper for ngrok testing
  const enableDevelopmentMode = () => {
    // Add development controls to window for easy testing
    window.mondayDev = {
      // Trigger mock context event
      triggerContext: (mockData = null) => {
        const defaultContext = {
          data: {
            boardId: 12345,
            itemId: 67890,
            theme: "light", // Monday.com theme
            user: {
              id: "1234567890",
              name: "John Developer",
              email: "john.developer@company.com"
            },
            board: {
              id: 12345,
              name: "Employee Data Board"
            },
            item: {
              id: 67890,
              name: "Employee Record"
            }
          },
          timestamp: Date.now()
        };

        const contextData = mockData || defaultContext;
        // Simulate the context event
        const mockEvent = new CustomEvent('mondayContext', { detail: contextData });
        document.dispatchEvent(mockEvent);

        return contextData;
      },

      // Mock API for testing
      api: (query) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Mock response for board items query
            if (query.includes('boards(ids:')) {
              const mockEmployees = [
                {
                  id: '1',
                  name: 'გიორგი ბერიძე',
                  group: { id: 'group1', title: 'Executive' },
                  column_values: [
                    { id: 'person', text: 'გიორგი ბერიძე', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12345,
                        first_name: 'გიორგი',
                        last_name: 'ბერიძე',
                        email: 'giorgi.beridze@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'CEO' },
                    { id: 'department', text: 'Executive' },
                    { id: 'phone', text: '+995-555-123456' }
                  ]
                },
                {
                  id: '2',
                  name: 'მარიამი კობახიძე',
                  group: { id: 'group2', title: 'Technology' },
                  column_values: [
                    { id: 'person', text: 'მარიამი კობახიძე', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12346,
                        first_name: 'მარიამი',
                        last_name: 'კობახიძე',
                        email: 'mariam.kobakhidze@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'CTO' },
                    { id: 'department', text: 'Technology' },
                    { id: 'phone', text: '+995-555-123457' },
                    { id: 'manager', text: 'გიორგი ბერიძე' }
                  ]
                },
                {
                  id: '3',
                  name: 'დავითი გელაშვილი',
                  group: { id: 'group2', title: 'Technology' },
                  column_values: [
                    { id: 'person', text: 'დავითი გელაშვილი', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12347,
                        first_name: 'დავითი',
                        last_name: 'გელაშვილი',
                        email: 'daviti.gelashvili@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'Senior Developer' },
                    { id: 'department', text: 'Technology' },
                    { id: 'phone', text: '+995-555-123458' },
                    { id: 'manager', text: 'მარიამი კობახიძე' }
                  ]
                },
                {
                  id: '4',
                  name: 'ნინო ნაცვლიშვილი',
                  group: { id: 'group3', title: 'Human Resources' },
                  column_values: [
                    { id: 'person', text: 'ნინო ნაცვლიშვილი', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12348,
                        first_name: 'ნინო',
                        last_name: 'ნაცვლიშვილი',
                        email: 'nino.natsvlishvili@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'HR Manager' },
                    { id: 'department', text: 'Human Resources' },
                    { id: 'phone', text: '+995-555-123459' },
                    { id: 'manager', text: 'გიორგი ბერიძე' }
                  ]
                },
                {
                  id: '5',
                  name: 'ალექსი მაისურაძე',
                  group: { id: 'group4', title: 'Design' },
                  column_values: [
                    { id: 'person', text: 'ალექსი მაისურაძე', type: 'people', value: JSON.stringify({
                      personsAndTeams: [{
                        id: 12349,
                        first_name: 'ალექსი',
                        last_name: 'მაისურაძე',
                        email: 'aleksi.maisuradze@company.com',
                        photo_original: null,
                        photo_small: null
                      }]
                    })},
                    { id: 'position', text: 'Designer' },
                    { id: 'department', text: 'Design' },
                    { id: 'phone', text: '+995-555-123460' },
                    { id: 'manager', text: 'მარიამი კობახიძე' }
                  ]
                }
              ];

              resolve({
                data: {
                  boards: [{
                    name: 'Employee Data Board',
                    groups: [
                      { id: 'group1', title: 'Executive' },
                      { id: 'group2', title: 'Technology' },
                      { id: 'group3', title: 'Human Resources' },
                      { id: 'group4', title: 'Design' }
                    ],
                    items_page: {
                      items: mockEmployees
                    }
                  }]
                }
              });
            } else {
              resolve({ data: null });
            }
          }, 500); // Simulate API delay
        });
      },

      // Get current mock context
      getMockContext: () => {
        return {
          data: {
            boardId: 12345,
            itemId: 67890,
            theme: "light", // Monday.com theme
            user: {
              id: "1234567890",
              name: "John Developer",
              email: "john.developer@company.com"
            },
            board: {
              id: 12345,
              name: "Employee Data Board"
            },
            item: {
              id: 67890,
              name: "Employee Record"
            }
          },
          timestamp: Date.now()
        };
      },

      // Listen for custom events (for testing)
      onContext: (callback) => {
        document.addEventListener('mondayContext', (event) => {
          callback(event.detail);
        });
      },

      // Test theme switching
      setLightTheme: () => {
        const lightContext = {
          data: { ...window.mondayDev.getMockContext().data, theme: "light" },
          timestamp: Date.now()
        };
        window.mondayDev.triggerContext(lightContext);
      },

      setDarkTheme: () => {
        const darkContext = {
          data: { ...window.mondayDev.getMockContext().data, theme: "dark" },
          timestamp: Date.now()
        };
        window.mondayDev.triggerContext(darkContext);
      },

      setNightTheme: () => {
        const nightContext = {
          data: { ...window.mondayDev.getMockContext().data, theme: "night" },
          timestamp: Date.now()
        };
        window.mondayDev.triggerContext(nightContext);
      }
    };

    // Listen for our custom monday context events
    window.mondayDev.onContext((contextData) => {
      // Apply theme from mock context
      if (contextData && contextData.data && contextData.data.theme) {
        const mondayTheme = contextData.data.theme;
        // Convert monday.com themes to app themes
        // light = light mode, dark/night = dark mode
        if (mondayTheme === "light") {
          setTheme("light");
        } else {
          // Both "dark" and "night" should result in dark mode
          setTheme("dark");
        }
      }
    });

    // Add keyboard shortcuts for testing
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        window.mondayDev.triggerContext();
      } else if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        window.mondayDev.setLightTheme();
      } else if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        window.mondayDev.setDarkTheme();
      } else if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        window.mondayDev.setNightTheme();
      }
    });

    // Auto-trigger a context event after 3 seconds for testing
    setTimeout(() => {
      window.mondayDev.triggerContext();
      // Also load employees from the mock board
      setTimeout(() => {
        loadEmployeesFromBoard(12345);
      }, 1000);
    }, 3000);
  };

  // Context menu event listeners
  useEffect(() => {
    const handleGlobalContextMenu = (event) => {
      // Don't show context menu on form overlays, modals, or dropdowns
      if (event.target.closest('.form-overlay') || 
          event.target.closest('.settings-modal-overlay') || 
          event.target.closest('.view-popup-overlay') ||
          event.target.closest('.dropdown-menu')) {
        return;
      }
      handleContextMenu(event);
    };

    const handleGlobalClick = () => {
      closeContextMenu();
    };

    document.addEventListener('contextmenu', handleGlobalContextMenu);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Load employees from Monday.com board
  const loadEmployeesFromBoard = async (boardId) => {

    try {
      // Query to get board items with person details and board structure
      // Using column_values with all necessary fields for Monday.com API v2
      const query = `query {
        boards(ids: [${boardId}]) {
          name
          groups {
            id
            title
          }
          items_page(limit: 500) {
            items {
              id
              name
              group {
                id
                title
              }
              column_values {
                id
                text
                value
                type
                ... on StatusValue {
                  text
                  index
                }
                ... on TextValue {
                  text
                }
                ... on PeopleValue {
                  persons_and_teams {
                    id
                    kind
                  }
                }
              }
            }
          }
        }
      }`;

      const response = await monday.api(query);

      if (response.data && response.data.boards && response.data.boards[0]) {
        const board = response.data.boards[0];
        const items = board.items_page.items;
        
        console.log('📥 Monday.com-დან წამოღებული მონაცემები:');
        console.log('Board:', {
          boardId: boardId,
          boardName: board.name,
          itemsCount: items.length
        });
        console.log('Items:', items.map(item => ({
          id: item.id,
          name: item.name,
          group: item.group?.title,
          column_values: item.column_values.map(col => ({
            id: col.id,
            text: col.text,
            type: col.type,
            value: col.value
          }))
        })));

        // Check if column_values exist in API response
        if (items.length > 0) {
          const firstItem = items[0];
          
          // Check if column_values is empty or null
          if (!firstItem.column_values || firstItem.column_values.length === 0) {
            console.error('❌ column_values is empty or null!');
            console.error('   This might be a permissions issue.');
            console.error('   Make sure your Monday.com app has these scopes:');
            console.error('   - boards:read');
            console.error('   - items:read');
          }
        }

        // Convert Monday.com items to employees format
        const mondayEmployees = items.map((item, index) => {
          // Find all relevant columns - comprehensive search
          // In Monday.com API: column_values[].text = column header name, column_values[].value = cell value
          // But sometimes text can also contain the value, so we check both
          let firstnameColumn = item.column_values.find(col => {
            if (!col || !col.text) return false;
            
            const headerText = (col.text || '').toLowerCase().trim();
            const columnId = (col.id || '').toLowerCase();
            
            // Check by column ID (exact matches)
            if (
              columnId === 'firstname' ||
              columnId === 'first_name' ||
              columnId === 'first-name' ||
              columnId === 'firstname' ||
              columnId === 'first name'
            ) {
              return true;
            }
            
            // Check by column ID (contains)
            if (
              columnId.includes('firstname') ||
              columnId.includes('first_name') ||
              columnId.includes('first-name')
            ) {
              return true;
            }
            
            // Check by header text (column name) - exact matches
            if (
              headerText === 'first name' ||
              headerText === 'firstname' ||
              headerText === 'first-name' ||
              headerText === 'სახელი' // Georgian: სახელი
            ) {
              return true;
            }
            
            // Check by header text (column name) - contains
            if (
              headerText.includes('first name') ||
              headerText.includes('firstname') ||
              headerText.includes('first-name') ||
              headerText.includes('სახელი')
            ) {
              return true;
            }
            
            // Check if it's a text column and header contains "first"
            if (col.type === 'text' && headerText.includes('first')) {
              return true;
            }
            
            return false;
          });
          
          // Fallback: if not found, try to find by checking all text columns
          // Same approach as Person column - find by type and header text
          if (!firstnameColumn) {
            const textColumns = item.column_values.filter(col => col && col.type === 'text');
            
            // Try to find First Name in text columns by checking header text
            firstnameColumn = textColumns.find(col => {
              const headerText = (col.text || '').toLowerCase().trim();
              return (
                headerText === 'first name' ||
                headerText === 'firstname' ||
                headerText === 'first-name' ||
                headerText.includes('first name') ||
                headerText.includes('firstname') ||
                headerText === 'სახელი' ||
                headerText.includes('სახელი')
              );
            });
          }
          
          const lastnameColumn = item.column_values.find(col => {
            if (!col) return false;
            
            const headerText = (col.text || '').toLowerCase().trim();
            const columnId = (col.id || '').toLowerCase();
            
            // Check by column ID
            if (
              columnId === 'lastname' ||
              columnId === 'last_name' ||
              columnId === 'last-name' ||
              columnId.includes('lastname') ||
              columnId.includes('last_name')
            ) {
              return true;
            }
            
            // Check by header text (column name)
            if (
              headerText === 'last name' ||
              headerText === 'lastname' ||
              headerText === 'last-name' ||
              headerText.includes('last name') ||
              headerText.includes('lastname') ||
              headerText.includes('last-name') ||
              headerText === 'გვარი' || // Georgian: გვარი
              headerText.includes('გვარი')
            ) {
              return true;
            }
            
            return false;
          });

          const positionColumn = item.column_values.find(col => col.id === 'position' || col.id === 'role' || col.id === 'job_title');
          const emailColumn = item.column_values.find(col => col.id === 'email');
          const phoneColumn = item.column_values.find(col => col.id === 'phone' || col.id === 'mobile');
          const managerColumn = item.column_values.find(col => col.id === 'manager' || col.id === 'reports_to');
          
          // Find Status column (type === 'status')
          const statusColumn = item.column_values.find(col => col.type === 'status');
          let statusValue = null;
          if (statusColumn) {
            // Status column-ის text field-ში არის status-ის მნიშვნელობა (მაგ: "Done", "Working on it")
            if (statusColumn.text && statusColumn.text.trim()) {
              statusValue = statusColumn.text.trim();
            }
            // Fallback: value field-იდან JSON parse
            else if (statusColumn.value) {
              try {
                const parsed = JSON.parse(statusColumn.value);
                statusValue = parsed.text || statusColumn.value;
              } catch (e) {
                statusValue = statusColumn.value;
              }
            }
          }

          // Find person type columns (these contain user information)
          const personColumns = item.column_values.filter(col => col.type === 'people');
          let personData = null;
          let personNameFromText = null; // Person column-ის text field-იდან სახელი

          if (personColumns.length > 0) {
            const personColumn = personColumns[0];
            
            // პირველი პრიორიტეტი: Person column-ის text field-ში არის რეალური სახელი
            if (personColumn.text && personColumn.text.trim()) {
              personNameFromText = personColumn.text.trim();
            }
            
            // მეორე პრიორიტეტი: value field-იდან JSON parse
            try {
              // Person columns have JSON data in the value field
              const personValue = JSON.parse(personColumn.value || '{}');
              if (personValue.personsAndTeams && personValue.personsAndTeams.length > 0) {
                personData = personValue.personsAndTeams[0];
              }
              } catch (e) {
                // Error parsing person data
              }
          }

          // Build full name - prioritize Person column text, then First Name column, then person data, then item name
          let fullName = item.name; // Default fallback

          // Extract value from First Name column
          // Same logic as Person column: first check text field, then value field
          let firstNameValue = null;
          if (firstnameColumn) {
            // პირველი პრიორიტეტი: First Name column-ის text field-ში შეიძლება იყოს რეალური მნიშვნელობა
            // (როგორც Person column-ში text field შეიცავს person-ის სახელს)
            const textValue = firstnameColumn.text || '';
            const textLower = textValue.toLowerCase().trim();
            
            // Check if text field contains actual value (not column header name)
            if (
              textValue.trim() &&
              textLower !== 'first name' &&
              textLower !== 'firstname' &&
              textLower !== 'first-name' &&
              textLower !== 'სახელი' &&
              !textLower.includes('first name') &&
              !textLower.includes('firstname')
            ) {
              firstNameValue = textValue.trim();
            }
            
            // მეორე პრიორიტეტი: value field-იდან (JSON ან plain text)
            if (!firstNameValue || !firstNameValue.trim()) {
              if (firstnameColumn.value) {
                try {
                  const parsed = JSON.parse(firstnameColumn.value);
                  // Try different possible JSON structures
                  firstNameValue = parsed.text || parsed.value || parsed.name || firstnameColumn.value;
                } catch (e) {
                  // If not JSON, use value directly as string
                  firstNameValue = firstnameColumn.value;
                }
              }
            }
            
            // Clean up the value
            if (firstNameValue) {
              firstNameValue = String(firstNameValue).trim();
            }
          }

          let lastNameValue = null;
          if (lastnameColumn) {
            if (lastnameColumn.value) {
              try {
                const parsed = JSON.parse(lastnameColumn.value);
                lastNameValue = parsed.text || parsed.value || parsed.name || lastnameColumn.value;
              } catch (e) {
                lastNameValue = lastnameColumn.value;
              }
            }
            
            if (!lastNameValue || !lastNameValue.trim()) {
              const textValue = lastnameColumn.text || '';
              const textLower = textValue.toLowerCase().trim();
              if (
                textValue.trim() &&
                textLower !== 'last name' &&
                textLower !== 'lastname' &&
                textLower !== 'last-name' &&
                textLower !== 'გვარი' &&
                !textLower.includes('last name')
              ) {
                lastNameValue = textValue.trim();
              }
            }
            
            if (lastNameValue) {
              lastNameValue = String(lastNameValue).trim();
            }
          }

          // Priority order: Person column text > First Name column > Person data > Item name
          
          // First priority: Person column text field (contains real person name)
          if (personNameFromText && personNameFromText.trim()) {
            fullName = personNameFromText.trim();
          }
          // Second priority: First Name column (what user wants)
          else if (firstNameValue && firstNameValue.trim()) {
            const firstName = firstNameValue.trim();
            const lastName = lastNameValue ? lastNameValue.trim() : '';
            fullName = lastName ? `${firstName} ${lastName}` : firstName;
          }
          // Third priority: Person data from Person column value (JSON)
          else if (personData && personData.first_name) {
            const firstName = personData.first_name;
            const lastName = personData.last_name || '';
            fullName = `${firstName} ${lastName}`.trim();
          }
          // Fourth priority: Item name (fallback)
          else {
            fullName = item.name;
          }

          // Generate manager ID from manager column if available
          let managerId = null;
          if (managerColumn && managerColumn.text) {
            // Try to find manager by name in existing employees
            const manager = mondayEmployees.find(emp => emp.name === managerColumn.text);
            if (manager) {
              managerId = manager.id;
            } else {
              // If manager not found, assign to first employee as CEO
              managerId = index === 0 ? null : 1;
            }
          } else {
            // Default hierarchy: first employee is CEO, others report to CEO
            managerId = index === 0 ? null : 1;
          }

          // Extract position - prioritize positionColumn, then statusColumn, then default
          let positionValue = 'Employee';
          if (positionColumn && positionColumn.text) {
            positionValue = positionColumn.text;
          } else if (statusValue) {
            // Use Status column value as position (e.g., "Done", "Working on it", "Stuck")
            positionValue = statusValue;
          }

          
          return {
            id: parseInt(item.id),
            name: fullName,
            position: positionValue,
            department: 'General', // Don't use Monday.com data for department
            email: personData?.email || emailColumn?.text || `${fullName.toLowerCase().replace(' ', '.')}@company.com`,
            phone: phoneColumn ? phoneColumn.text : `+1-555-${String(100 + index).padStart(3, '0')}-${String(1000 + index).padStart(4, '0')}`,
            managerId: managerId,
            image: personData?.photo_original || personData?.photo_small || null,
            // Store personNameFromText for filtering
            hasPersonName: !!personNameFromText
          };
        })
        // Filter out items that don't have Person name
        .filter(emp => {
          return emp.hasPersonName;
        });

        // Only set employees if we have data from Monday.com
        if (mondayEmployees.length > 0) {
          console.log('✅ Monday.com-დან წამოღებული თანამშრომლები:', mondayEmployees);
          setEmployees(mondayEmployees);
          localStorage.setItem('employees', JSON.stringify(mondayEmployees));
        }
      }
    } catch (error) {
      console.error('❌ Error loading employees from Monday.com board:', error);
      console.error('❌ Error type:', error.constructor.name);

      // Log more detailed error info
      if (error.message) {
        console.error('❌ Error message:', error.message);
      }
      if (error.graphQLErrors) {
        console.error('❌ GraphQL errors:', error.graphQLErrors);
      }
      if (error.networkError) {
        console.error('❌ Network error:', error.networkError);
      }

      // Check if it's a permissions issue
      if (error.message && error.message.includes('Insufficient permissions')) {
        console.error('🚫 This looks like a permissions issue! Check your Monday.com app scopes.');
      }

      // Fall back to sample data if Monday.com data loading fails
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      } else {
        // Generate sample data if no saved data exists
        resetToSampleData();
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleImportExportMenu = () => {
    setShowImportExportMenu(!showImportExportMenu);
  };

  const handleDropdownMouseEnter = () => {
    setShowImportExportMenu(true);
  };

  const handleDropdownContainerMouseLeave = () => {
    setShowImportExportMenu(false);
  };

  const handleViewDropdownMouseEnter = () => {
    setShowViewMenu(true);
  };

  const handleViewDropdownContainerMouseLeave = () => {
    setShowViewMenu(false);
  };

  const handleSettingsDropdownMouseEnter = () => {
    setShowSettingsMenu(true);
  };

  const handleSettingsDropdownContainerMouseLeave = () => {
    setShowSettingsMenu(false);
  };

  const openSettingsModal = (section = 'field-management') => {
    setActiveSettingsSection(section);
    setShowSettingsModal(true);
    setShowSettingsMenu(false);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleSettingsTabChange = (section) => {
    setActiveSettingsSection(section);
  };

  const openViewPopup = (employee) => {
    setViewedEmployee(employee);
    setShowViewPopup(true);
  };

  const closeViewPopup = () => {
    setShowViewPopup(false);
    setViewedEmployee(null);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const closeContextMenu = () => {
    setShowContextMenu(false);
  };

  const handleAddEmployeeFromContext = () => {
    setShowContextMenu(false);
    handleAddNew();
  };

  const handleSettingsFromContext = () => {
    setShowContextMenu(false);
            openSettingsModal('field-management');
  };

  const tourSteps = [
    {
      target: 'body',
      title: 'Welcome to OrgChart Pro',
      content: 'Welcome to the ultimate organizational chart management solution. This powerful tool helps you visualize and manage your team structure with ease.',
      position: 'center',
      isIntro: true
    },
    {
      target: 'body',
      title: 'Developed by Syncoora',
      content: 'This application is proudly developed by Syncoora. For support, feedback, or inquiries, reach out to us at team@syncoora.com',
      position: 'center',
      isIntro: true
    },
    {
      target: '.add-employee-btn',
      title: 'Add Employee',
      content: 'Click here to add new employees to your organization. This opens a form where you can enter employee details including custom fields.',
      position: 'bottom'
    },
    {
      target: '.view-dropdown-container',
      title: 'Switch Views',
      content: 'Switch between Chart View (visual hierarchy) and List View (tabular data) to see your organization in different formats.',
      position: 'bottom'
    },
    {
      target: '.data-dropdown-container',
      title: 'Data Management',
      content: 'Import/Export your employee data. You can backup your data as CSV or PDF files, or import from CSV.',
      position: 'bottom'
    },
    {
      target: '.settings-dropdown-container',
      title: 'Settings',
      content: 'Access settings to manage custom fields, design preferences, and other application configurations.',
      position: 'bottom'
    },
    {
      target: '.app-main',
      title: 'Main Content Area',
      content: 'This is where your organizational chart or employee list is displayed. Right-click anywhere here for quick access to main functions.',
      position: 'top'
    }
  ];

  const handleAppNavigatorFromContext = () => {
    setShowContextMenu(false);
    setShowAppNavigator(true);
    setCurrentTourStep(0);
  };

  const nextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    } else {
      setShowAppNavigator(false);
      setCurrentTourStep(0);
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const closeTour = () => {
    setShowAppNavigator(false);
    setCurrentTourStep(0);
  };

  const addEmployee = (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: Date.now(),
      managerId: employeeData.managerId ? parseInt(employeeData.managerId) : null
    };
    setEmployees([...employees, newEmployee]);
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const updateEmployee = (employeeData) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? { ...employeeData, id: emp.id, managerId: employeeData.managerId ? parseInt(employeeData.managerId) : null }
        : emp
    );
    setEmployees(updatedEmployees);
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const confirmDeleteEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const deleteEmployee = (employeeId) => {
    // Check if employee has subordinates
    const hasSubordinates = employees.some(emp => emp.managerId === employeeId);
    
    if (hasSubordinates) {
      const employee = employees.find(emp => emp.id === employeeId);
      const subordinates = employees.filter(emp => emp.managerId === employeeId);
      setEmployeeWithSubordinates({ employee, subordinates });
      setShowSubordinatesError(true);
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
      return;
    }

    const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
    setEmployees(updatedEmployees);
    setSelectedEmployee(null);
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const closeSubordinatesError = () => {
    setShowSubordinatesError(false);
    setEmployeeWithSubordinates(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const handleImportEmployees = (importedEmployees) => {
    setEmployees(importedEmployees);
  };

  const resetToSampleData = () => {
    // Generate 20 sample employees
    const generateSampleEmployees = () => {
      const names = [
        'John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Wilson',
        'Emma Wilson', 'James Brown', 'Sophia Davis', 'Michael Johnson', 'Olivia Garcia',
        'Daniel Miller', 'Ava Rodriguez', 'Christopher Martinez', 'Isabella Anderson', 'Matthew Taylor',
        'Mia Thomas', 'Andrew Jackson', 'Charlotte White', 'Joshua Harris', 'Amelia Martin',
        'Ryan Thompson', 'Harper Garcia', 'Nicholas Moore', 'Evelyn Lee', 'Christopher Clark',
        'Grace Lewis', 'Kevin Hall', 'Chloe Allen', 'Steven Young', 'Zoe King',
        'Brian Wright', 'Lily Green', 'Timothy Baker', 'Hannah Adams', 'Jeffrey Nelson',
        'Victoria Carter', 'Mark Mitchell', 'Penelope Perez', 'Donald Roberts', 'Layla Turner',
        'Paul Phillips', 'Riley Campbell', 'George Parker', 'Nora Evans', 'Edward Edwards',
        'Scarlett Collins', 'Robert Stewart', 'Aria Morris', 'Thomas Rogers', 'Luna Reed'
      ];

      const positions = [
        'CEO', 'CTO', 'CFO', 'COO', 'VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR',
        'Senior Software Engineer', 'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Data Analyst',
        'UX Designer', 'UI Designer', 'Graphic Designer', 'Marketing Manager', 'Marketing Specialist',
        'Sales Manager', 'Sales Representative', 'Account Executive', 'Customer Success Manager',
        'HR Manager', 'HR Coordinator', 'Recruiter', 'Finance Manager', 'Financial Analyst',
        'Accountant', 'Operations Manager', 'Operations Specialist', 'DevOps Engineer',
        'QA Engineer', 'Technical Lead', 'Architect', 'Database Administrator', 'System Administrator',
        'Content Strategist', 'SEO Specialist', 'Social Media Manager', 'Brand Manager',
        'Legal Counsel', 'Compliance Officer', 'Security Engineer', 'Network Engineer', 'Support Engineer'
      ];

      const departments = [
        'Executive', 'Technology', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
        'Human Resources', 'Finance', 'Operations', 'Customer Success', 'Business Development', 
        'Research & Development', 'Legal', 'Security', 'Support'
      ];

      const employees = [];
      
      // Create CEO (no manager)
      employees.push({
        id: 1,
        name: names[0],
        position: 'CEO',
        department: 'Executive',
        email: `${names[0].toLowerCase().replace(' ', '.')}@company.com`,
        phone: `+1-555-${String(100 + 1).padStart(3, '0')}-${String(1000 + 1).padStart(4, '0')}`,
        managerId: null,
        image: null
      });

      // Create C-level executives (report to CEO)
      const cLevelPositions = ['CTO', 'CFO', 'COO'];
      for (let i = 0; i < cLevelPositions.length; i++) {
        employees.push({
          id: i + 2,
          name: names[i + 1],
          position: cLevelPositions[i],
          department: cLevelPositions[i] === 'CTO' ? 'Technology' : cLevelPositions[i] === 'CFO' ? 'Finance' : 'Operations',
          email: `${names[i + 1].toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + i + 2).padStart(3, '0')}-${String(1000 + i + 2).padStart(4, '0')}`,
          managerId: 1,
          image: null
        });
      }

      // Create VPs (report to C-level)
      const vpPositions = ['VP of Engineering', 'VP of Marketing', 'VP of Sales', 'VP of HR'];
      const vpDepartments = ['Technology', 'Marketing', 'Sales', 'Human Resources'];
      for (let i = 0; i < vpPositions.length; i++) {
        const managerId = i < 2 ? 2 : i < 3 ? 3 : 4; // CTO, CTO, CFO, COO
        employees.push({
          id: i + 5,
          name: names[i + 4],
          position: vpPositions[i],
          department: vpDepartments[i],
          email: `${names[i + 4].toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + i + 5).padStart(3, '0')}-${String(1000 + i + 5).padStart(4, '0')}`,
          managerId: managerId,
          image: null
        });
      }

      // Create remaining employees (report to VPs and other managers)
      let currentId = 9;
      for (let i = 9; i < 21; i++) {
        const name = names[i];
        const position = positions[Math.floor(Math.random() * positions.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        
        // Assign manager based on department and hierarchy
        let managerId;
        if (department === 'Technology' || department === 'Engineering') {
          managerId = Math.random() > 0.5 ? 2 : 5; // CTO or VP Engineering
        } else if (department === 'Marketing') {
          managerId = 6; // VP Marketing
        } else if (department === 'Sales') {
          managerId = 7; // VP Sales
        } else if (department === 'Human Resources') {
          managerId = 8; // VP HR
        } else if (department === 'Finance') {
          managerId = 3; // CFO
        } else if (department === 'Operations') {
          managerId = 4; // COO
        } else {
          // For other departments, randomly assign to existing managers
          const existingManagers = employees.filter(emp => 
            emp.position.includes('VP') || emp.position.includes('Manager') || emp.position.includes('Lead')
          );
          if (existingManagers.length > 0) {
            managerId = existingManagers[Math.floor(Math.random() * existingManagers.length)].id;
          } else {
            managerId = 1; // Default to CEO
          }
        }

        employees.push({
          id: currentId,
          name: name,
          position: position,
          department: department,
          email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
          phone: `+1-555-${String(100 + currentId).padStart(3, '0')}-${String(1000 + currentId).padStart(4, '0')}`,
          managerId: managerId,
          image: null
        });
        currentId++;
      }

      return employees;
    };

    const sampleEmployees = generateSampleEmployees();
    setEmployees(sampleEmployees);
    setSelectedEmployee(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Organizational Chart</h1>
          <div className="header-actions">
            <div className="dropdown-container view-dropdown-container" ref={viewDropdownRef} onMouseLeave={handleViewDropdownContainerMouseLeave}>
              <button 
                className="dropdown-trigger"
                onClick={() => setShowViewMenu(!showViewMenu)}
                onMouseEnter={handleViewDropdownMouseEnter}
              >
                {viewMode === 'chart' ? <Users size={20} /> : <Settings size={20} />}
                {viewMode === 'chart' ? 'Chart View' : 'List View'}
              </button>
              
              {showViewMenu && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleViewDropdownMouseEnter}
                >
                  <div className="dropdown-menu-content">
                    <div className="menu-section">
                      <h4>View Mode</h4>
                      <button 
                        className={`menu-item ${viewMode === 'chart' ? 'active' : ''}`}
                        onClick={() => {
                          setViewMode('chart');
                          setShowViewMenu(false);
                        }}
                      >
                        <Users size={16} />
                        Chart View
                      </button>
                      <button 
                        className={`menu-item ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => {
                          setViewMode('list');
                          setShowViewMenu(false);
                        }}
                      >
                        <Settings size={16} />
                        List View
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button className="add-employee-btn" onClick={handleAddNew}>
              <Plus size={20} />
              Add Employee
            </button>
            
            <div className="dropdown-container data-dropdown-container" ref={dropdownRef} onMouseLeave={handleDropdownContainerMouseLeave}>
              <button 
                className="dropdown-trigger"
                onClick={toggleImportExportMenu}
                onMouseEnter={handleDropdownMouseEnter}
              >
                <Download size={20} />
                Data
              </button>
              
              {showImportExportMenu && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleDropdownMouseEnter}
                >
                  <ImportExport 
                    employees={employees}
                    onImportEmployees={handleImportEmployees}
                    onResetToSample={resetToSampleData}
                    isDropdown={true}
                    orgChartRef={orgChartRef}
                  />
                </div>
              )}
            </div>

            <div className="dropdown-container settings-dropdown-container" ref={settingsDropdownRef} onMouseLeave={handleSettingsDropdownContainerMouseLeave}>
              <button 
                className="dropdown-trigger"
                onClick={() => openSettingsModal('field-management')}
                onMouseEnter={handleSettingsDropdownMouseEnter}
              >
                <SettingsIcon size={20} />
                Settings
              </button>
              
              {showSettingsMenu && (
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleSettingsDropdownMouseEnter}
                >
                  <div className="dropdown-menu-content">
                    <div className="menu-section">
                      <h4>Fields & Forms</h4>
                      <button 
                        className="menu-item"
                        onClick={() => openSettingsModal('field-management')}
                      >
                        <List size={16} />
                        Field Management
                      </button>
                    </div>
                    <div className="menu-section">
                      <h4>Appearance</h4>
                      <button 
                        className="menu-item"
                        onClick={() => openSettingsModal('designer')}
                      >
                        <Palette size={16} />
                        Designer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              className={`theme-toggle-switch ${theme === 'dark' ? 'active' : ''}`} 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              <div className="toggle-slider">
                {theme === 'light' ? <Sun size={12} /> : <Moon size={12} />}
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <EmployeeForm
                employee={selectedEmployee}
                employees={employees}
                onSubmit={selectedEmployee ? updateEmployee : addEmployee}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        )}

        {viewMode === 'chart' ? (
          <div className="org-chart-container" ref={orgChartRef}>
            <OrgChart
              employees={employees}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={confirmDeleteEmployee}
              onViewEmployee={openViewPopup}
              designSettings={designSettings}
            />
          </div>
        ) : (
          <div className="employee-list-container">
            <EmployeeList
              employees={employees}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={confirmDeleteEmployee}
              onViewEmployee={openViewPopup}
            />
          </div>
        )}

        <Settings
          isOpen={showSettingsModal}
          onClose={closeSettingsModal}
          activeSection={activeSettingsSection}
          onTabChange={handleSettingsTabChange}
          designSettings={designSettings}
          onDesignSettingsChange={setDesignSettings}
        />

        {/* Employee View Popup */}
        {showViewPopup && viewedEmployee && (
          <div className="view-popup-overlay">
            <div className="view-popup">
              <div className="view-popup-header">
                <div className="employee-avatar">
                  {viewedEmployee.image ? (
                    <img src={viewedEmployee.image} alt={viewedEmployee.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {viewedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="employee-header-info">
                  <h2>{viewedEmployee.name}</h2>
                  <p className="position">{viewedEmployee.position}</p>
                  <span className="department-badge">{viewedEmployee.department}</span>
                </div>
                <div className="view-popup-header-actions">
                  <button 
                    className="edit-view-btn" 
                    onClick={() => {
                      closeViewPopup();
                      handleEditEmployee(viewedEmployee);
                    }}
                    title="Edit Employee"
                  >
                    <Edit size={20} />
                  </button>
                  <button className="close-view-btn" onClick={closeViewPopup}>
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="view-popup-content">
                <div className="info-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      <span>{viewedEmployee.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{viewedEmployee.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Organizational Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Manager</label>
                      <span>
                        {viewedEmployee.managerId ? 
                          employees.find(emp => emp.id === viewedEmployee.managerId)?.name || 'Unknown' 
                          : 'No Manager'
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Direct Reports</label>
                      <span>
                        {employees.filter(emp => emp.managerId === viewedEmployee.id).length} employees
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Fields Section */}
                {(() => {
                  const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
                  const hasCustomFields = customFields.length > 0;
                  
                  if (hasCustomFields) {
                    return (
                      <div className="info-section">
                        <h3>Additional Information</h3>
                        <div className="info-grid">
                          {customFields.map(field => (
                            <div key={field.id} className="info-item">
                              <label>{field.name}</label>
                              <span>
                                {viewedEmployee[field.name] || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="view-popup-actions">
                <button className="edit-employee-btn" onClick={() => {
                  closeViewPopup();
                  handleEditEmployee(viewedEmployee);
                }}>
                  <Edit size={16} />
                  Edit Employee
                </button>
                <button className="delete-employee-btn" onClick={() => {
                  closeViewPopup();
                  confirmDeleteEmployee(viewedEmployee.id);
                }}>
                  <Trash2 size={16} />
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {showContextMenu && (
          <div 
            className="context-menu-overlay"
            onClick={closeContextMenu}
          >
            <div 
              className="context-menu"
              style={{
                left: contextMenuPosition.x,
                top: contextMenuPosition.y
              }}
              onClick={(e) => e.stopPropagation()}
            >
                           <button 
               className="context-menu-item"
               onClick={handleAddEmployeeFromContext}
             >
               <Plus size={16} />
               Add Employee
             </button>
             <button 
               className="context-menu-item"
               onClick={handleSettingsFromContext}
             >
               <SettingsIcon size={16} />
               Settings
             </button>
             <button 
               className="context-menu-item"
               onClick={handleAppNavigatorFromContext}
             >
               <List size={16} />
               Product Tour
             </button>
            </div>
          </div>
        )}

        {/* App Navigator Tour */}
        {showAppNavigator && (
          <div className="tour-overlay">
            {!tourSteps[currentTourStep]?.isIntro && (
              <div className="tour-highlight" style={{
                left: document.querySelector(tourSteps[currentTourStep]?.target)?.getBoundingClientRect().left || 0,
                top: document.querySelector(tourSteps[currentTourStep]?.target)?.getBoundingClientRect().top || 0,
                width: document.querySelector(tourSteps[currentTourStep]?.target)?.offsetWidth || 0,
                height: document.querySelector(tourSteps[currentTourStep]?.target)?.offsetHeight || 0
              }}></div>
            )}
            
            <div className={`tour-tooltip ${tourSteps[currentTourStep]?.isIntro ? 'tour-tooltip-intro' : 'tour-tooltip-center'}`}>
              <div className="tour-header">
                <h3>{tourSteps[currentTourStep]?.title}</h3>
                <button className="tour-close" onClick={closeTour}>
                  <X size={20} />
                </button>
              </div>
              <p>{tourSteps[currentTourStep]?.content}</p>
              <div className="tour-navigation">
                <button 
                  className="tour-nav-btn tour-nav-arrow"
                  onClick={prevTourStep}
                  disabled={currentTourStep === 0}
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="tour-progress">
                  {currentTourStep + 1} of {tourSteps.length}
                </div>
                <button 
                  className="tour-nav-btn tour-nav-arrow"
                  onClick={nextTourStep}
                  title={currentTourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && employeeToDelete && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <div className="delete-confirm-header">
                <h3>Delete Employee</h3>
                <button className="close-btn" onClick={cancelDelete}>
                  <X size={20} />
                </button>
              </div>
              <div className="delete-confirm-content">
                <div className="delete-warning">
                  <Trash2 size={48} />
                  <h4>Are you sure you want to delete this employee?</h4>
                  <p>
                    This action cannot be undone. The employee <strong>{employeeToDelete.name}</strong> will be permanently removed from the organization.
                  </p>
                </div>
                <div className="delete-confirm-actions">
                  <button className="cancel-btn" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteEmployee(employeeToDelete.id)}
                  >
                    <Trash2 size={16} />
                    Delete Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subordinates Error Popup */}
        {showSubordinatesError && employeeWithSubordinates && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal subordinates-error-modal">
              <div className="delete-confirm-header">
                <h3>Cannot Delete Employee</h3>
                <button className="close-btn" onClick={closeSubordinatesError}>
                  <X size={20} />
                </button>
              </div>
              <div className="delete-confirm-content">
                <div className="subordinates-warning">
                  <Users size={48} />
                  <h4>Employee has subordinates</h4>
                  <p>
                    <strong>{employeeWithSubordinates.employee.name}</strong> cannot be deleted because they have <strong>{employeeWithSubordinates.subordinates.length} subordinate(s)</strong> reporting to them.
                  </p>
                  <div className="subordinates-list">
                    <h5>Subordinates:</h5>
                    <ul>
                      {employeeWithSubordinates.subordinates.map(sub => (
                        <li key={sub.id}>
                          <span className="subordinate-name">{sub.name}</span>
                          <span className="subordinate-position">{sub.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="subordinates-help">
                    To delete this employee, you must first either:
                    <br />• Reassign their subordinates to another manager, or
                    <br />• Delete the subordinates first
                  </p>
                </div>
                <div className="delete-confirm-actions">
                  <button className="cancel-btn" onClick={closeSubordinatesError}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
