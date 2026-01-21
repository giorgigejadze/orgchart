import jsPDF from 'jspdf';
import Papa from 'papaparse';

// Enhanced PDF Export Functions with Sophisticated Design
export const exportToPDF = async (employees, orgChartElement = null, options = {}) => {
  try {
    // Set default options if not provided
    const defaultOptions = {
      includeExecutiveSummary: true,
      includeDepartmentAnalytics: true,
      includeOrgChart: false,
      includeEmployeeDirectory: true,
      includeCustomFields: true
    };

    const exportOptions = { ...defaultOptions, ...options };

    // Use consistent page format regardless of device resolution
    // Always use A4 for consistency across all devices
    const pageFormat = 'a4';
    const orientation = shouldUseLandscape(employees, orgChartElement) ? 'landscape' : 'portrait';
    
    // Create PDF with optimal settings
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageFormat,
      compress: true,
      putOnlyUsedFonts: true
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = Math.max(15, pageWidth * 0.05); // Adaptive margins
    const contentWidth = pageWidth - (margin * 2);
    
    // Beautiful color scheme
    const colors = {
      primary: '#1e40af',     // Professional blue
      secondary: '#64748b',   // Slate gray
      accent: '#3b82f6',      // Bright blue
      success: '#059669',     // Green
      warning: '#d97706',     // Orange
      text: '#1f2937',        // Dark gray
      lightText: '#6b7280',   // Medium gray
      background: '#f8fafc',  // Light gray
      white: '#ffffff'
    };
    
    let currentY = margin;
    
    // Professional Header with Company Branding
    await addPDFHeader(doc, colors, margin, pageWidth, currentY);
    currentY += 45;
    
    
    // Conditionally add Executive Summary Section
    if (exportOptions.includeExecutiveSummary) {
      currentY = await addExecutiveSummary(doc, employees, colors, margin, contentWidth, currentY, pageHeight);
    currentY += 15;
    }
    
    // Conditionally add Department Analytics with Beautiful Charts
    if (exportOptions.includeDepartmentAnalytics) {
    currentY = await addDepartmentAnalytics(doc, employees, colors, margin, contentWidth, currentY, pageHeight);
    }

    // Conditionally add org chart visualization if available (disabled by default)
    if (exportOptions.includeOrgChart && orgChartElement) {
      currentY = await addOrgChartVisualization(doc, orgChartElement, colors, margin, contentWidth, currentY, pageHeight, false);
    }

    // Conditionally add Employee Directory with Professional Layout
    if (exportOptions.includeEmployeeDirectory) {
      const isOnlySection = !exportOptions.includeExecutiveSummary && !exportOptions.includeDepartmentAnalytics && !exportOptions.includeOrgChart;
      await addEmployeeDirectory(doc, employees, colors, margin, contentWidth, pageWidth, pageHeight, exportOptions.includeCustomFields, isOnlySection, exportOptions);
    }
    
    // Add footer to all pages
    addPDFFooter(doc, colors, pageWidth, pageHeight, margin);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `organizational-chart-${timestamp}.pdf`;
    
    // Save with optimal compression
    doc.save(filename);
    
    return { success: true, filename };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Determine if landscape orientation is better
const shouldUseLandscape = (employees, orgChartElement) => {
  const hasLargeOrgChart = orgChartElement && employees.length > 10;
  const hasWideStructure = calculateOrgWidth(employees) > calculateOrgHeight(employees);
  return hasLargeOrgChart || hasWideStructure || employees.length > 25;
};

// Add professional header
const addPDFHeader = async (doc, colors, margin, pageWidth, startY) => {
  // Background header bar
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Company title
  doc.setTextColor(colors.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANIZATIONAL CHART REPORT', margin, startY + 8);
  
  // Date only (no "Generated on" text)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(currentDate, margin, startY + 18);
  

};

// Add executive summary with metrics
const addExecutiveSummary = async (doc, employees, colors, margin, contentWidth, startY, pageHeight) => {
  const headerHeight = 45; // Header takes up 45 units
  const footerHeight = 20;
  const safeTop = margin + headerHeight + 10; // Safe area from top
  const safeBottom = pageHeight - footerHeight - 10;

  doc.setTextColor(colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, startY);
  
  let currentY = startY + 12;
  
  // Key metrics in a professional layout
  const metrics = calculateKeyMetrics(employees);
  const boxWidth = contentWidth / 4;
  const boxHeight = 25;
  
  // Check if metrics fit on current page
  const totalMetricsHeight = boxHeight + 10;
  if (currentY + totalMetricsHeight > safeBottom) {
    doc.addPage();
    currentY = safeTop;
    // Re-add section header on new page
    doc.setTextColor(colors.text);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, currentY);
    currentY += 15;
  }
  
  metrics.forEach((metric, index) => {
    const x = margin + (index * boxWidth);
    
    // Metric box background
    doc.setFillColor(index % 2 === 0 ? colors.background : colors.white);
    doc.rect(x, currentY - 5, boxWidth - 2, boxHeight, 'F');
    
    // Metric value
    doc.setTextColor(colors.primary);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const textWidth = doc.getStringUnitWidth(metric.value) * 20 / doc.internal.scaleFactor;
    doc.text(metric.value, x + (boxWidth - textWidth) / 2, currentY + 5);
    
    // Metric label
    doc.setTextColor(colors.lightText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const labelWidth = doc.getStringUnitWidth(metric.label) * 10 / doc.internal.scaleFactor;
    doc.text(metric.label, x + (boxWidth - labelWidth) / 2, currentY + 12);
  });
  
  return currentY + boxHeight + 10;
};

// Calculate key organizational metrics
const calculateKeyMetrics = (employees) => {
  const departments = [...new Set(employees.map(emp => emp.department))];
  const managers = employees.filter(emp => 
    employees.some(subordinate => subordinate.managerId === emp.id)
  );
  const avgTeamSize = managers.length > 0 ? 
    Math.round(employees.length / managers.length * 10) / 10 : 0;
  
  return [
    { value: employees.length.toString(), label: 'Total Employees' },
    { value: departments.length.toString(), label: 'Departments' },
    { value: managers.length.toString(), label: 'Managers' },
    { value: avgTeamSize.toString(), label: 'Avg Team Size' }
  ];
};

// Add department analytics with visual charts
const addDepartmentAnalytics = async (doc, employees, colors, margin, contentWidth, startY, pageHeight) => {
  const headerHeight = 45; // Header takes up 45 units
  const footerHeight = 20;
  const safeTop = margin + headerHeight + 10; // Safe area from top
  const safeBottom = pageHeight - footerHeight - 10;

  doc.setTextColor(colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Department Analytics', margin, startY);
  
  let currentY = startY + 15;
  
  // Department breakdown
  const deptStats = calculateDepartmentStats(employees);
  const maxCount = Math.max(...deptStats.map(d => d.count));
  
  deptStats.forEach((dept, index) => {
    // Each department entry takes approximately 15 units height
    if (currentY > safeBottom - 15) {
      doc.addPage();
      currentY = safeTop;
      // Re-add section header on new page
      doc.setTextColor(colors.text);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Department Analytics', margin, currentY);
      currentY += 20;
    }
    
    // Department name
    doc.setTextColor(colors.text);
  doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(dept.name, margin, currentY);
    
    // Employee count
    doc.setTextColor(colors.lightText);
    doc.setFont('helvetica', 'normal');
    doc.text(`${dept.count} employees`, margin + 60, currentY);
    
    // Visual bar chart
    const barWidth = (dept.count / maxCount) * (contentWidth - 120);
    const barColor = colors.accent;
    doc.setFillColor(barColor);
    doc.rect(margin + 100, currentY - 4, Math.max(barWidth, 2), 6, 'F');
    
    // Percentage
    const percentage = ((dept.count / employees.length) * 100).toFixed(1);
    doc.setTextColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`${percentage}%`, margin + contentWidth - 20, currentY);
    
    currentY += 12;
  });
  
  return currentY + 10;
};

// Calculate department statistics
const calculateDepartmentStats = (employees) => {
  const deptCount = {};
  employees.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });
  
  return Object.entries(deptCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// Add org chart visualization
const addOrgChartVisualization = async (doc, orgChartElement, colors, margin, contentWidth, startY, pageHeight, isHighRes) => {
  try {
    doc.setTextColor(colors.text);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Organizational Structure', margin, startY);
    
    // Check if we need a new page
    if (startY > pageHeight - 100) {
      doc.addPage();
      startY = margin + 20;
      doc.text('Organizational Structure', margin, startY);
    }
    
    const chartY = startY + 15;
    
    // Add text-based organizational structure (html2canvas removed)
    doc.setTextColor(colors.lightText);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Organizational chart visualization has been disabled to remove html2canvas dependency.', margin, chartY);
    doc.text('Consider using the Employee Directory section for detailed employee information.', margin, chartY + 10);

    return chartY + 30;
    
  } catch (error) {
    // Add a placeholder text instead
    doc.setTextColor(colors.lightText);
    doc.setFontSize(12);
    doc.text('Organizational structure section not available', margin + 20, startY + 30);
    return startY + 50;
  }
};

// Add comprehensive employee directory as a table
const addEmployeeDirectory = async (doc, employees, colors, margin, contentWidth, pageWidth, pageHeight, includeCustomFields = true, isOnlySection = false, exportOptions = {}) => {
  // Define safe areas (accounting for header and footer)
  const headerHeight = 45; // Header takes up 45 units
  const footerHeight = 20; // Footer takes up 20 units
  const safeTop = margin + headerHeight + 10; // Safe area from top
  const safeBottom = pageHeight - footerHeight - 10; // Safe area from bottom

  // Only add new page if there are other sections (avoid blank page)
  if (!isOnlySection) {
  doc.addPage();
  }
  
  let currentY = safeTop - 30; // Start higher up to maximize space
  
  // Beautiful header with styling
  doc.setTextColor(colors.primary);
  doc.setFontSize(18); // Slightly smaller font
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Directory', margin, currentY);

  // Add a decorative line under the header
  doc.setDrawColor(colors.primary);
  doc.setLineWidth(2);
  doc.line(margin, currentY + 3, Math.min(margin + 180, margin + contentWidth * 0.35), currentY + 3);

  currentY += 20; // Less spacing

  // Get custom fields for table columns
  const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
  const defaultFields = JSON.parse(localStorage.getItem('defaultFields') || '{}');

  // Define table columns
  const baseColumns = [
    { key: 'name', title: 'Name', width: 0.2 },
    { key: 'position', title: 'Position', width: 0.2 },
    { key: 'department', title: 'Department', width: 0.2 },
    { key: 'email', title: 'Email', width: 0.2 },
    { key: 'phone', title: 'Phone', width: 0.2 }
  ];

  // Add custom fields as columns if enabled and includeCustomFields is true
  const customColumns = customFields
    .filter(field => defaultFields[field.name] !== false && includeCustomFields)
    .map(field => ({
      key: field.name,
      title: field.name,
      width: 0.12
    }));

  const tableColumns = [...baseColumns, ...customColumns];

  // Calculate column widths
  const totalWidth = tableColumns.reduce((sum, col) => sum + col.width, 0);
  tableColumns.forEach(col => {
    col.actualWidth = (col.width / totalWidth) * contentWidth;
  });

  // Sort employees alphabetically by name
  const sortedEmployees = [...employees].sort((a, b) => {
    return (a.name || '').localeCompare(b.name || '');
  });
  
  // Check if we need space for table header + at least one row
  const tableHeaderHeight = 15;
  const rowHeight = 12;
  const minSpaceNeeded = tableHeaderHeight + rowHeight + 10;
  
  if (currentY + minSpaceNeeded > safeBottom) {
      doc.addPage();
    currentY = safeTop;
  }

    // Single table header for all employees
  let headerX = margin;

  // First pass: Draw all backgrounds and lines
  tableColumns.forEach((col, index) => {
    // Header background - more compact
    doc.setFillColor(colors.primary);
    doc.rect(headerX, currentY - 1, col.actualWidth, 10, 'F');
    headerX += col.actualWidth;
  });

  // Second pass: Draw all header text (ensures text is on top)
  headerX = margin;
  tableColumns.forEach((col, index) => {
    doc.setTextColor(colors.white);
    doc.setFontSize(8); // Smaller font
    doc.setFont('helvetica', 'bold');
    doc.text(col.title, headerX + 2, currentY + 5); // Adjusted positioning
    headerX += col.actualWidth;
  });

  currentY += 12;

  // Calculate and draw continuous vertical lines for the entire table
  // We'll determine the table boundaries after processing all rows
  let tableStartY = currentY;
  let tableEndY = currentY;

  // Process all employees to determine table boundaries
  sortedEmployees.forEach((emp, empIndex) => {
    // Calculate dynamic row height based on content
    let maxLinesInRow = 1;
    tableColumns.forEach((col, colIndex) => {
      let cellValue = '';
      if (col.key === 'name') {
        cellValue = emp.name || '';
      } else if (col.key === 'position') {
        cellValue = emp.position || '';
      } else if (col.key === 'email') {
        cellValue = emp.email || '';
      } else if (col.key === 'phone') {
        cellValue = emp.phone || '';
      } else if (col.key === 'department') {
        cellValue = emp.department || '';
      } else {
        // Custom field - only include if custom fields are enabled
        cellValue = includeCustomFields ? emp[col.key] || '' : '';
      }

      const cellPadding = 2; // Use same padding as in the cell rendering
      const availableTextWidth = col.actualWidth - (cellPadding * 2);
      const lines = doc.splitTextToSize(cellValue, availableTextWidth);
      maxLinesInRow = Math.max(maxLinesInRow, Array.isArray(lines) ? lines.length : 1);
    });

    // Cap max lines to prevent excessive row heights
    const cappedMaxLines = Math.min(maxLinesInRow, 3); // Max 3 lines per row
    const dynamicRowHeight = Math.max(12, cappedMaxLines * 6 + 6); // Base 6 + 6 per line

    // Check if we need a new page
    if (currentY + dynamicRowHeight > safeBottom - 10) {
      // Draw continuous vertical lines for current table section - REMOVED

      doc.addPage();
      currentY = safeTop - 30; // Start higher on new page

      // Re-add table header on new page
      headerX = margin;

      // First pass: Draw all backgrounds and lines
      tableColumns.forEach((col, index) => {
        doc.setFillColor(colors.primary);
        doc.rect(headerX, currentY - 1, col.actualWidth, 10, 'F');
        headerX += col.actualWidth;
      });

      // Second pass: Draw all header text
      headerX = margin;
      tableColumns.forEach((col, index) => {
        doc.setTextColor(colors.white);
        doc.setFontSize(8); // Smaller font
        doc.setFont('helvetica', 'bold');
        doc.text(col.title, headerX + 2, currentY + 5); // Adjusted positioning
        headerX += col.actualWidth;
      });

      currentY += 12; // Less spacing after header

      // Reset table boundaries for new page
      tableStartY = currentY;
    }

    tableEndY = currentY + dynamicRowHeight;
  });

  // Draw final continuous vertical lines for the last table section - REMOVED // Less spacing after header

  // Table rows for all employees
  // Font settings will be set individually for each cell for consistency

  sortedEmployees.forEach((emp, empIndex) => {
    // Calculate dynamic row height based on content
    let maxLinesInRow = 1;
    tableColumns.forEach((col, colIndex) => {
      let cellValue = '';
      if (col.key === 'name') {
        cellValue = emp.name || '';
      } else if (col.key === 'position') {
        cellValue = emp.position || '';
      } else if (col.key === 'email') {
        cellValue = emp.email || '';
      } else if (col.key === 'phone') {
        cellValue = emp.phone || '';
      } else if (col.key === 'department') {
        cellValue = emp.department || '';
      } else {
        // Custom field - only include if custom fields are enabled
        cellValue = includeCustomFields ? emp[col.key] || '' : '';
      }

      const cellPadding = 2; // Use same padding as in the cell rendering
      const availableTextWidth = col.actualWidth - (cellPadding * 2);
      const lines = doc.splitTextToSize(cellValue, availableTextWidth);
      maxLinesInRow = Math.max(maxLinesInRow, Array.isArray(lines) ? lines.length : 1);
    });

    // Cap max lines to prevent excessive row heights
    const cappedMaxLines = Math.min(maxLinesInRow, 3); // Max 3 lines per row
    const dynamicRowHeight = Math.max(12, cappedMaxLines * 6 + 6); // Base 6 + 6 per line

    // Simple page break: check if current employee fits
    // Use minimal margin to maximize space utilization
    if (currentY + dynamicRowHeight > safeBottom - 10) { // Minimal margin
      doc.addPage();
      currentY = safeTop - 30; // Start higher on new page

      // Re-add table header on new page
      headerX = margin;

      // First pass: Draw all backgrounds and lines
      tableColumns.forEach((col, index) => {
        doc.setFillColor(colors.primary);
        doc.rect(headerX, currentY - 2, col.actualWidth, 12, 'F');
        headerX += col.actualWidth;

                // Vertical lines removed
      });

      // Second pass: Draw all header text
      headerX = margin;
      tableColumns.forEach((col, index) => {
        doc.setTextColor(colors.white);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(col.title, headerX + 3, currentY + 6);
        headerX += col.actualWidth;
      });

      currentY += 15;
    }

    // Alternate row colors with dynamic height - more compact
    const rowBgColor = empIndex % 2 === 0 ? colors.white : colors.background;
    doc.setFillColor(rowBgColor);
    doc.rect(margin, currentY - 1, contentWidth, dynamicRowHeight, 'F');

    // Draw row content
    let rowX = margin;
    tableColumns.forEach((col, colIndex) => {
      // Ensure consistent font settings for each cell
  doc.setTextColor(colors.text);
      doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

      let cellValue = '';
      if (col.key === 'name') {
        cellValue = emp.name || '';
      } else if (col.key === 'position') {
        cellValue = emp.position || '';
      } else if (col.key === 'email') {
        cellValue = emp.email || '';
      } else if (col.key === 'phone') {
        cellValue = emp.phone || '';
      } else if (col.key === 'department') {
        cellValue = emp.department || '';
      } else {
        // Custom field - only include if custom fields are enabled
        cellValue = includeCustomFields ? emp[col.key] || '' : '';
      }

      // Calculate safe text width to prevent overflow into next cell
      const cellPadding = 2; // Reduced padding for better text flow
      const availableTextWidth = col.actualWidth - (cellPadding * 2);

      // Split text into multiple lines if needed
      const lines = doc.splitTextToSize(cellValue, availableTextWidth);

      // Position text with proper padding - supports multiple lines
      doc.text(lines, rowX + cellPadding, currentY + 4); // Slightly higher positioning

      rowX += col.actualWidth;

      // Vertical lines removed
    });

    currentY += dynamicRowHeight + 2; // Minimal spacing between rows
  });
};

// Add footer to all pages
const addPDFFooter = (doc, colors, pageWidth, pageHeight, margin) => {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(colors.secondary);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Page number only (centered)
    doc.setTextColor(colors.lightText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const pageText = `Page ${i} of ${totalPages}`;
    const pageTextWidth = doc.getStringUnitWidth(pageText) * 9 / doc.internal.scaleFactor;
    const centerX = (pageWidth - pageTextWidth) / 2;
    doc.text(pageText, centerX, pageHeight - 8);
  }
};

// Calculate organizational structure dimensions
const calculateOrgWidth = (employees) => {
  const levels = buildOrgLevels(employees);
  return Math.max(...levels.map(level => level.length));
};

const calculateOrgHeight = (employees) => {
  const levels = buildOrgLevels(employees);
  return levels.length;
};

const buildOrgLevels = (employees) => {
  const levels = [];
  const processed = new Set();
  
  // Find root employees (no manager)
  const roots = employees.filter(emp => !emp.managerId);
  levels.push(roots);
  roots.forEach(emp => processed.add(emp.id));
  
  let currentLevel = 0;
  while (currentLevel < levels.length && levels[currentLevel].length > 0) {
    const nextLevel = [];
    levels[currentLevel].forEach(manager => {
      const subordinates = employees.filter(emp => 
        emp.managerId === manager.id && !processed.has(emp.id)
      );
      nextLevel.push(...subordinates);
      subordinates.forEach(sub => processed.add(sub.id));
    });
    
    if (nextLevel.length > 0) {
      levels.push(nextLevel);
    }
    currentLevel++;
  }
  
  return levels;
};

// CSV Export Functions
export const exportToCSV = (employees) => {
  // Load custom fields and field settings from localStorage
  const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
  const defaultFields = JSON.parse(localStorage.getItem('defaultFields') || '{}');

  // Build the CSV data structure with all enabled fields
  const csvData = employees.map(emp => {
    const rowData = {};

    // Add default fields if they are enabled
    if (defaultFields.name !== false) rowData.Name = emp.name || '';
    if (defaultFields.position !== false) rowData.Position = emp.position || '';
    if (defaultFields.department !== false) rowData.Department = emp.department || '';
    if (defaultFields.email !== false) rowData.Email = emp.email || '';
    if (defaultFields.phone !== false) rowData.Phone = emp.phone || '';
    if (defaultFields.managerId !== false) rowData.Manager = getManagerName(emp.managerId, employees);

    // Add enabled custom fields
    customFields.forEach(field => {
      if (defaultFields[field.name] !== false) {
        rowData[field.name] = emp[field.name] || '';
      }
    });

    return rowData;
  });

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// CSV Import Functions
// Function to intelligently map CSV columns to employee fields
const mapCSVColumns = (headers, sampleData) => {
  const mapping = {
    name: null,
    position: null,
    department: null,
    email: null,
    phone: null,
    manager: null
  };

  // Common field name variations
  const nameVariations = ['name', 'fullname', 'full name', 'employee name', 'სახელი', 'name', 'Name', 'Full Name', 'Employee Name', 'სახელი'];
  const positionVariations = ['position', 'title', 'job title', 'role', 'პოზიცია', 'position', 'job', 'Position', 'Title', 'Job Title', 'Role', 'პოზიცია'];
  const departmentVariations = ['department', 'dept', 'division', 'დეპარტამენტი', 'department', 'Department', 'Dept', 'Division', 'დეპარტამენტი'];
  const emailVariations = ['email', 'e-mail', 'email address', 'ელფოსტა', 'email', 'Email', 'E-mail', 'Email Address', 'ელფოსტა'];
  const phoneVariations = ['phone', 'telephone', 'phone number', 'mobile', 'ტელეფონი', 'phone', 'Phone', 'Telephone', 'Phone Number', 'Mobile', 'ტელეფონი'];
  const managerVariations = ['manager', 'supervisor', 'boss', 'მენეჯერი', 'manager', 'Manager', 'Supervisor', 'Boss', 'მენეჯერი'];

  // First pass: exact matches with common variations
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase().trim();

    if (nameVariations.some(v => lowerHeader.includes(v)) && !mapping.name) {
      mapping.name = header;
    } else if (positionVariations.some(v => lowerHeader.includes(v)) && !mapping.position) {
      mapping.position = header;
    } else if (departmentVariations.some(v => lowerHeader.includes(v)) && !mapping.department) {
      mapping.department = header;
    } else if (emailVariations.some(v => lowerHeader.includes(v)) && !mapping.email) {
      mapping.email = header;
    } else if (phoneVariations.some(v => lowerHeader.includes(v)) && !mapping.phone) {
      mapping.phone = header;
    } else if (managerVariations.some(v => lowerHeader.includes(v)) && !mapping.manager) {
      mapping.manager = header;
    }
  });

  // Second pass: detect by data patterns if fields are still unmapped
  if (sampleData && sampleData.length > 0) {
    headers.forEach((header, index) => {
      if (mapping.name && mapping.position && mapping.department && mapping.email && mapping.phone && mapping.manager) {
        return; // All fields mapped
      }

      const sampleValues = sampleData.slice(0, 3).map(row => row[header]).filter(val => val && val.trim());

      if (sampleValues.length === 0) return;

      // Check for email pattern
      if (!mapping.email && sampleValues.every(val => /\S+@\S+\.\S+/.test(val))) {
        mapping.email = header;
        return;
      }

      // Check for phone pattern
      if (!mapping.phone && sampleValues.every(val => /^[\+]?[\d\s\-\(\)]{7,}$/.test(val))) {
        mapping.phone = header;
        return;
      }

      // Check for manager references (names that appear in other rows)
      if (!mapping.manager) {
        const allNames = sampleData.map(row => row[mapping.name || 'name'] || row['Name'] || '').filter(n => n);
        const hasManagerRefs = sampleValues.some(val =>
          allNames.some(name => name && val.includes(name))
        );
        if (hasManagerRefs) {
          mapping.manager = header;
          return;
        }
      }
    });
  }

  return mapping;
};

export const importFromCSV = (file, onImport, existingEmployees = []) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      // Load custom fields and field settings from localStorage
      const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
      const defaultFields = JSON.parse(localStorage.getItem('defaultFields') || '{}');
      const requiredFields = JSON.parse(localStorage.getItem('requiredFields') || '{}');

      // Create column mapping
      const headers = results.meta.fields || [];
      const columnMapping = mapCSVColumns(headers, results.data);

      // First pass: Create employees with basic data
      const importedEmployees = results.data.map((row, index) => {
        const employee = {
          id: Date.now() + index, // Generate unique IDs
          managerId: null, // Will be resolved in second pass
          image: null
        };

        // Import default fields if they are enabled
        if (defaultFields.name !== false && columnMapping.name) {
          employee.name = row[columnMapping.name] || '';
        }
        if (defaultFields.position !== false && columnMapping.position) {
          employee.position = row[columnMapping.position] || '';
        }
        if (defaultFields.department !== false && columnMapping.department) {
          employee.department = row[columnMapping.department] || '';
        }
        if (defaultFields.email !== false && columnMapping.email) {
          employee.email = row[columnMapping.email] || '';
        }
        if (defaultFields.phone !== false && columnMapping.phone) {
          employee.phone = row[columnMapping.phone] || '';
        }

        // Import custom fields if they are enabled
        customFields.forEach(field => {
          if (defaultFields[field.name] !== false) {
            const csvValue = row[field.name];
            if (csvValue !== undefined && csvValue !== null && csvValue !== '') {
              employee[field.name] = csvValue;
            } else {
              employee[field.name] = '';
            }
          }
        });

        return employee;
      }).filter(emp => {
        // Filter out empty rows - check if at least name and position are present if they are enabled
        const hasRequiredData = (!defaultFields.name || !requiredFields.name || emp.name?.trim()) &&
                               (!defaultFields.position || !requiredFields.position || emp.position?.trim());
        return hasRequiredData;
      });

      // Second pass: Resolve manager relationships
      const allEmployees = [...existingEmployees, ...importedEmployees];

      importedEmployees.forEach(employee => {
        // Get manager name from CSV row - find matching row by name (or name + position for uniqueness)
        const csvRow = results.data.find(row => {
          const rowName = row[columnMapping.name] || '';
          // First try exact name match
          if (rowName === employee.name) {
            return true;
          }
          // If no exact match, try name + position match for disambiguation
          if (columnMapping.position) {
            const rowPosition = row[columnMapping.position] || '';
            return rowName === employee.name && rowPosition === employee.position;
          }
          return false;
        });

        if (csvRow && columnMapping.manager && csvRow[columnMapping.manager] && csvRow[columnMapping.manager].trim()) {
          const managerName = csvRow[columnMapping.manager].trim();

          // Skip if manager is "No Manager" or similar
          if (managerName.toLowerCase() === 'no manager' ||
              managerName.toLowerCase() === '' ||
              managerName === 'null' ||
              managerName.toLowerCase() === 'none') {
            return;
          }

          // Find manager by name in all employees (existing + newly imported)
          // Try multiple matching strategies
          let manager = allEmployees.find(emp =>
            emp.name && emp.name === managerName
          );

          // Try case-insensitive match
          if (!manager) {
            manager = allEmployees.find(emp =>
              emp.name && emp.name.toLowerCase() === managerName.toLowerCase()
            );
          }

          // Try partial match (in case of name variations)
          if (!manager) {
            manager = allEmployees.find(emp =>
              emp.name && (
                emp.name.toLowerCase().includes(managerName.toLowerCase()) ||
                managerName.toLowerCase().includes(emp.name.toLowerCase())
              )
            );
          }

          if (manager) {
            employee.managerId = manager.id;
          }
        }
      });

      onImport(importedEmployees);
    },
    error: (error) => {
      alert('Error importing CSV file. Please check the file format.');
    }
  });
};

