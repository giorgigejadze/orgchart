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
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [mondayDataLoaded, setMondayDataLoaded] = useState(false);
  const [boardId, setBoardId] = useState(null);
  const [columnMappings, setColumnMappings] = useState({});
  const [managerDropdownOptions, setManagerDropdownOptions] = useState([]);
  const [departmentDropdownOptions, setDepartmentDropdownOptions] = useState([]);
  const [isOrganizeDisabled, setIsOrganizeDisabled] = useState(false);
  const [employeeJustEdited, setEmployeeJustEdited] = useState(false);
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
    
    // if (savedEmployees) {
    //   setEmployees(JSON.parse(savedEmployees));
    // }

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

  // Re-enable organize button whenever employees change
  useEffect(() => {
    if (isOrganizeDisabled) {
      console.log('🔄 Employees changed - re-enabling organize button');
      setIsOrganizeDisabled(false);
    }
  }, [employees]);

  // Function to force re-enable organize button
  const reEnableOrganize = () => {
    if (isOrganizeDisabled) {
      console.log('🔄 Force re-enabling organize button');
      setIsOrganizeDisabled(false);
    }
  };

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
              // Store board ID for future API calls
              if (context.data && context.data.boardId) {
                setBoardId(context.data.boardId);
                loadEmployeesFromBoard(context.data.boardId);
              }
            } else {
              // Enable development mode with mock context
              setIsStandaloneMode(true);
              setMondayDataLoaded(false); // Reset Monday data flag in standalone mode
              enableDevelopmentMode();
            }
          });
        } catch (error) {
          setIsStandaloneMode(true);
          setMondayDataLoaded(false); // Reset Monday data flag on error
          enableDevelopmentMode();
        }
      } else {
        // Enable development mode even without SDK
        setIsStandaloneMode(true);
        setMondayDataLoaded(false); // Reset Monday data flag without SDK
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
                    { id: 'position', text: 'პოზიცია' },  // Georgian title
                    { id: 'dept', text: 'განყოფილება' }, // Different ID, Georgian title
                    { id: 'telephone', text: 'ტელეფონი' }, // Different ID, Georgian title
                    { id: 'office_location', text: 'ოფისი' }, // Different ID, Georgian title
                    { id: 'employment_start', text: 'დასაქმების თარიღი' }, // Different ID, Georgian title
                    { id: 'compensation', text: 'ანაზღაურება' }, // Different ID, Georgian title
                    { id: 'work_experience', text: 'სამუშაო გამოცდილება', type: 'numbers' }, // Different ID, Georgian title
                    { id: 'performance_level', text: 'შესრულების დონე', type: 'status' } // Status column with Georgian title
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
                    { id: 'job_title', text: 'ტექნიკური დირექტორი' }, // Different ID, Georgian title
                    { id: 'division', text: 'ტექნოლოგიები' }, // Different ID, Georgian title
                    { id: 'mobile_phone', text: 'მობილური ტელეფონი' }, // Different ID, Georgian title
                    { id: 'supervisor', text: 'გიორგი ბერიძე' }, // Different ID
                    { id: 'work_location', text: 'სამუშაო ადგილი' }, // Different ID, Georgian title
                    { id: 'hire_date', text: 'დასაქმების თარიღი' }, // Different ID, Georgian title
                    { id: 'monthly_pay', text: 'თვიური ხელფასი' }, // Different ID, Georgian title
                    { id: 'years_experience', text: 'გამოცდილების წლები', type: 'numbers' }, // Different ID, Georgian title
                    { id: 'contract_type', text: 'ხელშეკრულების ტიპი', type: 'status' } // Status column
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
                    { id: 'manager', text: 'მარიამი კობახიძე' },
                    { id: 'location', text: 'Tbilisi' },
                    { id: 'start_date', text: '2021-06-01' },
                    { id: 'salary', text: '35000' },
                    { id: 'experience_years', text: '8', type: 'numbers' },
                    { id: 'performance_rating', text: '4.5', type: 'rating' },
                    { id: 'employment_status', text: 'Full-time', type: 'status' }
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
                column {
                  title
                  type
                }
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

        // Extract manager and department dropdown options from column settings
        const managerOptions = [];
        const departmentOptions = [];
        console.log('🔍 Looking for manager and department columns in board.columns:', board.columns?.length || 0, 'columns');
        if (board.columns) {
          board.columns.forEach(column => {
            const columnTitle = column.title?.toLowerCase() || '';
            console.log(`🔍 Checking column: "${column.title}" (type: ${column.type})`);

            // Find manager column
            if ((column.type === 'dropdown' || column.type === 'status') &&
                (columnTitle.includes('manager') || columnTitle.includes('მენეჯერი') ||
                 columnTitle.includes('supervisor') || columnTitle.includes('boss'))) {

              console.log(`✅ Found manager column: "${column.title}"`);
              try {
                const settings = JSON.parse(column.settings_str || '{}');
                console.log(`🔧 Manager column settings:`, settings);
                if (settings.labels) {
                  console.log(`📋 Manager raw labels:`, settings.labels);
                  // Extract all label values from the dropdown settings
                  Object.values(settings.labels).forEach(label => {
                    if (label && typeof label === 'string' && label.trim()) {
                      managerOptions.push(label.trim());
                      console.log(`➕ Added manager option: "${label.trim()}"`);
                    }
                  });
                } else {
                  console.log(`⚠️ No manager labels found in settings`);
                }
              } catch (error) {
                console.log('❌ Error parsing manager column settings:', error);
              }
            }

            // Find department column
            else if ((column.type === 'dropdown' || column.type === 'status') &&
                     (columnTitle.includes('department') || columnTitle.includes('დეპარტამენტი') ||
                      columnTitle.includes('dept') || columnTitle.includes('division'))) {

              console.log(`✅ Found department column: "${column.title}"`);
              try {
                const settings = JSON.parse(column.settings_str || '{}');
                console.log(`🔧 Department column settings:`, settings);
                if (settings.labels) {
                  console.log(`📋 Department raw labels:`, settings.labels);
                  // Extract all label values from the dropdown settings
                  Object.values(settings.labels).forEach(label => {
                    if (label && typeof label === 'string' && label.trim()) {
                      departmentOptions.push(label.trim());
                      console.log(`➕ Added department option: "${label.trim()}"`);
                    }
                  });
                } else {
                  console.log(`⚠️ No department labels found in settings`);
                }
              } catch (error) {
                console.log('❌ Error parsing department column settings:', error);
              }
            }
          });
        }

        console.log('📊 Monday.com-დან მიღებული მონაცემები:', items.map(item => ({
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

        // Collect all employee names and department names
        const mondayEmployeeNames = [...new Set(items.map(item => item.name).filter(name => name && name.trim()))];
        console.log('👥 Employee names from Monday.com:', mondayEmployeeNames);

        // Collect department names from Monday.com data
        const mondayDepartmentNames = [];
        items.forEach(item => {
          item.column_values.forEach(col => {
            // Look for department-related columns
            const colTitle = col.column?.title?.toLowerCase() || '';
            if ((colTitle.includes('department') || colTitle.includes('დეპარტამენტი') ||
                 colTitle.includes('dept') || colTitle.includes('division')) && col.text) {
              mondayDepartmentNames.push(col.text.trim());
            }
          });
        });
        const uniqueMondayDepartmentNames = [...new Set(mondayDepartmentNames)];
        console.log('🏢 Department names from Monday.com:', uniqueMondayDepartmentNames);

        // Combine with local employee departments
        const employeeDepartmentNames = employees.length > 0
          ? [...new Set(employees.map(emp => emp.department).filter(dept => dept && dept.trim()))]
          : [];
        const allCurrentDepartmentNames = [...new Set([...uniqueMondayDepartmentNames, ...employeeDepartmentNames])];
        console.log('🏢 All department names for dropdown sync:', allCurrentDepartmentNames);

        // Combine Monday.com data with any local employees that might exist
        const localEmployeeNames = employees.length > 0
          ? [...new Set(employees.map(emp => emp.name).filter(name => name && name.trim()))]
          : [];
        const allCurrentEmployeeNames = [...new Set([...mondayEmployeeNames, ...localEmployeeNames])];
        console.log('👥 Local employee names:', localEmployeeNames);
        console.log('👥 All employee names for dropdown sync:', allCurrentEmployeeNames);

        // Auto-sync department dropdown with department names
        if (departmentOptions.length > 0) {
          // Find the department column details
          const departmentColumns = board.columns?.filter(col => {
            const columnTitle = col.title?.toLowerCase() || '';
            return (col.type === 'dropdown' || col.type === 'status') &&
                   (columnTitle.includes('department') || columnTitle.includes('დეპარტამენტი') ||
                    columnTitle.includes('dept') || columnTitle.includes('division'));
          });

          // Prioritize columns with valid settings, then any department column
          const departmentColumn = departmentColumns?.find(col => {
            try {
              const settings = JSON.parse(col.settings_str || '{}');
              return settings.labels && Object.keys(settings.labels).length > 0;
            } catch {
              return false;
            }
          }) || departmentColumns?.[0]; // Fallback to first column if none have valid settings

          console.log(`🏢 Using Department column: ${departmentColumn?.title} (ID: ${departmentColumn?.id})`);

          if (departmentColumn) {
            // Check what department names are missing
            const missingDepartments = allCurrentDepartmentNames.filter(name => !departmentOptions.includes(name));

            if (missingDepartments.length > 0) {
              console.log('🔄 Auto-syncing department dropdown - adding missing departments:', missingDepartments);
              console.log('📋 Department raw labels (current):', JSON.parse(departmentColumn.settings_str || '{}').labels);
              console.log('📊 Departments to add:', missingDepartments);

              // Create updated labels object
              const updatedLabels = { ...JSON.parse(departmentColumn.settings_str || '{}').labels };

              // Add missing departments as new labels
              let nextId = Math.max(...Object.keys(updatedLabels).map(k => parseInt(k)), 0) + 1;
              missingDepartments.forEach(dept => {
                updatedLabels[nextId.toString()] = dept;
                nextId++;
              });

              // Update the column settings
              try {
                // Update local state only (change_column_settings doesn't exist in Monday.com API)
                // Labels will be created automatically when updating items with create_labels_if_missing: true
                console.log('✅ Department dropdown auto-updated with new department names (local state only)');
                console.log('📋 Department raw labels (updated):', updatedLabels);

                // Update local state with new options
                const updatedOptions = Object.values(updatedLabels);
                setDepartmentDropdownOptions(updatedOptions);
                console.log('📋 Updated local department dropdown options:', updatedOptions);
              } catch (error) {
                console.log('❌ Error updating department dropdown:', error);
              }
            } else {
              console.log('✅ Department dropdown is already in sync with department names');
              setDepartmentDropdownOptions(departmentOptions);
            }
          } else {
            console.log('⚠️ Department column found but details not available for auto-sync');
            setDepartmentDropdownOptions(departmentOptions);
          }
        } else {
          console.log('⚠️ No department dropdown column found - skipping auto-sync (no column creation)');
          console.log('💡 To enable department dropdown sync:');
          console.log('   1. Go to your Monday.com board');
          console.log('   2. Add a "Department" column (dropdown type)');
          console.log('   3. Add department names to the dropdown options');
          console.log('   4. Refresh this page');

          // Don't set department dropdown options since there's no column to sync with
          setDepartmentDropdownOptions([]);
        }

        // Function to sync manager dropdown options
        const syncManagerDropdown = async () => {
          if (managerOptions.length > 0) {
            // Find the manager column details
            const managerColumns = board.columns?.filter(col => {
              const columnTitle = col.title?.toLowerCase() || '';
              return (col.type === 'dropdown' || col.type === 'status') &&
                     (columnTitle.includes('manager') || columnTitle.includes('მენეჯერი') ||
                      columnTitle.includes('supervisor') || columnTitle.includes('boss'));
            });

            // Prioritize columns with valid settings, then any manager column
            const managerColumn = managerColumns?.find(col => {
              try {
                const settings = JSON.parse(col.settings_str || '{}');
                return settings.labels && Object.keys(settings.labels).length > 0;
              } catch {
                return false;
              }
            }) || managerColumns?.[0]; // Fallback to first column if none have valid settings

            if (managerColumn) {
              // Check what employee names are missing
              const missingNames = allCurrentEmployeeNames.filter(name => !managerOptions.includes(name));

              if (missingNames.length > 0) {
                console.log('🔄 Auto-syncing manager dropdown - adding missing employee names:', missingNames);

                // Create updated labels object
                const updatedLabels = { ...JSON.parse(managerColumn.settings_str || '{}').labels };

                // Add missing names as new labels
                let nextId = Math.max(...Object.keys(updatedLabels).map(k => parseInt(k)), 0) + 1;
                missingNames.forEach(name => {
                  updatedLabels[nextId.toString()] = name;
                  nextId++;
                });

                // Update the column settings
                try {
                  // Update local state only (change_column_settings doesn't exist in Monday.com API)
                  // Labels will be created automatically when updating items with create_labels_if_missing: true
                  console.log('✅ Manager dropdown auto-updated with new employee names (local state only)');

                  // Update local state with new options
                  const updatedOptions = Object.values(updatedLabels);
                  setManagerDropdownOptions(updatedOptions);
                  console.log('📋 Updated local manager dropdown options:', updatedOptions);
                  return true; // Success
                } catch (error) {
                  console.log('❌ Error updating manager dropdown:', error);
                  return false; // Failed
                }
              } else {
                console.log('✅ Manager dropdown is already in sync with employee names');
                setManagerDropdownOptions(managerOptions);
                return true; // Already in sync
              }
            }
          }
          return false; // No manager column or options
        };

        // Auto-sync manager dropdown with employee names - improved version
        // Find the manager column first
        const managerColumns = board.columns?.filter(col => {
          const columnTitle = col.title?.toLowerCase() || '';
          return (col.type === 'dropdown' || col.type === 'status') &&
                 (columnTitle.includes('manager') || columnTitle.includes('მენეჯერი') ||
                  columnTitle.includes('supervisor') || columnTitle.includes('boss'));
        });
        
        const managerColumn = managerColumns?.[0];
        
        if (managerColumn) {
          console.log(`👔 Using Manager column: ${managerColumn.title} (ID: ${managerColumn.id})`);
          
          // Get current dropdown options
          const currentLabels = JSON.parse(managerColumn.settings_str || '{}').labels || {};
          const currentOptions = Object.values(currentLabels).filter(label => label && typeof label === 'string');
          
          // Get all employee names (from Monday.com data and local employees)
          const allEmployeeNames = allCurrentEmployeeNames;
          
          // Find missing employee names
          const missingNames = allEmployeeNames.filter(name => !currentOptions.includes(name));
          
          if (missingNames.length > 0) {
            console.log('🔄 Auto-syncing manager dropdown - adding missing employee names:', missingNames);
            
            // Add missing names to dropdown
            const updatedLabels = { ...currentLabels };
            let nextId = Math.max(...Object.keys(updatedLabels).map(k => parseInt(k) || 0), 0) + 1;
            missingNames.forEach(name => {
              updatedLabels[nextId.toString()] = name;
              nextId++;
            });
            
            // Update local state only (change_column_settings doesn't exist in Monday.com API)
            // Labels will be created automatically when updating items with create_labels_if_missing: true
            try {
              console.log('✅ Manager dropdown auto-updated with new employee names (local state only)');
              
              // Update local state with new options
              const updatedOptions = Object.values(updatedLabels);
              setManagerDropdownOptions(updatedOptions);
              console.log('📋 Updated local manager dropdown options:', updatedOptions);
            } catch (error) {
              console.log('❌ Error updating manager dropdown:', error);
              setManagerDropdownOptions(currentOptions);
            }
          } else {
            console.log('✅ Manager dropdown is already in sync with employee names');
            setManagerDropdownOptions(currentOptions);
          }
        } else {
          console.log('⚠️ No manager dropdown column found - skipping auto-sync');
          setManagerDropdownOptions([]);
        }

        // Detect column mappings from the board structure
        // Load existing column mappings from localStorage first
        const savedColumnMappings = JSON.parse(localStorage.getItem('columnMappings') || '{}');
        const detectedMappings = { ...savedColumnMappings };
        
        if (items.length > 0 && items[0].column_values) {
          const sampleItem = items[0];

          // Analyze each column to determine what field it represents



          sampleItem.column_values.forEach(col => {
            const columnId = col.id;
            const columnTitle = (col.column?.title || '').toLowerCase().trim();
            const columnType = col.type;


            // Check if this column is already mapped to prevent duplicates
            const existingMapping = Object.keys(detectedMappings).find(key => detectedMappings[key] === columnId);

            if (existingMapping) {
            } else {
              
              // Handle image column detection first (can be file type)
              if (columnTitle.includes('image') || columnTitle.includes('photo') || columnTitle.includes('avatar') || columnTitle.includes('სურათი') || columnTitle.includes('picture') || columnTitle.includes('pic')) {
                if (!detectedMappings.image) {
                  detectedMappings.image = columnId;
                }
              }
              // Map columns based on their text/header names and types
              // Only map to appropriate column types (not files) and prevent duplicate mappings
              if (columnType !== 'file' && columnType !== 'files') {
                if (columnTitle.includes('position') || columnTitle.includes('პოზიცია') || columnTitle === 'role' || columnTitle.includes('title') || columnTitle.includes('job') || columnTitle.includes('function')) {
                  if (!detectedMappings.position) {
                    detectedMappings.position = columnId;
                  }
                } else if (columnTitle.includes('department') || columnTitle.includes('განყოფილება') || columnTitle.includes('dept') || columnTitle.includes('division') || columnTitle.includes('team') || columnTitle.includes('group') || columnTitle.includes('unit') || columnTitle.includes('sector') || columnTitle.includes('branch')) {
                  if (!detectedMappings.department) {
                    detectedMappings.department = columnId;
                  }
                } else if (columnTitle.includes('manager') || columnTitle.includes('მენეჯერი') || columnTitle.includes('supervisor') || columnTitle.includes('boss') || columnTitle.includes('lead') || columnTitle.includes('reports to') || columnTitle.includes('superior') || columnTitle.includes('head') || columnTitle.includes('director') || columnTitle.includes('chief')) {
                  if (!detectedMappings.manager) {
                    detectedMappings.manager = columnId;
                  }
                } else if (columnTitle.includes('email') || columnTitle.includes('ელფოსტა') || columnTitle.includes('e-mail') || columnTitle.includes('mail') || columnTitle.includes('@')) {
                  if (!detectedMappings.email) {
                    detectedMappings.email = columnId;
                  }
                } else if (columnTitle.includes('phone') || columnTitle.includes('ტელეფონი') || columnTitle.includes('mobile') || columnTitle.includes('contact') || columnTitle.includes('tel') || columnTitle.includes('telephone') || columnTitle.includes('cell') || columnTitle.includes('number')) {
                  // Only map phone to text columns, not dropdown columns
                  if (!detectedMappings.phone && (columnType === 'text' || columnType === 'phone')) {
                    detectedMappings.phone = columnId;
                  }
                } else if (columnTitle.includes('location') || columnTitle.includes('ადგილმდებარეობა') || columnTitle.includes('office') || columnTitle.includes('city') || columnTitle.includes('address')) {
                  // If it's specifically address, map to address instead
                  if (columnTitle.includes('address') || columnTitle.includes('მისამართი')) {
                    if (!detectedMappings.address) {
                      detectedMappings.address = columnId;
                    }
                  } else {
                    if (!detectedMappings.location) {
                      detectedMappings.location = columnId;

                    }
                  }
                } else if ((columnTitle.includes('start') && columnTitle.includes('date')) || columnTitle.includes('hire date') || columnTitle.includes('join date') || columnTitle.includes('employment date')) {
                  if (!detectedMappings.startDate) {
                    detectedMappings.startDate = columnId;

                  }
                } else if (columnTitle.includes('salary') || columnTitle.includes('ხელფასი') || columnTitle.includes('pay') || columnTitle.includes('compensation') || columnTitle.includes('wage') || columnTitle.includes('income')) {
                  if (!detectedMappings.salary) {
                    detectedMappings.salary = columnId;

                  }
                } else if (columnTitle.includes('notes') || columnTitle.includes('შენიშვნები') || columnTitle.includes('comments') || columnTitle.includes('description') || columnTitle.includes('remarks')) {
                  if (!detectedMappings.notes) {
                    detectedMappings.notes = columnId;

                  }
                }
              }
              
              // Log if column was skipped (file type that's not image)
              if (columnType === 'file' || columnType === 'files') {
                if (!columnTitle.includes('image') && !columnTitle.includes('photo') && !columnTitle.includes('avatar') && !columnTitle.includes('სურათი') && !columnTitle.includes('picture') && !columnTitle.includes('pic')) {

                }
              }
            }
          });





          // Check for duplicate mappings
          const mappedColumns = Object.values(detectedMappings);
          const duplicates = mappedColumns.filter((item, index) => mappedColumns.indexOf(item) !== index);
          if (duplicates.length > 0) {

            Object.entries(detectedMappings).forEach(([field, columnId]) => {
              if (duplicates.includes(columnId)) {

              }
            });
          } else {

          }

          // Show current mappings before showing all columns

          Object.entries(detectedMappings).forEach(([field, columnId]) => {
            const columnInfo = sampleItem.column_values.find(col => col.id === columnId);

          });

          // Show all columns with detailed information

          sampleItem.column_values.forEach(col => {
            const isMapped = Object.values(detectedMappings).includes(col.id);
            const mappingKey = Object.keys(detectedMappings).find(key => detectedMappings[key] === col.id);

          });



          // Additional detection for any unmapped columns (exclude file columns)

          const availableColumns = sampleItem.column_values;

          // Get list of unmapped columns (text, dropdown, status, board_relation - but NOT files)
          const unmappedColumns = availableColumns.filter(col =>
            !Object.values(detectedMappings).includes(col.id) &&
            (col.type === 'text' || col.type === 'status' || col.type === 'dropdown' || col.type === 'board_relation') &&
            col.type !== 'file' && col.type !== 'files'
          );


          unmappedColumns.forEach(col => {

          });

          // Try to map unmapped columns to remaining employee fields
          const fieldsToMap = ['department', 'manager', 'phone', 'image'];
          let mappingIndex = 0;

          unmappedColumns.forEach(col => {
            if (mappingIndex < fieldsToMap.length) {
              const fieldName = fieldsToMap[mappingIndex];
              // Special handling for phone field - only map to text columns
              if (fieldName === 'phone' && (col.type === 'dropdown' || col.type === 'status')) {

                return; // Skip this column for phone mapping
              }
              if (!detectedMappings[fieldName]) {
                detectedMappings[fieldName] = col.id;

                mappingIndex++;
              }
            }
          });

          // If we still don't have mappings for key fields, try more aggressive matching
          if (!detectedMappings.department || !detectedMappings.manager || !detectedMappings.phone) {


            availableColumns.forEach(col => {
              const columnTitle = (col.column?.title || '').toLowerCase().trim();
              const columnId = col.id;

              // Check if this column is already mapped to prevent duplicates
              const existingMapping = Object.keys(detectedMappings).find(key => detectedMappings[key] === columnId);

              if (!existingMapping) {
                if (!detectedMappings.department && (columnTitle.includes('team') || columnTitle.includes('group') || columnTitle.includes('unit') || columnTitle.length <= 10)) {
                  detectedMappings.department = columnId;

                } else if (!detectedMappings.manager && (columnTitle.includes('report') || columnTitle.includes('superior') || columnTitle.includes('chief'))) {
                  detectedMappings.manager = columnId;

                } else if (!detectedMappings.phone && (columnTitle.includes('contact') || columnTitle.includes('cell') || columnTitle.includes('communication')) && (col.type === 'text' || col.type === 'phone')) {
                  detectedMappings.phone = columnId;

                }
              } else {

              }
            });
          }

          // Try to map more columns by looking at column IDs and types
          sampleItem.column_values.forEach(col => {
            const columnId = col.id;
            const columnText = (col.text || '').toLowerCase().trim();
            const columnType = col.type;

            // Additional mapping by column ID patterns
            // Check if this column is already mapped to prevent duplicates
            const existingMapping = Object.keys(detectedMappings).find(key => detectedMappings[key] === columnId);

            if (!existingMapping) {
              if (columnId.includes('text') && !detectedMappings.position) {
                // First available text column could be position
                detectedMappings.position = columnId;

              } else if (columnId.includes('text') && !detectedMappings.department) {
                // Available text column could be department
                detectedMappings.department = columnId;

              } else if (columnId.includes('text') && !detectedMappings.phone) {
                // Available text column could be phone
                detectedMappings.phone = columnId;

              }
            } else {

            }

            // Map by type if text contains common words
            // Check if this column is already mapped to prevent duplicates
            const existingMapping2 = Object.keys(detectedMappings).find(key => detectedMappings[key] === columnId);

            if (!existingMapping2) {
              if (columnType === 'text' && columnText.includes('pos') && !detectedMappings.position) {
                detectedMappings.position = columnId;

              } else if (columnType === 'text' && columnText.includes('dept') && !detectedMappings.department) {
                detectedMappings.department = columnId;

              } else if (columnType === 'text' && columnText.includes('phone') && !detectedMappings.phone) {
                detectedMappings.phone = columnId;

              }
            } else {

            }
          });



          // If still no mappings found, try common Monday.com column patterns
          if (Object.keys(detectedMappings).length <= 1) { // Only email or nothing


            const availableColumns = sampleItem.column_values;
            const textColumns = availableColumns.filter(col => col.type === 'text' && !col.id.includes('email'));

            // Assign text columns in order: position, department, phone, manager
            const fieldsToAssign = ['position', 'department', 'phone', 'manager'];
            textColumns.slice(0, 4).forEach((col, index) => {
              const field = fieldsToAssign[index];
              if (!detectedMappings[field]) {
                detectedMappings[field] = col.id;

              }
            });


          }

          // Map custom fields to Monday.com columns
          const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
          if (customFields.length > 0 && sampleItem) {

            customFields.forEach(customField => {
              // Try to find column by exact name match
              const matchingColumn = sampleItem.column_values.find(col => {
                const columnTitle = (col.column?.title || col.text || '').toLowerCase().trim();
                const fieldName = customField.name.toLowerCase().trim();
                return columnTitle === fieldName;
              });

              if (matchingColumn && !detectedMappings[customField.name]) {
                detectedMappings[customField.name] = matchingColumn.id;

              } else if (!matchingColumn) {

              }
            });
          }

          // Save column mappings to localStorage
          localStorage.setItem('columnMappings', JSON.stringify(detectedMappings));

          
          setColumnMappings(detectedMappings);
          
          // Auto-create custom fields for unmapped columns from Monday.com
          if (items.length > 0 && sampleItem && sampleItem.column_values) {
            const standardFields = ['name', 'position', 'department', 'email', 'phone', 'manager', 'image', 'location', 'startDate', 'salary', 'address', 'notes'];
            
            // Get existing custom fields
            const existingCustomFields = JSON.parse(localStorage.getItem('customFields') || '[]');
            const existingFieldNames = existingCustomFields.map(field => field.name.toLowerCase());
            
            // Map Monday column types to custom field types
            const mapMondayTypeToFieldType = (mondayType) => {
              const typeMap = {
                'text': 'text',
                'long_text': 'text',
                'email': 'email',
                'phone': 'phone',
                'numbers': 'number',
                'date': 'date',
                'dropdown': 'dropdown',
                'status': 'dropdown'
              };
              return typeMap[mondayType] || 'text';
            };
            
            // Find unmapped columns
            const unmappedColumns = sampleItem.column_values.filter(col => {
              // Skip if already mapped to a standard field
              const isMapped = Object.values(detectedMappings).includes(col.id);
              if (isMapped) return false;
              
              // Skip file columns (unless they're for images which are already mapped)
              if (col.type === 'file' || col.type === 'files') return false;
              
              // Skip people columns (unless they're for managers which are already mapped)
              if (col.type === 'people') return false;
              
              // Get column title
              const columnTitle = (col.column?.title || col.text || '').trim();
              if (!columnTitle) return false;
              
              // Skip if this field name already exists in custom fields
              if (existingFieldNames.includes(columnTitle.toLowerCase())) return false;
              
              return true;
            });
            
            // Create custom fields for unmapped columns
            const newCustomFields = [];
            unmappedColumns.forEach(col => {
              const columnTitle = (col.column?.title || col.text || '').trim();
              if (!columnTitle) return;
              
              // Skip if it's a standard field name
              const isStandardField = standardFields.some(field => 
                columnTitle.toLowerCase().includes(field.toLowerCase())
              );
              if (isStandardField) return;
              
              const fieldType = mapMondayTypeToFieldType(col.type);
              
              // Create custom field
              const newField = {
                id: Date.now() + Math.random(), // Unique ID
                name: columnTitle,
                type: fieldType,
                required: false,
                options: [] // For dropdown fields
              };
              
              newCustomFields.push(newField);
              
              // Add to column mappings
              detectedMappings[columnTitle] = col.id;
              
              console.log(`✨ Auto-created custom field: "${columnTitle}" (type: ${fieldType}, column ID: ${col.id})`);
            });
            
            // Save new custom fields to localStorage
            if (newCustomFields.length > 0) {
              const updatedCustomFields = [...existingCustomFields, ...newCustomFields];
              localStorage.setItem('customFields', JSON.stringify(updatedCustomFields));
              
              // Update column mappings
              localStorage.setItem('columnMappings', JSON.stringify(detectedMappings));
              setColumnMappings(detectedMappings);
              
              // Auto-update defaultFields and requiredFields to include new fields
              const savedDefaultFields = localStorage.getItem('defaultFields');
              const currentDefaultFields = savedDefaultFields ? JSON.parse(savedDefaultFields) : {
                name: true,
                position: true,
                department: true,
                email: true,
                phone: true,
                managerId: true
              };
              const savedRequiredFields = localStorage.getItem('requiredFields');
              const currentRequiredFields = savedRequiredFields ? JSON.parse(savedRequiredFields) : {
                name: true,
                position: true,
                department: true,
                email: true,
                phone: true,
                managerId: false
              };
              
              let updatedDefaultFields = { ...currentDefaultFields };
              let updatedRequiredFields = { ...currentRequiredFields };
              let hasChanges = false;
              
              newCustomFields.forEach(field => {
                if (!(field.name in updatedDefaultFields)) {
                  updatedDefaultFields[field.name] = true; // Default to enabled
                  updatedRequiredFields[field.name] = field.required || false;
                  hasChanges = true;
                  console.log(`✅ Auto-added new field "${field.name}" to defaultFields`);
                }
              });
              
              if (hasChanges) {
                localStorage.setItem('defaultFields', JSON.stringify(updatedDefaultFields));
                localStorage.setItem('requiredFields', JSON.stringify(updatedRequiredFields));
                console.log('✅ Auto-updated defaultFields and requiredFields with new custom fields');
              }
              
              console.log(`✅ Auto-created ${newCustomFields.length} custom field(s) from Monday.com columns`);
            }
          }
        }

        // Check if column_values exist in API response
        if (items.length > 0) {
          const firstItem = items[0];
          
          // Check if column_values is empty or null
          if (!firstItem.column_values || firstItem.column_values.length === 0) {
            
            
            
            
            
          }
        }

        // Helper functions for enhanced text matching and value extraction
        const normalizeText = (text) => {
          return text
            .toLowerCase()
            .trim()
            // Remove special characters and punctuation, but keep some meaningful ones
            .replace(/[^\w\s\u10D0-\u10FF\-_]/g, ' ') // Keep Georgian, hyphens, underscores
            // Normalize multiple spaces
            .replace(/\s+/g, ' ')
            // Remove common prefixes/suffixes that don't affect meaning
            .replace(/^(the|a|an)\s+/i, '')
            .replace(/\s+(column|field|value|data)$/i, '')
            // Normalize common abbreviations
            .replace(/\bdept\b/g, 'department')
            .replace(/\bpos\b/g, 'position')
            .replace(/\bmgmt\b/g, 'management')
            .replace(/\bmg\b/g, 'manager')
            .replace(/\bsup\b/g, 'supervisor')
            .trim();
        };

        // Enhanced value extraction from monday.com column
        const extractColumnValue = (column) => {
          if (!column) return null;

          // Special handling for email columns - extract only email address
          if (column.type === 'email' || column.id?.includes('email')) {
            if (column.value) {
              try {
                const parsed = JSON.parse(column.value);
                if (parsed && typeof parsed === 'object') {
                  // Email columns have structure: {"email": "email@example.com", "text": "Name - email@example.com"}
                  // Extract only the email address, not the display text
                  if (parsed.email) {
                    return parsed.email.trim();
                  }
                  // Fallback: try to extract email from text if it contains email pattern
                  if (parsed.text) {
                    const emailMatch = parsed.text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
                    if (emailMatch) {
                      return emailMatch[0];
                    }
                    return parsed.text.trim();
                  }
                }
              } catch (e) {
              // If not JSON, try to extract email from string
              const emailMatch = String(column.value).match(/[\w\.-]+@[\w\.-]+\.\w+/);
              if (emailMatch) {
                return emailMatch[0];
              }
            }
            }
            // If text contains email pattern, extract it
            if (column.text) {
              const emailMatch = column.text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
              if (emailMatch) {
                return emailMatch[0];
              }
            }
          }

          // Debug logging for column extraction
          // 

          // Priority 1: Use text field (most common for display values)
          if (column.text && column.text.trim()) {
            // For some column types, text might be the column header, not the value
            // Check if text looks like a column header (contains common header words)
            const textLower = column.text.toLowerCase();
            const headerIndicators = ['column', 'field', 'name', 'title', 'header'];

            // If text contains header indicators or is very short, it might be a header
            if (headerIndicators.some(indicator => textLower.includes(indicator)) || textLower.length < 3) {
              // Try to get value from value field instead
              if (column.value) {
                try {
                  const parsed = JSON.parse(column.value);
                  // Different column types have different value structures
                  if (typeof parsed === 'string') {
                    return parsed.trim();
                  } else if (parsed && typeof parsed === 'object') {
                    // Try common value structures
                    return parsed.text || parsed.value || parsed.name || parsed.label || parsed.title || null;
                  }
                } catch (e) {
                  // If not JSON, use value directly
                  return String(column.value).trim();
                }
              }
            } else {
              // Text seems to be the actual value
              return column.text.trim();
            }
          }

          // Priority 2: Try value field
          if (column.value) {
            try {
              const parsed = JSON.parse(column.value);
              if (typeof parsed === 'string') {
                return parsed.trim();
              } else if (parsed && typeof parsed === 'object') {
                // Handle different monday.com column types
                switch (column.type) {
                  case 'text':
                  case 'long_text':
                    return parsed.text || parsed.value;
                  case 'status':
                    return parsed.text || parsed.label || parsed.index;
                  case 'dropdown':
                  case 'multiple_dropdown':
                    return parsed.text || parsed.label;
                  case 'people':
                    return parsed.text; // People columns usually have text as display name
                  case 'date':
                    return parsed.text || parsed.date;
                  case 'numbers':
                  case 'rating':
                    return parsed.text || parsed.number || parsed.value;
                  case 'files':
                  case 'file':
                    // Handle file columns - return the first file URL if available
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      const firstFile = parsed[0];
                      return firstFile.url || firstFile.file || firstFile.public_url || null;
                    }
                    return null;
                  default:
                    return parsed.text || parsed.value || parsed.label;
                }
              }
            } catch (e) {
              // If not JSON, return as string
              return String(column.value).trim();
            }
          }

          // Priority 3: Fallback to text even if it looks like a header
          if (column.text && column.text.trim()) {
            return column.text.trim();
          }

          return null;
        };

        const checkFuzzyMatch = (text1, text2) => {
          // Common variations and synonyms - expanded
          const variations = {
            // English variations
            'position': ['job', 'role', 'title', 'post', 'occupation', 'function', 'designation', 'capacity', 'status'],
            'department': ['dept', 'division', 'group', 'unit', 'section', 'branch', 'area', 'sector', 'team', 'office'],
            'manager': ['supervisor', 'boss', 'lead', 'head', 'director', 'superior', 'chief', 'executive', 'coordinator', 'administrator'],
            'name': ['full name', 'employee name', 'person', 'contact', 'full_name', 'employee_name', 'person_name'],
            'email': ['e-mail', 'mail', 'contact email', 'email address', 'e_mail', 'email_addr'],
            'phone': ['telephone', 'mobile', 'cell', 'contact number', 'tel', 'contact_phone', 'phone_number'],
            'location': ['office', 'address', 'city', 'place', 'site', 'workplace', 'work_location'],
            'salary': ['pay', 'compensation', 'wage', 'income', 'remuneration', 'pay_rate', 'hourly_rate'],

            // Georgian variations - expanded
            'პოზიცია': ['თანამდებობა', 'სამუშაო', 'როლი', 'დასახელება', 'ამოცანა', 'წოდება', 'დონე'],
            'განყოფილება': ['დეპარტამენტი', 'დეპტ', 'დივიზია', 'ჯგუფი', 'სექცია', 'სამსახური', 'გუნდი', 'ფილიალი'],
            'მენეჯერი': ['ხელმძღვანელი', 'ბოსი', 'უფროსი', 'დირექტორი', 'სუპერვაიზერი', 'ლიდერი', 'გუნდის ლიდერი'],
            'სახელი': ['სრული სახელი', 'თანამშრომელი', 'პიროვნება', 'სახელწოდება', 'დასახელება'],
            'ელფოსტა': ['ელექტრონული ფოსტა', 'ელ-ფოსტა', 'მეილი', 'საკონტაქტო ელფოსტა'],
            'ტელეფონი': ['მობილური', 'საკონტაქტო ნომერი', 'ტელ', 'სამუშაო ტელეფონი'],
            'მდებარეობა': ['ოფისი', 'მისამართი', 'ქალაქი', 'ადგილი', 'სამუშაო ადგილი'],
            'ხელფასი': ['ანაზღაურება', 'შემოსავალი', 'ზღვა', 'თვიური ხელფასი']
          };

          // Check if text1 matches any variation of text2
          for (const [key, synonyms] of Object.entries(variations)) {
            if ((text1 === key && synonyms.includes(text2)) ||
                (text2 === key && synonyms.includes(text1))) {
              return true;
            }
          }

          // Check for partial matches with variations
          for (const [key, synonyms] of Object.entries(variations)) {
            if (text1.includes(key)) {
              if (synonyms.some(syn => text2.includes(syn))) {
                return true;
              }
            }
            if (text2.includes(key)) {
              if (synonyms.some(syn => text1.includes(syn))) {
                return true;
              }
            }
          }

          // Additional fuzzy matching strategies
          const words1 = text1.split(/\s+/);
          const words2 = text2.split(/\s+/);

          // Check if significant words overlap
          const significantWords1 = words1.filter(word => word.length > 2);
          const significantWords2 = words2.filter(word => word.length > 2);

          const commonWords = significantWords1.filter(word1 =>
            significantWords2.some(word2 =>
              word1.includes(word2) || word2.includes(word1) ||
              (word1.length > 3 && word2.length > 3 &&
               (word1.substring(0, 3) === word2.substring(0, 3)))
            )
          );

          if (commonWords.length > 0) {
            return true;
          }

          // Check for common abbreviations
          const abbreviations = {
            'pos': 'position',
            'dept': 'department',
            'mgr': 'manager',
            'sup': 'supervisor',
            'dir': 'director',
            'coord': 'coordinator',
            'admin': 'administrator',
            'rep': 'representative',
            'spec': 'specialist',
            'eng': 'engineer',
            'dev': 'developer'
          };

          for (const [abbr, full] of Object.entries(abbreviations)) {
            if ((text1.includes(abbr) && text2.includes(full)) ||
                (text1.includes(full) && text2.includes(abbr))) {
              return true;
            }
          }

          return false;
        };

        // Helper function to find column by ID and title (enhanced)
        const findColumn = (item, possibleIds, possibleTitles, excludeColumns = []) => {
          // Safety check: ensure item and column_values exist
          if (!item || !item.column_values || !Array.isArray(item.column_values)) {
            return null;
          }

          // const debugEmployees = ['Lazarei', 'Givi', 'Gujia'];
          // if (debugEmployees.includes(item.name)) {
          //   
          // }

          let foundColumn = null;

          for (const col of item.column_values) {
            if (!col) continue;

            // Skip already used columns
            if (excludeColumns.some(excluded => excluded.id === col.id)) {
              // if (debugEmployees.includes(item.name)) {
              //   
              // }
              continue;
            }

            const columnId = (col.id || '').toLowerCase();
            const columnText = (col.text || '').toLowerCase().trim();

            // Priority 1: Check by ID (exact match) - only for specific, non-generic IDs
            const specificIds = possibleIds.filter(id => !id.includes('text') && id !== 'numbers' && id !== 'date' && id !== 'status');
            if (specificIds.some(id => columnId === id.toLowerCase())) {
              foundColumn = col;
              break;
            }

            // Priority 2: Enhanced title/text matching with multiple strategies
            const matchesTitle = possibleTitles.some(title => {
              const titleLower = title.toLowerCase();
              const titleNormalized = normalizeText(titleLower);
              const columnNormalized = normalizeText(columnText);

              // Strategy 1: Exact match (after normalization)
              if (columnNormalized === titleNormalized) {
                return true;
              }

              // Strategy 2: Contains match (both directions)
              if (columnNormalized.includes(titleNormalized) || titleNormalized.includes(columnNormalized)) {
                // Avoid matches that are too short or generic
                if (titleNormalized.length >= 2 && columnNormalized.length >= 2) {
                  return true;
                }
              }

              // Strategy 3: Word-based matching
              const titleWords = titleNormalized.split(/\s+/).filter(word => word.length > 1);
              const columnWords = columnNormalized.split(/\s+/).filter(word => word.length > 1);

              // Check if any significant words match
              const hasWordMatch = titleWords.some(titleWord =>
                columnWords.some(columnWord => {
                  // Exact word match
                  if (columnWord === titleWord) return true;
                  // Partial word match (at least 4 characters)
                  if (titleWord.length >= 4 && columnWord.length >= 4) {
                    return columnWord.includes(titleWord) || titleWord.includes(columnWord);
                  }
                  return false;
                })
              );

              if (hasWordMatch) {
                return true;
              }

              // Strategy 4: Fuzzy matching for common variations
              const fuzzyMatches = checkFuzzyMatch(columnNormalized, titleNormalized);
              if (fuzzyMatches) {
                return true;
              }

              return false;
            });

            if (matchesTitle) {
              foundColumn = col;
              break;
            }

            // Priority 4: Check by ID (contains) - only for meaningful IDs
            const meaningfulIds = possibleIds.filter(id =>
              !['text', 'numbers', 'date', 'status'].includes(id) &&
              !id.match(/^text\d+$/) &&
              !id.match(/^numbers\d+$/) &&
              !id.match(/^date\d+$/)
            );
            if (meaningfulIds.some(id => columnId.includes(id.toLowerCase()))) {
              foundColumn = col;
              break;
            }
          }


          // if (debugEmployees.includes(item.name) && foundColumn) {
          //   
          // }
          return foundColumn;
        };

        // Convert Monday.com items to employees format
        // First pass: create employees without manager relationships
        const mondayEmployees = items.map((item, index) => {
          // Safety check: skip items without column_values
          if (!item || !item.column_values || !Array.isArray(item.column_values)) {
            
            return null;
          }
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


          // Track used columns to avoid duplicates
          const usedColumns = [];

          // First, try to find position column by common patterns in IDs and titles
          // if (['Lazarei', 'Givi', 'Gujia'].includes(item.name)) {
          //   
          // }
          // Position column detection - prioritize by type and content
          let positionColumn = null;

          // Strategy 1: Look for text columns with position-like content
            const textColumns = item.column_values.filter(col =>
            (col.type === 'text' || !col.type) &&
              !usedColumns.some(excluded => excluded.id === col.id)
            );

            for (const col of textColumns) {
              const extractedVal = extractColumnValue(col);
              if (extractedVal) {
                const val = extractedVal.toLowerCase();

                // Skip email-like values from position detection
                if (val.includes('@') || /^\+?[\d\s\-\(\)]+$/.test(val)) {
                  continue;
                }

                // Check if the value looks like a position title
                const positionIndicators = ['ceo', 'cto', 'cfo', 'coo', 'vp', 'director', 'manager', 'supervisor', 'lead', 'head', 'chief', 'executive', 'president', 'officer', 'specialist', 'analyst', 'engineer', 'developer', 'consultant', 'coordinator', 'administrator', 'representative', 'associate', 'senior', 'junior', 'intern'];

                const hasPositionIndicator = positionIndicators.some(indicator => val.includes(indicator));

                // Additional check: must look like a job title
                const looksLikeJobTitle = val.split(' ').length > 1 || positionIndicators.some(indicator => val.toLowerCase() === indicator);

                if (hasPositionIndicator && looksLikeJobTitle) {
                  positionColumn = col;
                  break;
                }
              }
            }

          // Strategy 2: If no text column found, try findColumn with keywords
          if (!positionColumn) {
            positionColumn = findColumn(item,
              ['position', 'role', 'job_title', 'title', 'job'],
              ['position', 'role', 'job title', 'title', 'job'],
              usedColumns
            );
                  }


          // Final comprehensive fallback for position
          if (!positionColumn) {

            // Analyze all available columns for position-like content
            const allAvailableColumns = item.column_values.filter(col =>
              !usedColumns.some(excluded => excluded.id === col.id)
            );

            // 
            for (const col of allAvailableColumns) {
              const extractedVal = extractColumnValue(col);
              // 
              if (extractedVal) {
                const val = extractedVal.toLowerCase().trim();
                // 

                // Skip if it looks like an email, phone, or very long text
                const shouldSkip = val.includes('@') || /^\+?[\d\s\-\(\)]+$/.test(val) || val.length > 50;
                // 
                if (shouldSkip) {
                  continue; // Likely email, phone, or long text
                }

                // Skip if it looks like a person name (common names or capitalized single words)
                const commonNames = ['david', 'john', 'mike', 'anna', 'maria', 'alex', 'james', 'lisa', 'paul', 'mark', 'sarah', 'daniel', 'jane', 'peter', 'mary', 'robert', 'linda', 'william', 'patricia', 'richard', 'susan', 'joseph', 'jennifer', 'thomas', 'barbara', 'charles', 'elizabeth', 'christopher', 'jessica', 'matthew', 'nancy', 'anthony', 'donna', 'steven', 'michelle', 'andrew', 'laura', 'joshua', 'amy', 'kevin', 'angela', 'brian', 'helen', 'george', 'sandra', 'timothy', 'donna', 'ronald', 'carol', 'jason', 'ruth', 'edward', 'sharon', 'jacob', 'michelle', 'gary', 'karen', 'nicholas', 'betty', 'eric', 'lisa', 'jonathan', 'kimberly', 'stephen', 'deborah', 'larry', 'dorothy', 'justin', 'helen', 'scott', 'anna', 'brandon', 'melissa', 'benjamin', 'emma', 'samuel', 'olivia', 'gregory', 'jessica', 'frank', 'ashley', 'raymond', 'kathleen', 'alexander', 'martha', 'patrick', 'sandra', 'jack', 'stephanie'];
                const looksLikeName = val.length > 2 && val.length < 20 && val.split(' ').length === 1 &&
                                     (commonNames.some(name => val.includes(name)) || /^[A-Z]/.test(val.charAt(0)));

                if (looksLikeName) {
                  continue; // Likely a person name
                }

                // If it's a reasonable length and contains position-like words
                if (val.length > 1 && val.length < 100) {
                  const positionWords = ['ceo', 'vp', 'manager', 'director', 'lead', 'developer', 'engineer', 'specialist', 'analyst', 'consultant', 'coordinator', 'executive', 'senior', 'junior', 'intern', 'პოზიცია', 'მენეჯერი', 'დირექტორი', 'ლიდერი'];
                  const departmentWords = ['engineering', 'marketing', 'sales', 'hr', 'finance', 'operations', 'it', 'tech', 'design', 'product', 'support', 'admin', 'legal', 'research', 'quality', 'customer', 'business', 'development', 'human resources', 'customer success', 'product management', 'quality assurance', 'business development', 'განყოფილება', 'დეპარტამენტი', 'ტექნოლოგიები', 'მარკეტინგი', 'გაყიდვები', 'ფინანსები', 'ოპერაციები'];

                  const hasPositionWord = positionWords.some(word => val.includes(word));
                  const hasDepartmentWord = departmentWords.some(word => val.includes(word));

                  // 

                  // Only assign as position if it has position words AND doesn't have department words
                  // This prevents department names like "Design" from being assigned as positions
                  if (hasPositionWord && !hasDepartmentWord) {
                    positionColumn = col;
                    // 
                    break;
                  }
                  // For very short values without department words, still consider as potential position
                  else if (!hasDepartmentWord && val.length < 20 && val.split(' ').length <= 2) {
                    positionColumn = col;
                    // 
                    break;
                  }
                }
              }
            }
          }

          if (positionColumn) usedColumns.push(positionColumn);


          // Debug: Show all columns and their detection status




          const emailColumn = findColumn(item,
            // IDs - comprehensive
            ['email', 'email_address', 'e_mail', 'emailaddress', 'contact_email', 'work_email', 'personal_email', 'mail'],
            // Titles - comprehensive
            ['email', 'email address', 'e-mail', 'email address', 'contact email', 'work email', 'personal email', 'mail', 'ელ-ფოსტა', 'ელექტრონული ფოსტა', 'ელფოსტა', 'საკონტაქტო ელფოსტა', 'სამუშაო ელფოსტა', 'პირადი ელფოსტა'],
            usedColumns
          );
          if (emailColumn) usedColumns.push(emailColumn);

          const phoneColumn = findColumn(item,
            // IDs - comprehensive
            ['phone', 'mobile', 'telephone', 'cell', 'phone_number', 'mobile_number', 'telephone_number', 'cell_number', 'contact_phone', 'work_phone', 'office_phone', 'home_phone'],
            // Titles - comprehensive
            ['phone', 'mobile', 'telephone', 'cell', 'phone number', 'mobile number', 'telephone number', 'cell number', 'contact phone', 'work phone', 'office phone', 'home phone', 'ტელეფონი', 'მობილური', 'ტელ', 'ტელეფონის ნომერი', 'მობილურის ნომერი', 'საკონტაქტო ტელეფონი', 'სამუშაო ტელეფონი', 'ოფისის ტელეფონი'],
            usedColumns
          );
          if (phoneColumn) usedColumns.push(phoneColumn);

          let managerColumn = findColumn(item,
            // IDs - comprehensive
            ['manager', 'reports_to', 'supervisor', 'boss', 'lead', 'superior', 'direct_manager', 'reporting_manager', 'manager_name', 'supervisor_name', 'boss_name', 'lead_name', 'reporting_to', 'reports_to_manager', 'line_manager', 'direct_supervisor', 'team_lead', 'project_manager'],
            // Titles - comprehensive with variations
            ['manager', 'reports to', 'supervisor', 'boss', 'lead', 'superior', 'direct manager', 'reporting manager', 'line manager', 'direct supervisor', 'team lead', 'project manager', 'reporting to', 'reports to manager', 'manager name', 'supervisor name', 'boss name', 'მენეჯერი', 'ხელმძღვანელი', 'ბოსი', 'უფროსი', 'დირექტორი', 'სუპერვაიზერი', 'ლიდერი', 'გუნდის ლიდერი', 'პროექტის მენეჯერი', 'ხელმძღვანელის სახელი'],
            usedColumns
          );

          // If not found, try to find any text/people column that might contain manager data
          if (!managerColumn) {
            managerColumn = item.column_values.find(col => {
              if (!col || usedColumns.some(excluded => excluded.id === col.id)) return false;

              const colText = (col.text || '').toLowerCase();
              const colId = (col.id || '').toLowerCase();

              // Look for text/people columns with manager-related keywords
              if (col.type === 'text' || col.type === 'people' || !col.type) {
                const managerKeywords = ['manag', 'superv', 'boss', 'lead', 'report', 'მენეჯ', 'ხელმძ', 'უფროს', 'ბოს', 'ლიდერ'];
                return managerKeywords.some(keyword =>
                  colId.includes(keyword) || colText.includes(keyword)
                );
              }
              return false;
            });

            if (managerColumn) {
            }
          }

          // Ultimate fallback: if still not found, look for any text/people column that might be manager
          if (!managerColumn) {
            // For now, just look for columns with manager-related content patterns
            const candidateColumns = item.column_values.filter(col =>
              (col.type === 'text' || col.type === 'people' || !col.type) &&
              !usedColumns.some(excluded => excluded.id === col.id)
            );

            for (const col of candidateColumns) {
              const extractedVal = extractColumnValue(col);
              if (extractedVal && extractedVal.trim()) {
                const val = extractedVal.toLowerCase();
                // Look for patterns that suggest this might be a manager name
                // (We'll validate this in the second pass)
                const managerPatterns = ['manager', 'director', 'lead', 'supervisor', 'boss', 'head', 'chief', 'მენეჯერი', 'ხელმძღვანელი', 'დირექტორი', 'უფროსი', 'ბოსი'];

                if (managerPatterns.some(pattern => val.includes(pattern)) ||
                    val.length > 3) { // Any reasonable-length text could be a manager name
                  managerColumn = col;
                  break;
                }
              }
            }
          }

          if (managerColumn) usedColumns.push(managerColumn);

          // Extract additional common columns
          let departmentColumn = null;

          // Strategy 1: Look for dropdown columns with department-like content
          const deptDropdownColumns = item.column_values.filter(col =>
            col.type === 'dropdown' &&
            !usedColumns.some(excluded => excluded.id === col.id)
          );

          for (const col of deptDropdownColumns) {
            const extractedVal = extractColumnValue(col);
            if (extractedVal) {
              const val = extractedVal.toLowerCase();
              // Check if the value looks like a department name
              const deptIndicators = ['engineering', 'marketing', 'sales', 'hr', 'finance', 'operations', 'it', 'tech', 'design', 'product', 'support', 'admin', 'legal', 'research', 'quality', 'customer', 'business', 'development', 'management', 'human resources', 'customer success', 'product management', 'quality assurance', 'business development', 'განყოფილება', 'დეპარტამენტი', 'ტექნოლოგიები', 'მარკეტინგი', 'გაყიდვები', 'ადამიანური', 'რესურსები', 'ფინანსები', 'ოპერაციები', 'დიზაინი', 'პროდუქტი', 'მხარდაჭერა'];

              if (deptIndicators.some(indicator => val.includes(indicator))) {
                departmentColumn = col;
                break;
              }
            }
          }

          // Strategy 2: If no dropdown column found, try findColumn with keywords
          if (!departmentColumn) {
            departmentColumn = findColumn(item,
              ['department', 'dept', 'division', 'group'],
              ['department', 'dept', 'division', 'group'],
              usedColumns
            );
          }

          // Ultimate fallback: if still not found, look for any text/dropdown column that might be department
          if (!departmentColumn) {
            const candidateColumns = item.column_values.filter(col =>
              (col.type === 'text' || col.type === 'dropdown' || !col.type) &&
              !usedColumns.some(excluded => excluded.id === col.id)
            );

            // Strategy 1: Look for common department values in the column data
            for (const col of candidateColumns) {
              const extractedVal = extractColumnValue(col);
              if (extractedVal) {
                const val = extractedVal.toLowerCase();

                // Skip email-like, phone-like, or very long values
                if (val.includes('@') || /^\+?[\d\s\-\(\)]+$/.test(val) || val.length > 50) {
                  continue;
                }

                // Check if the value looks like a department name
                const deptIndicators = ['engineering', 'marketing', 'sales', 'hr', 'finance', 'operations', 'it', 'tech', 'design', 'product', 'support', 'admin', 'legal', 'research', 'quality', 'customer', 'business', 'development', 'management', 'human resources', 'customer success', 'product management', 'quality assurance', 'business development', 'განყოფილება', 'დეპარტამენტი', 'ტექნოლოგიები', 'მარკეტინგი', 'გაყიდვები', 'ადამიანური', 'რესურსები', 'ფინანსები', 'ოპერაციები', 'დიზაინი', 'პროდუქტი', 'მხარდაჭერა'];

                // Exclude position-like words
                const positionWords = ['ceo', 'vp', 'manager', 'director', 'lead', 'developer', 'engineer', 'specialist', 'analyst', 'consultant', 'coordinator', 'executive', 'senior', 'junior', 'intern', 'პოზიცია', 'მენეჯერი', 'დირექტორი', 'ლიდერი'];

                const hasDeptWord = deptIndicators.some(indicator => val.includes(indicator));
                const hasPositionWord = positionWords.some(word => val.includes(word));

                // Don't assign as department if it has position words or looks like a name
                const looksLikeName = val.length > 3 && val.length < 20 && /^[A-Z][a-z]+$/.test(val.charAt(0).toUpperCase() + val.slice(1)) && val.split(' ').length === 1;

                if (hasDeptWord && !hasPositionWord && !looksLikeName) {
                  departmentColumn = col;
                  break;
                }
              }
            }

            // Strategy 2: Position-based guessing - department is often after position
            if (!departmentColumn && candidateColumns.length >= 4) {
              // Department might be the 4th, 5th, or 6th column
              const likelyPositions = [3, 4, 5]; // 0-indexed
              for (const pos of likelyPositions) {
                if (pos < candidateColumns.length) {
                  const candidateCol = candidateColumns[pos];
                  const extractedVal = extractColumnValue(candidateCol);
                  if (extractedVal && extractedVal.length > 0 && extractedVal.length < 100) {
                    departmentColumn = candidateCol;
                    break;
                  }
                }
              }
            }
          }

          // Final comprehensive fallback for department
          if (!departmentColumn) {

            const allAvailableColumns = item.column_values.filter(col =>
              !usedColumns.some(excluded => excluded.id === col.id)
            );

            for (const col of allAvailableColumns) {
              const extractedVal = extractColumnValue(col);
              if (extractedVal) {
                const val = extractedVal.toLowerCase().trim();

                // Skip if it looks like an email, phone, or very long text
                if (val.includes('@') || /^\+?[\d\s\-\(\)]+$/.test(val) || val.length > 50) {
                  continue;
                }

                // Check for department-like content
                if (val.length > 1 && val.length < 50) {
                  const deptWords = ['engineering', 'marketing', 'sales', 'finance', 'operations', 'hr', 'human', 'resources', 'it', 'tech', 'design', 'product', 'support', 'admin', 'legal', 'research', 'quality', 'customer', 'business', 'development', 'განყოფილება', 'დეპარტამენტი', 'ტექნოლოგიები', 'მარკეტინგი', 'გაყიდვები', 'ფინანსები', 'ოპერაციები'];
                  const positionWords = ['ceo', 'vp', 'manager', 'director', 'lead', 'developer', 'engineer', 'specialist', 'analyst', 'consultant', 'coordinator', 'executive', 'senior', 'junior', 'intern', 'პოზიცია', 'მენეჯერი', 'დირექტორი', 'ლიდერი'];

                  const hasDeptWord = deptWords.some(word => val.includes(word));
                  const hasPositionWord = positionWords.some(word => val.includes(word));

                  // Additional check: exclude values that look like names (capitalized single words or common names)
                  const looksLikeName = val.length > 2 && val.length < 20 && val.split(' ').length === 1 &&
                                       /^[A-Z]/.test(val.charAt(0)) && !hasDeptWord;

                  // Only assign as department if it has department words AND doesn't have position words AND doesn't look like a name
                  if (hasDeptWord && !hasPositionWord && !looksLikeName) {
                    departmentColumn = col;
                    // 
                    break;
                  }
                  // For single words that look like department names (but not positions or names)
                  if (!hasPositionWord && val.length > 3 && val.length < 30 && !val.includes(' ') && !looksLikeName) {
                    // Additional check: avoid common name-like words
                    const commonNames = ['david', 'john', 'mike', 'anna', 'maria', 'alex', 'james', 'lisa', 'paul', 'mark', 'sarah', 'daniel', 'jane', 'peter', 'mary', 'robert', 'linda', 'william', 'patricia', 'richard', 'susan', 'joseph', 'jennifer', 'thomas', 'barbara', 'charles', 'elizabeth', 'christopher', 'jessica', 'matthew', 'nancy', 'anthony', 'donna', 'steven', 'michelle', 'andrew', 'laura', 'joshua', 'amy', 'kevin', 'angela', 'brian', 'helen', 'george', 'sandra', 'timothy', 'donna', 'ronald', 'carol', 'jason', 'ruth', 'edward', 'sharon', 'jacob', 'michelle', 'gary', 'karen', 'nicholas', 'betty', 'eric', 'lisa', 'jonathan', 'kimberly', 'stephen', 'deborah', 'larry', 'dorothy', 'justin', 'helen', 'scott', 'anna', 'brandon', 'melissa', 'benjamin', 'emma', 'samuel', 'olivia', 'gregory', 'jessica', 'frank', 'ashley', 'raymond', 'kathleen', 'alexander', 'martha', 'patrick', 'sandra', 'jack', 'stephanie'];
                    if (!commonNames.some(name => val.toLowerCase().includes(name.toLowerCase()))) {
                      departmentColumn = col;
                      // 
                      break;
                    }
                  }
                }
              }
            }
          }

          if (departmentColumn) usedColumns.push(departmentColumn);



          const locationColumn = findColumn(item,
            // IDs
            ['location', 'office', 'city', 'address', 'place'],
            // Titles
            ['location', 'office', 'city', 'address', 'place', 'მდებარეობა', 'ოფისი', 'ქალაქი', 'ადგილი'],
            usedColumns
          );
          if (locationColumn) usedColumns.push(locationColumn);

          const startDateColumn = findColumn(item,
            // IDs
            ['start_date', 'hire_date', 'joined_date', 'employment_date', 'join_date'],
            // Titles
            ['start date', 'hire date', 'joined date', 'employment date', 'join date', 'დაწყების თარიღი', 'დასაქმების თარიღი', 'თარიღი'],
            usedColumns
          );
          if (startDateColumn) usedColumns.push(startDateColumn);

          const salaryColumn = findColumn(item,
            // IDs
            ['salary', 'compensation', 'pay', 'wage', 'income'],
            // Titles
            ['salary', 'compensation', 'pay', 'wage', 'income', 'ხელფასი', 'ანაზღაურება'],
            usedColumns
          );
          if (salaryColumn) usedColumns.push(salaryColumn);

          const addressColumn = findColumn(item,
            // IDs
            ['address', 'home_address', 'street_address'],
            // Titles
            ['address', 'home address', 'street address', 'მისამართი', 'სახლი'],
            usedColumns
          );
          if (addressColumn) usedColumns.push(addressColumn);

          const notesColumn = findColumn(item,
            // IDs
            ['notes', 'comments', 'description', 'remarks', 'additional_info'],
            // Titles
            ['notes', 'comments', 'description', 'remarks', 'additional info', 'შენიშვნები', 'კომენტარები', 'აღწერა'],
            usedColumns
          );
          if (notesColumn) usedColumns.push(notesColumn);

          // Extract numeric columns - enhanced search by ID and title
          const numberColumns = item.column_values.filter(col => {
            if (!col) return false;

            const columnId = (col.id || '').toLowerCase();
            const columnText = (col.text || '').toLowerCase();

            // Check by type
            if (col.type === 'numbers' || col.type === 'rating' || col.type === 'progress') {
              return true;
            }

            // Check by ID
            const numericIds = ['salary', 'compensation', 'pay', 'wage', 'income', 'experience', 'years', 'age', 'rating', 'score', 'numbers', 'numbers0', 'numbers1', 'numbers2', 'numbers3'];
            if (numericIds.some(id => columnId.includes(id))) {
              return true;
            }

            // Check by title
            const numericTitles = ['salary', 'pay', 'compensation', 'experience', 'years', 'age', 'rating', 'score', 'ხელფასი', 'გამოცდილება', 'წლები', 'ასაკი', 'რეიტინგი'];
            return numericTitles.some(title => columnText.includes(title));
          });

          // Extract date columns - enhanced search by ID and title
          const dateColumns = item.column_values.filter(col => {
            if (!col) return false;

            const columnId = (col.id || '').toLowerCase();
            const columnText = (col.text || '').toLowerCase();

            // Check by type
            if (col.type === 'date') {
              return true;
            }

            // Check by ID
            const dateIds = ['start_date', 'hire_date', 'joined_date', 'employment_date', 'join_date', 'birth_date', 'birthday', 'date', 'date0', 'date1', 'date2', 'date3', 'date4'];
            if (dateIds.some(id => columnId.includes(id))) {
              return true;
            }

            // Check by title
            const dateTitles = ['date', 'start', 'hire', 'join', 'birth', 'birthday', 'თარიღი', 'დაბადების', 'დაწყება', 'დასაქმება'];
            return dateTitles.some(title => columnText.includes(title));
          });

          // Extract dropdown/status columns - enhanced search by ID and title
          const dropdownColumns = item.column_values.filter(col => {
            if (!col) return false;

            const columnId = (col.id || '').toLowerCase();
            const columnText = (col.text || '').toLowerCase();

            // Skip columns we've already handled
            if (columnId === 'position' || columnId === 'department' || (columnId.includes('text') && ['პოზიცია', 'განყოფილება'].some(title => columnText.includes(title)))) return false;

            // Check by type
            if (col.type === 'dropdown' || col.type === 'status') {
              return true;
            }

            // Check by ID
            const statusIds = ['status', 'state', 'type', 'category', 'level', 'priority', 'employment_type', 'contract_type', 'status0', 'status1', 'status2'];
            if (statusIds.some(id => columnId.includes(id))) {
              return true;
            }

            // Check by title
            const statusTitles = ['status', 'state', 'type', 'category', 'level', 'priority', 'სტატუსი', 'ტიპი', 'კატეგორია', 'დონე', 'ხელშეკრულება'];
            return statusTitles.some(title => columnText.includes(title));
          });
          
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

          // Build full name - prioritize Item name (monday.com item title), then Person column, then other columns
          let fullName = item.name; // Primary source: Item name (monday.com item title)

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

          // Priority order: Item name (primary) > Person column text > First Name column > Person data

          // Primary: Item name (monday.com item title) - this is what user wants
          if (item.name && item.name.trim()) {
            fullName = item.name.trim();
          }
          // Fallback 1: Person column text field (contains real person name)
          else if (personNameFromText && personNameFromText.trim()) {
            fullName = personNameFromText.trim();
          }
          // Fallback 2: First Name column (what user wants)
          else if (firstNameValue && firstNameValue.trim()) {
            const firstName = firstNameValue.trim();
            const lastName = lastNameValue ? lastNameValue.trim() : '';
            fullName = lastName ? `${firstName} ${lastName}` : firstName;
          }
          // Fallback 3: Person data from Person column value (JSON)
          else if (personData && personData.first_name) {
            const firstName = personData.first_name;
            const lastName = personData.last_name || '';
            fullName = `${firstName} ${lastName}`.trim();
          }

          // Generate manager ID from manager column if available
          // We'll set this in the second pass after all employees are created
          let managerId = null;

          // Extract position - prioritize positionColumn, then statusColumn, then default
          let positionValue = 'Employee';
          const extractedPosition = positionColumn ? extractColumnValue(positionColumn) : null;
          // Debug: log position detection
          // if (['Lazarei', 'Givi', 'Gujia'].includes(item.name)) {
          //   
          // }
          if (extractedPosition) {
            positionValue = extractedPosition;
          } else if (statusValue) {
            // Use Status column value as position (e.g., "Done", "Working on it", "Stuck")
            positionValue = statusValue;
          }


          // Extract values from additional columns
          const departmentValue = departmentColumn ? extractColumnValue(departmentColumn) || 'General' : 'General';
          const locationValue = locationColumn ? extractColumnValue(locationColumn) : null;
          const startDateValue = startDateColumn ? extractColumnValue(startDateColumn) : null;
          const salaryValue = salaryColumn ? extractColumnValue(salaryColumn) : null;
          const addressValue = addressColumn ? extractColumnValue(addressColumn) : null;
          const notesValue = notesColumn ? extractColumnValue(notesColumn) : null;


          // Extract numeric values
          const numericValues = {};
          numberColumns.forEach(col => {
            if (col.text && col.text.trim()) {
              // Try to determine field name from column ID or text
              let fieldName = col.id;
              if (!fieldName || fieldName === 'numbers') {
                fieldName = col.text.toLowerCase().replace(/[^a-z0-9]/g, '_');
              }
              numericValues[fieldName] = col.text.trim();
            }
          });

          // Extract date values
          const dateValues = {};
          dateColumns.forEach(col => {
            if (col.text && col.text.trim()) {
              let fieldName = col.id;
              if (!fieldName || fieldName === 'date') {
                fieldName = col.text.toLowerCase().replace(/[^a-z0-9]/g, '_');
              }
              dateValues[fieldName] = col.text.trim();
            }
          });

          // Extract dropdown/status values
          const dropdownValues = {};
          dropdownColumns.forEach(col => {
            if (col.text && col.text.trim() && col.id !== 'position') { // Skip position as it's handled separately
              let fieldName = col.id;
              if (!fieldName || ['dropdown', 'status'].includes(fieldName)) {
                fieldName = col.text.toLowerCase().replace(/[^a-z0-9]/g, '_');
              }
              dropdownValues[fieldName] = col.text.trim();
            }
          });

          // Extract file columns for images
          let imageUrl = null;
          const fileColumns = item.column_values.filter(col => col.type === 'file' || col.type === 'files');
          if (fileColumns.length > 0) {
            // Use the first file column found, or look for one with "image", "photo", "avatar" in the ID/text
            let imageColumn = fileColumns.find(col =>
              (col.id && (col.id.includes('image') || col.id.includes('photo') || col.id.includes('avatar'))) ||
              (col.text && (col.text.toLowerCase().includes('image') || col.text.toLowerCase().includes('photo') || col.text.toLowerCase().includes('avatar')))
            );

            // If no specific image column found, use the first file column
            if (!imageColumn && fileColumns.length > 0) {
              imageColumn = fileColumns[0];
            }

            if (imageColumn) {
              imageUrl = extractColumnValue(imageColumn);
            }
          }

          // Extract custom field values from Monday.com
          const customFieldValues = {};
          const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
          customFields.forEach(customField => {
            const fieldColumnId = detectedMappings[customField.name];
            if (fieldColumnId) {
              const customFieldColumn = item.column_values.find(col => col.id === fieldColumnId);
              if (customFieldColumn) {
                let fieldValue = extractColumnValue(customFieldColumn);
                
                // Format value based on field type
                if (customField.type === 'email' && fieldValue) {
                  // Extract email from Monday.com email column format
                  if (typeof fieldValue === 'string' && fieldValue.includes('@')) {
                    // If it's already an email string, use it
                    customFieldValues[customField.name] = fieldValue;
                  } else if (customFieldColumn.value) {
                    // Try to parse email from column value JSON
                    try {
                      const parsed = JSON.parse(customFieldColumn.value);
                      if (parsed && parsed.email) {
                        customFieldValues[customField.name] = parsed.email;
                      } else {
                        customFieldValues[customField.name] = fieldValue || '';
                      }
                    } catch (e) {
                      customFieldValues[customField.name] = fieldValue || '';
                    }
                  } else {
                    customFieldValues[customField.name] = fieldValue || '';
                  }
                } else if (customField.type === 'phone' && fieldValue) {
                  // Extract phone from Monday.com phone column format
                  if (customFieldColumn.value) {
                    try {
                      const parsed = JSON.parse(customFieldColumn.value);
                      if (parsed && parsed.phone) {
                        customFieldValues[customField.name] = parsed.phone;
                      } else {
                        customFieldValues[customField.name] = fieldValue || '';
                      }
                    } catch (e) {
                      customFieldValues[customField.name] = fieldValue || '';
                    }
                  } else {
                    customFieldValues[customField.name] = fieldValue || '';
                  }
                } else {
                  // Text, number, date, dropdown - use extracted value
                  customFieldValues[customField.name] = fieldValue || '';
                }
                

              } else {

              }
            } else {

            }
          });

          const employeeData = {
            id: parseInt(item.id),
            name: fullName,
            position: positionValue,
            department: departmentValue,
            email: personData?.email || (emailColumn ? extractColumnValue(emailColumn) : null) || `${fullName.toLowerCase().replace(' ', '.')}@company.com`,
            phone: phoneColumn ? extractColumnValue(phoneColumn) : `+1-555-${String(100 + index).padStart(3, '0')}-${String(1000 + index).padStart(4, '0')}`,
            managerId: managerId,
            image: imageUrl || personData?.photo_original || personData?.photo_small || null,
            // Additional fields from monday.com
            location: locationValue,
            startDate: startDateValue,
            salary: salaryValue,
            address: addressValue,
            notes: notesValue,
            // Store dynamic fields
            ...numericValues,
            ...dateValues,
            ...dropdownValues,
            // Store custom field values
            ...customFieldValues,
            // Store whether we have a valid name from any source
            hasValidName: !!fullName && fullName.trim().length > 0
          };


          return employeeData;
        })
        // Filter out null items (items without column_values) and items that don't have valid names
        .filter(emp => {
          return emp !== null && emp.hasValidName;
        });

        // Second pass: set manager relationships
        // We need to match employees back to their original items
        mondayEmployees.forEach((employee) => {
          // Find the corresponding item by matching the employee ID
          const correspondingItem = items.find(item => parseInt(item.id) === employee.id);

          if (correspondingItem) {

            // First try standard manager column detection
            let managerColumn = findColumn(correspondingItem,
              // IDs
              ['manager', 'reports_to', 'supervisor', 'boss', 'lead'],
              // Titles
              ['manager', 'reports to', 'supervisor', 'boss', 'lead', 'მენეჯერი', 'ხელმძღვანელი', 'ბოსი'],
              ['text_mkz2n97z'] // Exclude the position column from manager detection
            );


            // If findColumn found the position column (which can happen due to keywords like "manager" in position titles), ignore it
            if (managerColumn && managerColumn.id === 'text_mkz2n97z') {

              managerColumn = null;
            }

            // If not found, look for dropdown/people columns that contain employee names
            if (!managerColumn) {
              const employeeNames = mondayEmployees.map(emp => emp.name.toLowerCase().trim());

              // Look for dropdown or people columns
              const potentialManagerColumns = correspondingItem.column_values.filter(col =>
                (col.type === 'dropdown' || col.type === 'people') &&
                col.id !== 'text_mkz2n97z' // Exclude the position column
              );

              // 

              for (const col of potentialManagerColumns) {
                const value = extractColumnValue(col);
                if (value) {
                  const valueLower = value.toLowerCase().trim();
                  // 

                  // Check if this value matches any employee name
                  const matchingEmployee = employeeNames.find(name =>
                    name === valueLower ||
                    name.includes(valueLower) ||
                    valueLower.includes(name)
                  );

                  if (matchingEmployee) {
                    managerColumn = col;

                    break;
                  }
                }
              }
            }

            const managerValue = managerColumn ? extractColumnValue(managerColumn) : null;

            if (managerValue) {
              const managerText = managerValue.trim();

              // Enhanced manager finding logic
              let manager = null;

              // Function to normalize names for comparison
              const normalizeName = (name) => {
                return name.toLowerCase()
                  .replace(/[^\w\s]/g, '') // Remove punctuation
                  .replace(/\s+/g, ' ') // Normalize spaces
                  .trim();
              };

              const normalizedManagerText = normalizeName(managerText);

              // 
              // 

              // Priority 1: Exact name match
              manager = mondayEmployees.find(emp => emp.name === managerText);
              // if (manager) 

              // Priority 2: Case-insensitive exact match
              if (!manager) {
                manager = mondayEmployees.find(emp => emp.name.toLowerCase() === managerText.toLowerCase());
                // if (manager) 
              }

              // Priority 3: Normalized name match
              if (!manager) {
                manager = mondayEmployees.find(emp => normalizeName(emp.name) === normalizedManagerText);
                // if (manager) 
              }

              // Priority 4: Partial name match (if manager text is part of employee name or vice versa)
              if (!manager) {
                manager = mondayEmployees.find(emp => {
                  const empNormalized = normalizeName(emp.name);
                  return empNormalized.includes(normalizedManagerText) ||
                         normalizedManagerText.includes(empNormalized);
                });
              }

              // Priority 5: First name match (if manager text contains first name)
              if (!manager) {
                const managerWords = normalizedManagerText.split(' ');
                manager = mondayEmployees.find(emp => {
                  const empWords = normalizeName(emp.name).split(' ');
                  return managerWords.some(word => empWords.includes(word) && word.length > 2);
                });
              }

              if (manager) {
                employee.managerId = manager.id;
                // 
              } else {
                // 
                // If manager not found, try to find a reasonable default
                // Look for employees with "CEO", "Director", "Manager" in their position
                const possibleManagers = mondayEmployees.filter(emp =>
                  emp.position && (
                    emp.position.toLowerCase().includes('ceo') ||
                    emp.position.toLowerCase().includes('director') ||
                    emp.position.toLowerCase().includes('manager') ||
                    emp.position.toLowerCase().includes('head')
                  )
                );

                if (possibleManagers.length > 0) {
                  employee.managerId = possibleManagers[0].id;
                } else {
                  // Last resort: assign to first employee
                  employee.managerId = mondayEmployees[0]?.id || null;
                }
              }
            } else {
              // No manager column data - use position-based hierarchy
              // Employees with "CEO", "Director" etc. are at top level
              const position = employee.position || '';
              const isTopLevel = position.toLowerCase().includes('ceo') ||
                               position.toLowerCase().includes('director') ||
                               position.toLowerCase().includes('president') ||
                               position.toLowerCase().includes('founder');

              if (isTopLevel) {
                employee.managerId = null; // Top level
              } else {
                // Find a suitable manager based on position hierarchy
                const managerCandidates = mondayEmployees.filter(emp =>
                  emp.position && (
                    emp.position.toLowerCase().includes('manager') ||
                    emp.position.toLowerCase().includes('director') ||
                    emp.position.toLowerCase().includes('supervisor') ||
                    emp.position.toLowerCase().includes('lead') ||
                    emp.position.toLowerCase().includes('head')
                  ) && emp.id !== employee.id
                );

                if (managerCandidates.length > 0) {
                  employee.managerId = managerCandidates[0].id;
                } else {
                  employee.managerId = mondayEmployees[0]?.id || null;
                }
              }
            }
          }

          // Log manager assignment result
        });

        // Validate and fix hierarchy
        const validateHierarchy = (employees) => {
          const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
          const processed = new Set();
          const hierarchyErrors = [];

          // Function to check for circular references
          const checkCircular = (empId, visited = new Set()) => {
            if (visited.has(empId)) {
              hierarchyErrors.push(`Circular reference detected for employee ${empId}`);
              return true;
            }
            if (processed.has(empId)) return false;

            visited.add(empId);
            const emp = employeeMap.get(empId);
            if (emp && emp.managerId) {
              return checkCircular(emp.managerId, visited);
            }
            visited.delete(empId);
            processed.add(empId);
            return false;
          };

          // Check each employee for circular references
          employees.forEach(emp => {
            if (!processed.has(emp.id)) {
              checkCircular(emp.id);
            }
          });

          // Fix hierarchy issues
          employees.forEach(emp => {
            // Ensure no employee reports to themselves
            if (emp.managerId === emp.id) {
              emp.managerId = null;
              hierarchyErrors.push(`Fixed self-reference for ${emp.name}`);
            }

            // Ensure manager exists
            if (emp.managerId && !employeeMap.has(emp.managerId)) {
              emp.managerId = null;
              hierarchyErrors.push(`Fixed invalid manager reference for ${emp.name}`);
            }
          });

          if (hierarchyErrors.length > 0) {
            
          }

          return employees;
        };

        // Validate hierarchy and fix issues
        const validatedEmployees = validateHierarchy(mondayEmployees);

        // Only set employees if we have data from Monday.com
        if (validatedEmployees.length > 0) {

          // Debug column assignments for all employees

          validatedEmployees.forEach(emp => {
            const originalItem = items.find(item => parseInt(item.id) === emp.id);
            if (originalItem) {
              const positionCol = originalItem.column_values.find(col => col.id === 'text_mkz2n97z');
              const managerCol = originalItem.column_values.find(col => col.id === 'dropdown_mkz225fw');
              const deptCol = originalItem.column_values.find(col => col.id === 'dropdown_mkzdks5f');


            }
          });

          // Debug specific employees
          const debugEmployees = validatedEmployees.filter(emp => ['Lazarei', 'Givi'].includes(emp.name));
          if (debugEmployees.length > 0) {
          }

          // Log final processed employee data for verification

          validatedEmployees.forEach(emp => {

          });

          // Log hierarchy for debugging

          validatedEmployees.forEach(emp => {
            const manager = validatedEmployees.find(m => m.id === emp.managerId);

          });

          setEmployees(validatedEmployees);
          setMondayDataLoaded(true); // Trigger automatic organization after Monday.com data is loaded
          localStorage.setItem('employees', JSON.stringify(validatedEmployees));

          // Auto-sync Manager dropdown with all employee names from loaded data
          if (validatedEmployees.length > 0 && !isStandaloneMode && boardId) {
            try {
              // Get all employee names from loaded data
              const allEmployeeNames = validatedEmployees.map(emp => emp.name).filter(name => name && name.trim());
              
              // Find manager column
              const managerColumnQuery = `
                query {
                  boards(ids: [${boardId}]) {
                    columns {
                      id
                      title
                      type
                      settings_str
                    }
                  }
                }
              `;
              
              const managerColumnResponse = await monday.api(managerColumnQuery);
              if (managerColumnResponse?.data?.boards?.[0]) {
                const currentBoard = managerColumnResponse.data.boards[0];
                
                // Find manager column
                const managerColumns = currentBoard.columns?.filter(col => {
                  const columnTitle = col.title?.toLowerCase() || '';
                  return (col.type === 'dropdown' || col.type === 'status') &&
                         (columnTitle.includes('manager') || columnTitle.includes('მენეჯერი') ||
                          columnTitle.includes('supervisor') || columnTitle.includes('boss'));
                });
                
                const managerColumn = managerColumns?.[0];
                
                if (managerColumn) {
                  // Get current dropdown options
                  const currentLabels = JSON.parse(managerColumn.settings_str || '{}').labels || {};
                  const currentOptions = Object.values(currentLabels).filter(label => label && typeof label === 'string');
                  
                  // Find missing employee names
                  const missingNames = allEmployeeNames.filter(name => !currentOptions.includes(name));
                  
                  if (missingNames.length > 0) {
                    console.log('🔄 Auto-syncing Manager dropdown with all employee names from loaded data...');
                    console.log(`📋 Adding ${missingNames.length} employee name(s) to Manager dropdown:`, missingNames);
                    
                    // Add missing names to dropdown
                    const updatedLabels = { ...currentLabels };
                    let nextId = Math.max(...Object.keys(updatedLabels).map(k => parseInt(k) || 0), 0) + 1;
                    missingNames.forEach(name => {
                      updatedLabels[nextId.toString()] = name;
                      nextId++;
                    });
                    
                    // Update local state only (change_column_settings doesn't exist in Monday.com API)
                    // Labels will be created automatically when updating items with create_labels_if_missing: true
                    console.log('✅ Manager dropdown auto-synced with all employee names (local state only)');
                    
                    // Update local state
                    const updatedOptions = Object.values(updatedLabels);
                    setManagerDropdownOptions(updatedOptions);
                    console.log(`📋 Manager dropdown now has ${updatedOptions.length} option(s)`);
                  } else {
                    console.log('✅ Manager dropdown already contains all employee names');
                    // Update local state with current options
                    setManagerDropdownOptions(currentOptions);
                  }
                } else {
                  console.log('⚠️ Manager dropdown column not found - cannot auto-sync');
                }
              }
            } catch (syncError) {
              console.log('❌ Error auto-syncing Manager dropdown:', syncError);
            }
          }

          // Re-enable organize button when Monday.com data is loaded
          reEnableOrganize();
        }
      }
    } catch (error) {
      
      

      // Log more detailed error info
      if (error.message) {
        
      }
      if (error.graphQLErrors) {
        
      }
      if (error.networkError) {
        
      }

      // Check if it's a permissions issue
      if (error.message && error.message.includes('Insufficient permissions')) {
        
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

  // Helper function to format phone number for Monday.com phone column
  const formatPhoneForMonday = (phoneNumber) => {
    if (!phoneNumber) return null;
    
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      // If it doesn't start with +, try to detect country code
      // Common patterns: starts with country code (e.g., 995 for Georgia, 1 for US)
      if (cleaned.startsWith('995')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('1') && cleaned.length === 11) {
        cleaned = '+' + cleaned;
      } else {
        // Default: assume it's a local number, add +995 for Georgia
        cleaned = '+995' + cleaned;
      }
    }
    
    // Extract country code from phone number
    // Common country codes: +995 (Georgia), +1 (US/Canada), +44 (UK), +49 (Germany), etc.
    let countryShortName = 'GE'; // Default to Georgia
    
    if (cleaned.startsWith('+995')) {
      countryShortName = 'GE';
    } else if (cleaned.startsWith('+1')) {
      countryShortName = 'US';
    } else if (cleaned.startsWith('+44')) {
      countryShortName = 'GB';
    } else if (cleaned.startsWith('+49')) {
      countryShortName = 'DE';
    } else if (cleaned.startsWith('+33')) {
      countryShortName = 'FR';
    } else if (cleaned.startsWith('+7')) {
      countryShortName = 'RU';
    } else if (cleaned.startsWith('+90')) {
      countryShortName = 'TR';
    } else if (cleaned.startsWith('+86')) {
      countryShortName = 'CN';
    } else if (cleaned.startsWith('+81')) {
      countryShortName = 'JP';
    } else if (cleaned.startsWith('+91')) {
      countryShortName = 'IN';
    }
    // Add more country codes as needed
    
    return {
      phone: cleaned,
      countryShortName: countryShortName
    };
  };

  // Add employee to Monday.com board
  const addEmployeeToMonday = async (employeeData, boardIdToUse, columnMappings = {}, departmentDropdownOptions = [], managerDropdownOptions = []) => {

    if (!boardIdToUse) {
      
      return null;
    }

    // Always load column mappings from localStorage to ensure we have the latest mappings
    const savedColumnMappings = JSON.parse(localStorage.getItem('columnMappings') || '{}');
    columnMappings = { ...columnMappings, ...savedColumnMappings };



    try {
      // First, create the item with name (we need item_id before uploading file)

      const createMutation = `
        mutation {
          create_item (
            board_id: ${boardIdToUse},
            item_name: "${employeeData.name.replace(/"/g, '\\"')}"
          ) {
            id
          }
        }
      `;


      const createResponse = await monday.api(createMutation);


      if (!createResponse?.data?.create_item?.id) {
        
        
        return null;
      }

      const itemId = createResponse.data.create_item.id;


      // Upload image file if present (must be done after item creation)
      if (employeeData.imageFile) {

          if (columnMappings.image) {

            try {
              // Compress/resize image before upload to reduce size
              const compressedImage = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const maxWidth = 800;
                  const maxHeight = 800;
                  let width = img.width;
                  let height = img.height;

                  // Calculate new dimensions
                  if (width > height) {
                    if (width > maxWidth) {
                      height = (height * maxWidth) / width;
                      width = maxWidth;
                    }
                  } else {
                    if (height > maxHeight) {
                      width = (width * maxHeight) / height;
                      height = maxHeight;
                    }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);

                  // Convert to blob with compression
                  canvas.toBlob((blob) => {
                    if (blob) {
                      resolve(blob);
                    } else {
                      reject(new Error('Failed to compress image'));
                    }
                  }, 'image/jpeg', 0.8); // 80% quality
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(employeeData.imageFile);
              });




              // Convert compressed blob to File object for Monday.com API
              const compressedFile = new File([compressedImage], employeeData.imageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              // Use Monday.com's add_file_to_column mutation with File variable
              // Monday.com API requires multipart/form-data with File type
              const fileUploadMutation = `
                mutation ($file: File!) {
                  add_file_to_column (
                    item_id: ${itemId},
                    column_id: "${columnMappings.image}",
                    file: $file
                  ) {
                    id
                    url
                  }
                }
              `;





              
              // Monday.com SDK should handle File type automatically
              const uploadResponse = await monday.api(fileUploadMutation, {
                variables: {
                  file: compressedFile
                }
              });


              if (uploadResponse?.data?.add_file_to_column?.id) {



              } else {
                
                
              }
            } catch (imageError) {
              
              
              if (imageError.graphQLErrors) {
                
              }
            }
          } else {
            
            
            
          }
      }

      // Now try to update with column data if we have mappings



      // Prepare column values using detected column mappings
      const columnValues = {};





      // Position column
      if (employeeData.position && columnMappings.position) {
        columnValues[columnMappings.position] = employeeData.position;

      } else {

      }

      // Department column - always set if column is mapped
      if (employeeData.department && columnMappings.department) {
        // If it's a dropdown column with options, validate against dropdown
        if (departmentDropdownOptions.length > 0) {
          if (departmentDropdownOptions.includes(employeeData.department)) {
            columnValues[columnMappings.department] = { labels: [employeeData.department] };
            console.log(`✅ Department "${employeeData.department}" found in dropdown options`);
          } else {
            console.log(`⚠️ Department "${employeeData.department}" not found in dropdown options`);
            console.log(`📋 Available department options:`, departmentDropdownOptions);
            console.log(`🔄 Department will be added to Monday.com - this may cause an error but will be handled`);

            // Still try to set it - if the dropdown auto-sync worked, it should be available
            // If not, the error will be caught and handled gracefully
            columnValues[columnMappings.department] = { labels: [employeeData.department] };
          }
        } else {
          // Not a dropdown column, just set the value directly (text column, etc.)
          columnValues[columnMappings.department] = employeeData.department;
          console.log(`📝 Setting department "${employeeData.department}" in text/other column type`);
        }
      }

      // Email column

      if (employeeData.email && columnMappings.email) {
        columnValues[columnMappings.email] = employeeData.email;

      } else {

      }

      // Phone column - format for Monday.com with country flag
      if (employeeData.phone && columnMappings.phone) {
        const formattedPhone = formatPhoneForMonday(employeeData.phone);
        if (formattedPhone) {
          columnValues[columnMappings.phone] = formattedPhone;

        } else {

        }
      } else {

      }

      // Manager column - try to find manager by name
      if (employeeData.managerId && columnMappings.manager) {


        // Try different ID formats (string vs number)
        let manager = employees.find(emp => emp.id === employeeData.managerId);
        if (!manager && typeof employeeData.managerId === 'string') {
          manager = employees.find(emp => emp.id === parseInt(employeeData.managerId));
        }
        if (!manager && typeof employeeData.managerId === 'number') {
          manager = employees.find(emp => emp.id === employeeData.managerId.toString());
        }

        if (manager) {
          // Validate manager name
          const allEmployeeNames = employees.map(emp => emp.name);
          if (allEmployeeNames.includes(manager.name)) {
            // If it's a dropdown column with options, validate against dropdown
            if (managerDropdownOptions.length > 0) {
              if (managerDropdownOptions.includes(manager.name)) {
                columnValues[columnMappings.manager] = { labels: [manager.name] };
                console.log(`✅ Manager "${manager.name}" found in dropdown options`);
              } else {
                console.log(`⚠️ Manager "${manager.name}" not found in dropdown options`);
                console.log(`📋 Available manager options:`, managerDropdownOptions);
                console.log(`🔄 Manager will be added to Monday.com - this may cause an error but will be handled`);

                // Still try to set it - if the dropdown auto-sync worked, it should be available
                // If not, the error will be caught and handled gracefully
                columnValues[columnMappings.manager] = { labels: [manager.name] };
              }
            } else {
              // Not a dropdown column, just set the value directly (text column, etc.)
              columnValues[columnMappings.manager] = manager.name;
              console.log(`📝 Setting manager "${manager.name}" in text/other column type`);
            }
          } else {
            console.log(`⚠️ Manager "${manager.name}" not found in employee list`);

          }
        } else {


        }
      } else {

      }

      // Custom fields - sync to Monday.com
      const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
      customFields.forEach(customField => {
        const fieldValue = employeeData[customField.name];
        const fieldColumnId = columnMappings[customField.name];
        
        if (fieldValue && fieldColumnId) {
          // Format value based on field type
          if (customField.type === 'email') {
            columnValues[fieldColumnId] = {
              email: fieldValue,
              text: fieldValue
            };
          } else if (customField.type === 'phone') {
            const formattedPhone = formatPhoneForMonday(fieldValue);
            if (formattedPhone) {
              columnValues[fieldColumnId] = formattedPhone;
            } else {
              columnValues[fieldColumnId] = fieldValue;
            }
          } else {
            // Text, number, date, dropdown - use plain value
            columnValues[fieldColumnId] = fieldValue;
          }

        } else if (fieldValue && !fieldColumnId) {

        }
      });




      // Update columns with actual values
        if (Object.keys(columnValues).length > 0) {


          // Prepare bulk update data
          const bulkUpdateData = {};
          Object.entries(columnValues).forEach(([columnId, value]) => {
            // Check if value is already formatted as object (for email or phone custom fields)
            if (typeof value === 'object' && value !== null) {
              // Value is already formatted (email: {email, text} or phone: {phone, countryShortName} or dropdown: {labels: [...]})
              bulkUpdateData[columnId] = value;
            } else if (columnId.includes('email')) {
              // Email columns require JSON format: {"email": "email", "text": "email"}
              bulkUpdateData[columnId] = {
                email: value,
                text: value  // Display the email address as text
              };
            } else if (columnId.includes('phone')) {
              // Phone columns require JSON format: {"phone": "+1234567890", "countryShortName": "US"}
              // Try to format if not already formatted
              const formattedPhone = formatPhoneForMonday(value);
              if (formattedPhone) {
                bulkUpdateData[columnId] = formattedPhone;
              } else {
                bulkUpdateData[columnId] = value;
              }
            } else if (columnId.includes('file')) {
              // Skip file columns - they are handled separately via add_file_to_column mutation

            } else if (columnId === columnMappings.manager && managerDropdownOptions.length > 0 && typeof value === 'string') {
              // Manager dropdown column - convert string to JSON format
              bulkUpdateData[columnId] = { labels: [value] };
            } else if (columnId === columnMappings.department && departmentDropdownOptions.length > 0 && typeof value === 'string') {
              // Department dropdown column - convert string to JSON format
              bulkUpdateData[columnId] = { labels: [value] };
            } else {
              // Text, dropdown, and other columns use plain strings
              bulkUpdateData[columnId] = value;
            }
          });



          const bulkUpdateMutation = `
            mutation {
              change_multiple_column_values (
                item_id: ${itemId},
                board_id: ${boardIdToUse},
                column_values: "${JSON.stringify(bulkUpdateData).replace(/"/g, '\\"')}",
                create_labels_if_missing: true
              ) {
                id
              }
            }
          `;



          try {
            const bulkUpdateResponse = await monday.api(bulkUpdateMutation);


            if (bulkUpdateResponse?.data?.change_multiple_column_values?.id) {

            } else {
              
              
            }
          } catch (bulkError) {
            
            

            // If bulk update fails due to dropdown validation, try individual updates
            if (bulkError.message && (bulkError.message.includes('dropdown label') || bulkError.message.includes('does not exist'))) {

              
              // Remove problematic dropdown columns from bulkUpdateData
              const cleanedBulkData = { ...bulkUpdateData };
              Object.keys(cleanedBulkData).forEach(columnId => {
                if (columnId.includes('dropdown')) {

                  delete cleanedBulkData[columnId];
                }
              });
              
              // Try bulk update again without dropdown columns
              if (Object.keys(cleanedBulkData).length > 0) {

                try {
                  const retryMutation = `
                    mutation {
                      change_multiple_column_values (
                        item_id: ${itemId},
                        board_id: ${boardIdToUse},
                        column_values: "${JSON.stringify(cleanedBulkData).replace(/"/g, '\\"')}",
                        create_labels_if_missing: true
                      ) {
                        id
                      }
                    }
                  `;
                  
                  const retryResponse = await monday.api(retryMutation);
                  if (retryResponse?.data?.change_multiple_column_values?.id) {

                  }
                } catch (retryError) {
                  
                }
              }
              


              // Try to update each column individually, skipping invalid dropdown values
              for (const [columnId, value] of Object.entries(bulkUpdateData)) {
                try {
                  // Skip dropdown columns that might have invalid values
                  if (columnId.includes('dropdown') && bulkError.message && bulkError.message.includes('does not exist')) {

                    continue;
                  }

                  let formattedValue;

                  // Value is already properly formatted from bulkUpdateData
                  // For email columns it's an object, for others it's a string
                  if (typeof value === 'object') {
                    formattedValue = JSON.stringify(value);
                  } else {
                    formattedValue = JSON.stringify(value);
                  }

                  const individualMutation = `mutation{change_column_value(item_id:${itemId},board_id:${boardIdToUse},column_id:"${columnId}",value:${formattedValue}){id}}`;


                  const individualResponse = await monday.api(individualMutation);

                } catch (individualError) {
                  // Skip dropdown columns if validation fails
                  if (individualError.message && individualError.message.includes('dropdown label') && individualError.message.includes('does not exist')) {
                    
                  } else {
                    
                  }
                  // Continue with other columns even if one fails
                }
              }
            }
          }
        } else {

        }


      return parseInt(itemId);

    } catch (error) {
      
      
      return null;
    }
  };

  // Delete employee from Monday.com board
  const deleteEmployeeFromMonday = async (employeeId, boardIdToUse) => {
    if (!boardIdToUse) {
      
      return false;
    }

    try {
      // Create mutation to delete item from board
      const mutation = `
        mutation {
          delete_item (item_id: ${employeeId}) {
            id
          }
        }
      `;



      const response = await monday.api(mutation);

      if (response?.data?.delete_item?.id) {

        return true;
      } else {
        
        return false;
      }
    } catch (error) {
      
      return false;
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

  const addEmployee = async (employeeData) => {

    // Create employee locally first
    const tempId = Date.now();
    
    // Handle image file - create preview URL for local display
    let imageUrl = null;
    if (employeeData.imageFile) {
      imageUrl = URL.createObjectURL(employeeData.imageFile);

    }
    
    const newEmployee = {
      ...employeeData,
      id: tempId,
      managerId: employeeData.managerId ? parseInt(employeeData.managerId) : null,
      image: imageUrl || employeeData.image || null
    };

    // Remove imageFile from employee object (it's not needed in state)
    delete newEmployee.imageFile;

    // Add to local state immediately for UI responsiveness
    setEmployees([...employees, newEmployee]);

    // Re-enable organize button since data changed
    reEnableOrganize();

    // Trigger automatic organization after adding new employee
    setEmployeeJustEdited(true);

    setShowForm(false);
    setSelectedEmployee(null);

    // If connected to Monday.com, sync the employee
    if (!isStandaloneMode && boardId) {
      try {

        const mondayId = await addEmployeeToMonday(employeeData, boardId, columnMappings, departmentDropdownOptions, managerDropdownOptions);

        if (mondayId) {
          console.log(`➕ Monday.com-ში დამატებულია ახალი თანამშრომელი: ${employeeData.name} (ID: ${mondayId})`);
          // Update the employee with the real Monday.com ID
          setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
              emp.id === tempId
                ? { ...emp, id: mondayId }
                : emp
            )
          );

          // Save updated employees to localStorage
          setTimeout(() => {
            setEmployees(currentEmployees => {
              const updatedEmployees = currentEmployees.map(emp =>
                emp.id === tempId
                  ? { ...emp, id: mondayId }
                  : emp
              );
              localStorage.setItem('employees', JSON.stringify(updatedEmployees));
              return updatedEmployees;
            });
          }, 100);
        } else {
          
        }
      } catch (error) {
        
      }
    } else {
      // Save to localStorage if not syncing to Monday.com
      localStorage.setItem('employees', JSON.stringify([...employees, newEmployee]));
    }
  };

  const updateEmployee = async (employeeData) => {
    // Find the original employee to compare changes
    const originalEmployee = employees.find(emp => emp.id === selectedEmployee.id);

    // Handle image file - create preview URL for local display if new image provided
    let imageUrl = originalEmployee?.image || null;
    if (employeeData.imageFile) {
      // If there was a previous image URL, revoke it to free memory
      if (originalEmployee?.image && originalEmployee.image.startsWith('blob:')) {
        URL.revokeObjectURL(originalEmployee.image);
      }
      imageUrl = URL.createObjectURL(employeeData.imageFile);

    }

    // Update locally first
    const updatedEmployee = {
      ...employeeData,
      id: selectedEmployee.id,
      managerId: employeeData.managerId ? parseInt(employeeData.managerId) : null,
      image: imageUrl || employeeData.image || originalEmployee?.image || null
    };

    // Remove imageFile from employee object (it's not needed in state)
    delete updatedEmployee.imageFile;

    const updatedEmployees = employees.map(emp =>
      emp.id === selectedEmployee.id ? updatedEmployee : emp
    );
    
    // Update state immediately for UI responsiveness
    setEmployees(updatedEmployees);

    // Re-enable organize button since data changed
    reEnableOrganize();

    // Trigger automatic organization after employee edit
    setEmployeeJustEdited(true);

    // Save to localStorage immediately so changes persist even if Monday.com sync fails
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));

    setShowForm(false);
    setSelectedEmployee(null);

    // Sync changes to Monday.com if connected
    if (!isStandaloneMode && boardId && originalEmployee) {
      try {
        // Always load column mappings from localStorage to ensure we have the latest mappings
        const savedColumnMappings = JSON.parse(localStorage.getItem('columnMappings') || '{}');
        const currentColumnMappings = { ...columnMappings, ...savedColumnMappings };



        // Identify changed fields
        const changedFields = {};

        // Check if name changed - Monday.com item name can be updated via change_multiple_column_values
        if (updatedEmployee.name !== originalEmployee.name) {

          // Add name to changedFields - Monday.com uses "name" as special column ID
          changedFields['name'] = updatedEmployee.name;

        }


        if (updatedEmployee.position !== originalEmployee.position) {

          if (currentColumnMappings.position) {
            changedFields[currentColumnMappings.position] = updatedEmployee.position;

          } else {

          }
        }


        if (updatedEmployee.department !== originalEmployee.department) {

          if (currentColumnMappings.department) {
            changedFields[currentColumnMappings.department] = updatedEmployee.department;

          } else {

          }
        }


        if (updatedEmployee.email !== originalEmployee.email) {

          if (currentColumnMappings.email) {
            changedFields[currentColumnMappings.email] = updatedEmployee.email;

          } else {

          }
        }


        if (updatedEmployee.phone !== originalEmployee.phone) {

          if (currentColumnMappings.phone) {
            // Format phone for Monday.com with country flag
            const formattedPhone = formatPhoneForMonday(updatedEmployee.phone);
            if (formattedPhone) {
              changedFields[currentColumnMappings.phone] = formattedPhone;

            } else {
              changedFields[currentColumnMappings.phone] = updatedEmployee.phone;

            }
          } else {

          }
        }

        // Check if manager changed

        if (updatedEmployee.managerId !== originalEmployee.managerId) {
          const newManager = employees.find(emp => emp.id === updatedEmployee.managerId);
          const oldManager = employees.find(emp => emp.id === originalEmployee.managerId);



          if (newManager?.name !== oldManager?.name && currentColumnMappings.manager) {
            // Validate manager name against dropdown options if they exist
            if (managerDropdownOptions.length > 0) {
              if (managerDropdownOptions.includes(newManager?.name)) {
                // For dropdown columns, use JSON format with labels array
                changedFields[currentColumnMappings.manager] = JSON.stringify({
                  labels: [newManager?.name]
                });
                console.log(`✅ Manager "${newManager?.name}" found in dropdown options`);
              } else {
                console.log(`⚠️ Manager "${newManager?.name}" not found in dropdown options`);
                console.log(`📋 Available manager options:`, managerDropdownOptions);
                console.log(`🔄 Attempting to sync manager dropdown before updating...`);

                // Try to sync the manager dropdown first
                let dropdownSynced = false;
                try {
                  // Load board data to get current columns
                  const boardQuery = `
                    query {
                      boards(ids: [${boardId}]) {
                        id
                        columns {
                          id
                          title
                          type
                          settings_str
                        }
                      }
                    }
                  `;

                  const boardResponse = await monday.api(boardQuery);
                  if (boardResponse?.data?.boards?.[0]) {
                    const currentBoard = boardResponse.data.boards[0];

                    // Extract current manager options
                    const currentManagerOptions = [];
                    let managerColumn = null;
                    if (currentBoard.columns) {
                      currentBoard.columns.forEach(column => {
                        const columnTitle = column.title?.toLowerCase() || '';
                        if ((column.type === 'dropdown' || column.type === 'status') &&
                            (columnTitle.includes('manager') || columnTitle.includes('მენეჯერი') ||
                             columnTitle.includes('supervisor') || columnTitle.includes('boss'))) {
                          managerColumn = column;
                          try {
                            const settings = JSON.parse(column.settings_str || '{}');
                            if (settings.labels) {
                              Object.values(settings.labels).forEach(label => {
                                if (label && typeof label === 'string' && label.trim()) {
                                  currentManagerOptions.push(label.trim());
                                }
                              });
                            }
                          } catch (error) {
                            console.log('❌ Error parsing manager column settings:', error);
                          }
                        }
                      });
                    }

                    // Check if the missing name is still missing and try to sync
                    if (managerColumn && currentManagerOptions.length > 0 && !currentManagerOptions.includes(newManager?.name)) {
                      console.log('🔄 Syncing manager dropdown with missing name...');

                      // Add the missing name
                      const updatedLabels = { ...JSON.parse(managerColumn.settings_str || '{}').labels };
                      const nextId = Math.max(...Object.keys(updatedLabels).map(k => parseInt(k)), 0) + 1;
                      updatedLabels[nextId.toString()] = newManager?.name;

                      // Update local state only (change_column_settings doesn't exist in Monday.com API)
                      // Labels will be created automatically when updating items with create_labels_if_missing: true
                      console.log('✅ Manager dropdown synced successfully (local state only)');

                      // Update local state
                      const updatedOptions = Object.values(updatedLabels);
                      setManagerDropdownOptions(updatedOptions);
                      dropdownSynced = true;
                    }
                  }
                } catch (syncError) {
                  console.log('❌ Failed to sync manager dropdown:', syncError);
                }

                // Only set it if dropdown was synced successfully
                if (dropdownSynced) {
                  // For dropdown columns, use JSON format with labels array
                  changedFields[currentColumnMappings.manager] = JSON.stringify({
                    labels: [newManager?.name]
                  });
                  console.log(`✅ Manager "${newManager?.name}" added to dropdown and will be set`);
                } else {
                  console.log(`⚠️ Skipping manager update for "${newManager?.name}" - dropdown sync failed or name not in options`);
                }
              }
            } else {
              // Not a dropdown column, just set the value directly (text column, etc.)
              changedFields[currentColumnMappings.manager] = newManager?.name || '';
              console.log(`📝 Setting manager "${newManager?.name}" in text/other column type`);
            }

          } else if (currentColumnMappings.manager) {

          } else {

          }
        }

        // Check custom fields for changes
        const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');


        customFields.forEach(customField => {
          const originalValue = originalEmployee[customField.name] || '';
          const updatedValue = updatedEmployee[customField.name] || '';
          const fieldColumnId = currentColumnMappings[customField.name];

          if (originalValue !== updatedValue && fieldColumnId) {

            
            // Format value based on field type
            if (customField.type === 'email') {
              changedFields[fieldColumnId] = {
                email: updatedValue,
                text: updatedValue
              };
            } else if (customField.type === 'phone') {
              const formattedPhone = formatPhoneForMonday(updatedValue);
              if (formattedPhone) {
                changedFields[fieldColumnId] = formattedPhone;
              } else {
                changedFields[fieldColumnId] = updatedValue;
              }
            } else {
              // Text, number, date, dropdown - use plain value
              changedFields[fieldColumnId] = updatedValue;
            }

          } else if (originalValue !== updatedValue && !fieldColumnId) {




          }
        });

        // Handle image upload if image file is provided
        if (employeeData.imageFile) {

          if (currentColumnMappings.image) {

            try {
              // First, clear all existing files from the column to replace the old image

              const clearFilesMutation = `
                mutation {
                  change_column_value (
                    item_id: ${selectedEmployee.id},
                    board_id: ${boardId},
                    column_id: "${columnMappings.image}",
                    value: "{\\"clear_all\\": true}"
                  ) {
                    id
                  }
                }
              `;

              try {
                const clearResponse = await monday.api(clearFilesMutation);

                if (clearResponse?.data?.change_column_value?.id) {

                }
              } catch (clearError) {
                
                // Continue with upload even if clear fails
              }

              // Compress/resize image before upload to reduce size
              const compressedImage = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const maxWidth = 800;
                  const maxHeight = 800;
                  let width = img.width;
                  let height = img.height;

                  // Calculate new dimensions
                  if (width > height) {
                    if (width > maxWidth) {
                      height = (height * maxWidth) / width;
                      width = maxWidth;
                    }
                  } else {
                    if (height > maxHeight) {
                      width = (width * maxHeight) / height;
                      height = maxHeight;
                    }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);

                  // Convert to blob with compression
                  canvas.toBlob((blob) => {
                    if (blob) {
                      resolve(blob);
                    } else {
                      reject(new Error('Failed to compress image'));
                    }
                  }, 'image/jpeg', 0.8); // 80% quality
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(employeeData.imageFile);
              });




              // Convert compressed blob to File object for Monday.com API
              const compressedFile = new File([compressedImage], employeeData.imageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              // Use Monday.com's add_file_to_column mutation with File variable
              // Monday.com API requires multipart/form-data with File type
              const fileUploadMutation = `
                mutation ($file: File!) {
                  add_file_to_column (
                    item_id: ${selectedEmployee.id},
                    column_id: "${columnMappings.image}",
                    file: $file
                  ) {
                    id
                    url
                  }
                }
              `;





              
              // Monday.com SDK should handle File type automatically
              const uploadResponse = await monday.api(fileUploadMutation, {
                variables: {
                  file: compressedFile
                }
              });


              if (uploadResponse?.data?.add_file_to_column?.id) {



              } else {
                
                
              }
            } catch (imageError) {
              
              
              if (imageError.graphQLErrors) {
                
              }
            }
          } else {
            
            
            
          }
        }

        // Update changed fields in Monday.com
        if (Object.keys(changedFields).length > 0) {
          console.log(`🔄 Monday.com-ში განახლება: ${Object.keys(changedFields).length} ცვლილება თანამშრომელზე ${updatedEmployee.name} (ID: ${selectedEmployee.id})`);

          // Prepare bulk update data
          const bulkUpdateData = {};
          Object.entries(changedFields).forEach(([columnId, value]) => {
            // Check if value is already formatted as object (for email or phone custom fields)
            if (typeof value === 'object' && value !== null) {
              // Value is already formatted (email: {email, text} or phone: {phone, countryShortName})
              bulkUpdateData[columnId] = value;
            } else if (typeof value === 'string' && value.startsWith('{') && value.includes('labels')) {
              // Value is already a JSON string for dropdown (e.g., '{"labels": ["ManagerName"]}')
              try {
                bulkUpdateData[columnId] = JSON.parse(value);
              } catch (e) {
                // If parsing fails, use as-is
                console.log(`⚠️ Failed to parse dropdown value for ${columnId}:`, e);
                bulkUpdateData[columnId] = value;
              }
            } else if (columnId.includes('email')) {
              // Email columns require JSON format: {"email": "email", "text": "email"}
              // The text field should contain the email address, not the name
              bulkUpdateData[columnId] = {
                email: value,
                text: value // Use email address as text, not name
              };
            } else if (columnId.includes('phone')) {
              // Phone columns require JSON format: {"phone": "+1234567890", "countryShortName": "US"}
              // Try to format if not already formatted
              const formattedPhone = formatPhoneForMonday(value);
              if (formattedPhone) {
                bulkUpdateData[columnId] = formattedPhone;
              } else {
                bulkUpdateData[columnId] = value;
              }
            } else if (columnId === currentColumnMappings.manager && managerDropdownOptions.length > 0) {
              // Manager dropdown column - use JSON format
              bulkUpdateData[columnId] = {
                labels: [value]
              };
            } else if (columnId === currentColumnMappings.department && departmentDropdownOptions.length > 0) {
              // Department dropdown column - use JSON format
              bulkUpdateData[columnId] = {
                labels: [value]
              };
            } else {
              // Text, dropdown, and other columns use plain strings
              bulkUpdateData[columnId] = value;
            }
          });



          const bulkUpdateMutation = `
            mutation {
              change_multiple_column_values (
                item_id: ${selectedEmployee.id},
                board_id: ${boardId},
                column_values: "${JSON.stringify(bulkUpdateData).replace(/"/g, '\\"')}",
                create_labels_if_missing: true
              ) {
                id
              }
            }
          `;



          try {
            const bulkUpdateResponse = await monday.api(bulkUpdateMutation);


            if (bulkUpdateResponse?.data?.change_multiple_column_values?.id) {

            } else {
              
              
            }
          } catch (bulkError) {
            
            
          }
        }



      } catch (error) {
        
        // Even if sync fails, the local state is already updated and saved
      }
    }
  };

  const confirmDeleteEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const deleteEmployee = async (employeeId) => {
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

    // Get employee info before removal for logging
    const employeeToDelete = employees.find(emp => emp.id === employeeId);

    // Remove from local state immediately for UI responsiveness
    const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
    setEmployees(updatedEmployees);

    // Re-enable organize button since data changed
    reEnableOrganize();

    // Trigger automatic organization after deleting employee
    setEmployeeJustEdited(true);

    setSelectedEmployee(null);
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);

    // If connected to Monday.com, sync the deletion
    if (!isStandaloneMode && boardId) {
      try {

        const success = await deleteEmployeeFromMonday(employeeId, boardId);

        if (success) {
          console.log(`🗑️ Monday.com-დან წაშლილია თანამშრომელი: ${employeeToDelete?.name || 'უცნობი'} (ID: ${employeeId})`);
        }

        if (!success) {
          
          // Could potentially restore the employee locally here if needed
        }
      } catch (error) {
        
      }
    }

    // Save updated employees to localStorage
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
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
          <h1>Organizational Chart {isStandaloneMode && <span className="standalone-badge">Standalone Mode</span>}</h1>
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
              isStandaloneMode={isStandaloneMode}
              mondayDataLoaded={mondayDataLoaded}
              designSettings={designSettings}
              isOrganizeDisabled={isOrganizeDisabled}
              setIsOrganizeDisabled={setIsOrganizeDisabled}
              employeeJustEdited={employeeJustEdited}
              setEmployeeJustEdited={setEmployeeJustEdited}
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
          boardId={boardId}
          isStandaloneMode={isStandaloneMode}
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
