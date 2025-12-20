import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, UserCheck } from 'lucide-react';
import './EmployeeForm.css';

const EmployeeForm = ({ employee, employees, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    managerId: ''
  });

  const [customFields, setCustomFields] = useState([]);
  const [defaultFields, setDefaultFields] = useState({});
  const [requiredFields, setRequiredFields] = useState({});
  const [errors, setErrors] = useState({});

  // Load custom fields and default fields from localStorage
  useEffect(() => {
    const savedCustomFields = localStorage.getItem('customFields');
    const savedDefaultFields = localStorage.getItem('defaultFields');
    const savedRequiredFields = localStorage.getItem('requiredFields');
    
    if (savedCustomFields) {
      const fields = JSON.parse(savedCustomFields);
      setCustomFields(fields);
      
      // Initialize custom field values in formData
      const customFieldData = {};
      fields.forEach(field => {
        customFieldData[field.name] = '';
      });
      
      setFormData(prev => ({
        ...prev,
        ...customFieldData
      }));
    }

    if (savedDefaultFields) {
      setDefaultFields(JSON.parse(savedDefaultFields));
    } else {
      // Default to all fields enabled if no settings exist
      setDefaultFields({
        name: true,
        position: true,
        department: true,
        email: true,
        phone: true,
        managerId: true
      });
    }

    if (savedRequiredFields) {
      setRequiredFields(JSON.parse(savedRequiredFields));
    } else {
      // Default required fields if no settings exist
      setRequiredFields({
        name: true,
        position: true,
        department: true,
        email: true,
        phone: true,
        managerId: false
      });
    }
  }, []);

  // Generate random employee data
  const generateRandomEmployee = () => {
    const names = [
      'Emma Wilson', 'James Brown', 'Sophia Davis', 'Michael Johnson', 'Olivia Garcia',
      'David Miller', 'Ava Rodriguez', 'Christopher Martinez', 'Isabella Anderson', 'Daniel Taylor',
      'Mia Thomas', 'Matthew Jackson', 'Charlotte White', 'Andrew Harris', 'Amelia Martin',
      'Joshua Thompson', 'Harper Garcia', 'Ryan Moore', 'Evelyn Lee', 'Nicholas Clark'
    ];
    
    const positions = [
      'Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Specialist',
      'Sales Representative', 'HR Coordinator', 'Financial Analyst', 'Operations Manager', 'Customer Success',
      'Business Analyst', 'DevOps Engineer', 'Content Strategist', 'Project Manager', 'Quality Assurance',
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI Designer', 'Technical Lead'
    ];
    
    const departments = [
      'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Human Resources', 
      'Finance', 'Operations', 'Customer Success', 'Business Development', 'Research & Development'
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
    const randomEmail = `${randomName.toLowerCase().replace(' ', '.')}@company.com`;
    const randomPhone = `+1-555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    
    return {
      name: randomName,
      position: randomPosition,
      department: randomDepartment,
      email: randomEmail,
      phone: randomPhone,
      managerId: ''
    };
  };

  useEffect(() => {
    if (employee) {
      // Load employee data including custom fields
      const employeeData = {
        name: employee.name || '',
        position: employee.position || '',
        department: employee.department || '',
        email: employee.email || '',
        phone: employee.phone || '',
        managerId: employee.managerId ? employee.managerId.toString() : ''
      };
      
      // Add custom fields from employee data
      customFields.forEach(field => {
        employeeData[field.name] = employee[field.name] || '';
      });
      
      setFormData(employeeData);
    } else {
      // Fill with random data for new employees
      const randomData = generateRandomEmployee();
      
      // Add empty custom fields
      customFields.forEach(field => {
        randomData[field.name] = '';
      });
      
      setFormData(randomData);
    }
    setErrors({});
  }, [employee, customFields, defaultFields, requiredFields]);

  const validateForm = () => {
    const newErrors = {};

    // Only validate fields that are enabled and required
    if (defaultFields.name && requiredFields.name && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (defaultFields.position && requiredFields.position && !formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (defaultFields.department && requiredFields.department && !formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (defaultFields.email && requiredFields.email && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (defaultFields.email && formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (defaultFields.phone && requiredFields.phone && !formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    // Validate custom fields that are enabled and required
    customFields.forEach(field => {
      if (defaultFields[field.name] && requiredFields[field.name] && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.name} is required`;
      }
      
      // Validate email type custom fields
      if (defaultFields[field.name] && field.type === 'email' && formData[field.name]?.trim()) {
        if (!/\S+@\S+\.\S+/.test(formData[field.name])) {
          newErrors[field.name] = `${field.name} is invalid`;
        }
      }
    });

    // Check for circular references
    if (defaultFields.managerId && formData.managerId && employee) {
      const managerId = parseInt(formData.managerId);
      if (managerId === employee.id) {
        newErrors.managerId = 'Employee cannot be their own manager';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getAvailableManagers = () => {
    if (!employee) return employees;
    
    // Filter out the current employee and their subordinates
    const subordinates = new Set();
    const findSubordinates = (empId) => {
      employees.forEach(emp => {
        if (emp.managerId === empId) {
          subordinates.add(emp.id);
          findSubordinates(emp.id);
        }
      });
    };
    findSubordinates(employee.id);
    
    return employees.filter(emp => emp.id !== employee.id && !subordinates.has(emp.id));
  };

  return (
    <div className="employee-form">
      <div className="form-header">
        <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
        <button className="close-btn" onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-grid">
            {defaultFields.name && (
              <div className="form-group">
                <label htmlFor="name">
                  <User size={16} />
                  Full Name {requiredFields.name && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            {defaultFields.position && (
              <div className="form-group">
                <label htmlFor="position">
                  <UserCheck size={16} />
                  Position {requiredFields.position && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Enter job position"
                  className={errors.position ? 'error' : ''}
                />
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>
            )}

            {defaultFields.department && (
              <div className="form-group">
                <label htmlFor="department">
                  <Building size={16} />
                  Department {requiredFields.department && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                  className={errors.department ? 'error' : ''}
                />
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>
            )}

            {defaultFields.email && (
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email {requiredFields.email && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            )}

            {defaultFields.phone && (
              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={16} />
                  Phone {requiredFields.phone && <span className="required-asterisk">*</span>}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            )}

            {defaultFields.managerId && (
              <div className="form-group">
                <label htmlFor="managerId">
                  <UserCheck size={16} />
                  Manager
                </label>
                <select
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className={errors.managerId ? 'error' : ''}
                >
                  <option value="">No Manager (Top Level)</option>
                  {getAvailableManagers().map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>
                {errors.managerId && <span className="error-message">{errors.managerId}</span>}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="custom-field-group">
              {customFields.map(field => (
                defaultFields[field.name] && (
                  <div key={field.id} className="form-group">
                                         <label htmlFor={field.name}>
                       <UserCheck size={16} />
                       {field.name} {requiredFields[field.name] && <span className="required-asterisk">*</span>}
                     </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className={errors[field.name] ? 'error' : ''}
                      />
                    )}
                    {field.type === 'email' && (
                      <input
                        type="email"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className={errors[field.name] ? 'error' : ''}
                      />
                    )}
                    {field.type === 'phone' && (
                      <input
                        type="tel"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className={errors[field.name] ? 'error' : ''}
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className={errors[field.name] ? 'error' : ''}
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        className={errors[field.name] ? 'error' : ''}
                      />
                    )}
                    {field.type === 'dropdown' && (
                      <select
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        className={errors[field.name] ? 'error' : ''}
                      >
                        <option value="">Select {field.name.toLowerCase()}</option>
                        {field.options && field.options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors[field.name] && <span className="error-message">{errors[field.name]}</span>}
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {employee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