// Helper function to get manager name
const getManagerName = (managerId, employees) => {
  if (!managerId) return 'No Manager';
  const manager = employees.find(emp => emp.id === managerId);
  return manager ? manager.name : 'Unknown Manager';
};

// Generate CSV template
export const downloadCSVTemplate = () => {
  // Load custom fields and field settings from localStorage
  const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
  const defaultFields = JSON.parse(localStorage.getItem('defaultFields') || '{}');

  // Create template data with all enabled fields
  const templateRow1 = {};
  const templateRow2 = {};

  // Add default fields if they are enabled
  if (defaultFields.name !== false) {
    templateRow1.Name = 'John Smith';
    templateRow2.Name = 'Sarah Johnson';
  }
  if (defaultFields.position !== false) {
    templateRow1.Position = 'CEO';
    templateRow2.Position = 'CTO';
  }
  if (defaultFields.department !== false) {
    templateRow1.Department = 'Executive';
    templateRow2.Department = 'Technology';
  }
  if (defaultFields.email !== false) {
    templateRow1.Email = 'john.smith@company.com';
    templateRow2.Email = 'sarah.johnson@company.com';
  }
  if (defaultFields.phone !== false) {
    templateRow1.Phone = '+1-555-0101';
    templateRow2.Phone = '+1-555-0102';
  }
  if (defaultFields.managerId !== false) {
    templateRow1.Manager = '';
    templateRow2.Manager = 'John Smith';
  }

  // Add enabled custom fields to template
  customFields.forEach(field => {
    if (defaultFields[field.name] !== false) {
      // Provide sample data based on field type
      switch (field.type) {
        case 'email':
          templateRow1[field.name] = 'john.smith@company.com';
          templateRow2[field.name] = 'sarah.johnson@company.com';
          break;
        case 'phone':
          templateRow1[field.name] = '+1-555-0101';
          templateRow2[field.name] = '+1-555-0102';
          break;
        case 'number':
          templateRow1[field.name] = '100000';
          templateRow2[field.name] = '150000';
          break;
        case 'date':
          templateRow1[field.name] = '2024-01-15';
          templateRow2[field.name] = '2023-06-20';
          break;
        case 'dropdown':
          templateRow1[field.name] = field.options && field.options.length > 0 ? field.options[0] : 'Option 1';
          templateRow2[field.name] = field.options && field.options.length > 1 ? field.options[1] : 'Option 2';
          break;
        default:
          templateRow1[field.name] = `Sample ${field.name}`;
          templateRow2[field.name] = `Another ${field.name}`;
      }
    }
  });

  const templateData = [templateRow1, templateRow2];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
