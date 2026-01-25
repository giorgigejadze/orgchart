import React, { useState, useEffect } from 'react';
import { Edit, Trash2, User, Mail, Phone, Search, Filter, Eye, ChevronDown, ChevronUp, X, Sliders } from 'lucide-react';
import './EmployeeList.css';

const EmployeeList = ({ employees, onEditEmployee, onDeleteEmployee, onViewEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [filterPosition, setFilterPosition] = useState([]);
  const [filterManager, setFilterManager] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [customFields, setCustomFields] = useState([]);
  const [showAllCustomFields, setShowAllCustomFields] = useState(false);

  // Load custom fields from localStorage
  useEffect(() => {
    const savedCustomFields = localStorage.getItem('customFields');
    if (savedCustomFields) {
      setCustomFields(JSON.parse(savedCustomFields));
    }
  }, []);

  // Get unique values for filters
  const positions = [...new Set(employees.map(emp => emp.position))];
  const managers = [...new Set(employees.map(emp => emp.managerId).filter(Boolean))];

  // Filter and sort employees
  const filteredAndSortedEmployees = employees
    .filter(emp => {
      // Search filter
      let matchesSearch = true;
      if (searchTerm) {
        if (searchField === 'all') {
          matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customFields.some(field => 
                           emp[field.name] && 
                           emp[field.name].toString().toLowerCase().includes(searchTerm.toLowerCase())
                         );
        } else if (searchField === 'name') {
          matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchField === 'position') {
          matchesSearch = emp.position.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchField === 'email') {
          matchesSearch = emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchField === 'phone') {
          matchesSearch = emp.phone.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (customFields.find(field => field.name === searchField)) {
          matchesSearch = emp[searchField] && 
                         emp[searchField].toString().toLowerCase().includes(searchTerm.toLowerCase());
        }
      }

      // Position filter
      const matchesPosition = filterPosition.length === 0 || filterPosition.includes(emp.position);

      // Manager filter hidden from client view
      // const matchesManager = filterManager.length === 0 || filterManager.includes(emp.managerId);

      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Manager sorting hidden from client view
      // if (sortBy === 'managerId') {
      //   const aManager = employees.find(emp => emp.id === a.managerId);
      //   const bManager = employees.find(emp => emp.id === b.managerId);
      //   aValue = aManager ? aManager.name : 'No Manager';
      //   bValue = bManager ? bManager.name : 'No Manager';
      // }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getManagerName = (managerId) => {
    if (!managerId) return 'No Manager';
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? manager.name : 'Unknown Manager';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchField('all');
    setFilterPosition([]);
    setFilterManager([]);
    setSortBy('name');
    setSortOrder('asc');
  };

  const togglePositionFilter = (position) => {
    setFilterPosition(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const toggleManagerFilter = (managerId) => {
    setFilterManager(prev => 
      prev.includes(managerId) 
        ? prev.filter(m => m !== managerId)
        : [...prev, managerId]
    );
  };

  const hasActiveFilters = searchTerm || 
                          filterPosition.length > 0;
                          // filterManager.length > 0; // Manager filter hidden from client view

  // Determine which custom fields to show
  const visibleCustomFields = showAllCustomFields ? customFields : customFields.slice(0, 3);
  const hasMoreCustomFields = customFields.length > 3;
  const hiddenCustomFields = hasMoreCustomFields ? customFields.slice(3) : [];

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <User size={48} />
        <h2>No Employees Found</h2>
        <p>Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="employee-list">
      <div className="list-header">
        <div className="search-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="search-field-select"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="position">Position</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              {customFields.map(field => (
                <option key={field.id} value={field.name}>{field.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            className={`advanced-filters-btn ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Sliders size={16} />
            Advanced Filters
            {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={16} />
              Clear All
            </button>
          )}
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters-panel">
            <div className="filter-section">
              <h4>Positions</h4>
              <div className="filter-chips">
                {positions.map(position => (
                  <button
                    key={position}
                    className={`filter-chip ${filterPosition.includes(position) ? 'active' : ''}`}
                    onClick={() => togglePositionFilter(position)}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>

            {/* Manager filter hidden from client view - only available in edit modal */}
            {/* <div className="filter-section">
              <h4>Managers</h4>
              <div className="filter-chips">
                {managers.map(managerId => {
                  const manager = employees.find(emp => emp.id === managerId);
                  return (
                    <button
                      key={managerId}
                      className={`filter-chip ${filterManager.includes(managerId) ? 'active' : ''}`}
                      onClick={() => toggleManagerFilter(managerId)}
                    >
                      {manager ? manager.name : 'Unknown Manager'}
                    </button>
                  );
                })}
              </div>
            </div> */}
          </div>
        )}
        
        <div className="list-stats">
          <span>Showing {filteredAndSortedEmployees.length} of {employees.length} employees</span>
          {hasActiveFilters && (
            <div className="active-filters">
              {searchTerm && (
                <span className="active-filter">
                  Search: "{searchTerm}" in {searchField === 'all' ? 'all fields' : searchField}
                  <button onClick={() => setSearchTerm('')}><X size={12} /></button>
                </span>
              )}
              {filterPosition.length > 0 && (
                <span className="active-filter">
                  Positions: {filterPosition.join(', ')}
                  <button onClick={() => setFilterPosition([])}><X size={12} /></button>
                </span>
              )}
              {/* Manager filter hidden from client view */}
              {/* {filterManager.length > 0 && (
                <span className="active-filter">
                  Managers: {filterManager.map(id => {
                    const manager = employees.find(emp => emp.id === id);
                    return manager ? manager.name : 'Unknown';
                  }).join(', ')}
                  <button onClick={() => setFilterManager([])}><X size={12} /></button>
                </span>
              )} */}
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name
                {sortBy === 'name' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('position')} className="sortable">
                Position
                {sortBy === 'position' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                Department
                {sortBy === 'department' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Contact</th>
              {visibleCustomFields.map(field => (
                <th key={field.id} onClick={() => handleSort(field.name)} className="sortable">
                  {field.name}
                  {sortBy === field.name && (
                    <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
              {hasMoreCustomFields && !showAllCustomFields && (
                <th className="others-column">
                  <button 
                    className="others-toggle-btn"
                    onClick={() => setShowAllCustomFields(true)}
                    title={`Show ${hiddenCustomFields.length} more custom fields`}
                  >
                    Others ({hiddenCustomFields.length})
                  </button>
                </th>
              )}
              {hasMoreCustomFields && showAllCustomFields && (
                <th className="collapse-column">
                  <button 
                    className="collapse-toggle-btn"
                    onClick={() => setShowAllCustomFields(false)}
                    title="Collapse custom fields"
                  >
                    Collapse
                  </button>
                </th>
              )}
              {/* Manager column hidden from client view - only available in edit modal */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEmployees.map(employee => (
              <tr key={employee.id}>
                <td className="employee-name">
                  <div className="name-cell">
                    <div className="avatar">
                      {employee.image ? (
                        <img src={employee.image} alt={employee.name} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <span>{employee.name}</span>
                  </div>
                </td>
                <td>{employee.position}</td>
                <td>
                  <span className="department-badge">{employee.department}</span>
                </td>
                <td className="contact-info">
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{employee.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{employee.phone}</span>
                  </div>
                </td>
                {visibleCustomFields.map(field => (
                  <td key={field.id} className="custom-field-cell">
                    {employee[field.name] || '-'}
                  </td>
                ))}
                {hasMoreCustomFields && !showAllCustomFields && (
                  <td className="others-cell">
                    <button 
                      className="others-toggle-btn"
                      onClick={() => setShowAllCustomFields(true)}
                      title={`Show ${hiddenCustomFields.length} more custom fields`}
                    >
                      +{hiddenCustomFields.length}
                    </button>
                  </td>
                )}
                {hasMoreCustomFields && showAllCustomFields && (
                  <td className="collapse-cell">
                    <button 
                      className="collapse-toggle-btn"
                      onClick={() => setShowAllCustomFields(false)}
                      title="Collapse custom fields"
                    >
                      ↑
                    </button>
                  </td>
                )}
                {/* Manager column hidden from client view - only available in edit modal */}
                {/* <td>{getManagerName(employee.managerId)}</td> */}
                <td className="actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => onViewEmployee(employee)}
                    title="View Employee"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEditEmployee(employee)}
                    title="Edit Employee"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDeleteEmployee(employee.id)}
                    title="Delete Employee"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedEmployees.length === 0 && (
        <div className="no-results">
          <p>No employees found matching your search criteria.</p>
          <button onClick={clearFilters}>Clear all filters</button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
