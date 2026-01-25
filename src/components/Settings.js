import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Palette, List, Save, Edit, ChevronUp, ChevronDown } from 'lucide-react';
import './Settings.css';
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

const Settings = ({ isOpen, onClose, activeSection, onTabChange, designSettings, onDesignSettingsChange, boardId, isStandaloneMode }) => {
  const [customFields, setCustomFields] = useState([]);

  // Use designSettings from props, with fallback to defaults
  const currentDesignSettings = designSettings || {
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

  // Add default fields settings
  const [defaultFields, setDefaultFields] = useState({
    name: true,
    position: true,
    department: true,
    email: true,
    phone: true,
    managerId: true
  });

  // Add required fields settings
  const [requiredFields, setRequiredFields] = useState({
    name: true,
    position: true,
    department: true,
    email: true,
    phone: true,
    managerId: false
  });

  const [newField, setNewField] = useState({ 
    name: '', 
    type: 'text', 
    required: false,
    options: [] // For dropdown type
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);
  const [editingNewOption, setEditingNewOption] = useState(null);
  const [editingNewOptionIndex, setEditingNewOptionIndex] = useState(null);
  const [showInlineOptionInput, setShowInlineOptionInput] = useState(false);
  const [inlineOptionValue, setInlineOptionValue] = useState('');
  const [isAddingForNewField, setIsAddingForNewField] = useState(true);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  
  // Ref to track current customFields for polling
  const customFieldsRef = useRef([]);

  // Load existing settings from localStorage on component mount
  React.useEffect(() => {
    const loadSettings = () => {
      const savedCustomFields = localStorage.getItem('customFields');
      const savedDesignSettings = localStorage.getItem('designSettings');
      const savedDefaultFields = localStorage.getItem('defaultFields');
      const savedRequiredFields = localStorage.getItem('requiredFields');
      
      if (savedCustomFields) {
        const parsedFields = JSON.parse(savedCustomFields);
        setCustomFields(parsedFields);
      }
      
      if (savedDesignSettings) {
        const parsedSettings = JSON.parse(savedDesignSettings);
        // Merge with default settings to ensure new properties are included
        const defaultDesignSettings = {
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
        // Update parent's state with merged settings
        if (onDesignSettingsChange) {
          onDesignSettingsChange({ ...defaultDesignSettings, ...parsedSettings });
        }
      }

      if (savedDefaultFields) {
        setDefaultFields(JSON.parse(savedDefaultFields));
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
    };

    // Load settings on mount
    loadSettings();

    // Listen for storage events (when localStorage changes from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'customFields' || e.key === 'defaultFields' || e.key === 'requiredFields') {
        loadSettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll for localStorage changes (for same-tab changes)
    const pollInterval = setInterval(() => {
      const savedCustomFields = localStorage.getItem('customFields');
      if (savedCustomFields) {
        const parsedFields = JSON.parse(savedCustomFields);
        // Check if fields have changed using ref
        const currentFieldsStr = JSON.stringify(customFieldsRef.current);
        const newFieldsStr = JSON.stringify(parsedFields);
        if (currentFieldsStr !== newFieldsStr) {
          console.log('🔄 Detected new custom fields in localStorage, auto-updating...');
          customFieldsRef.current = parsedFields;
          setCustomFields(parsedFields);
          
          // Auto-update defaultFields to include new fields
          const savedDefaultFields = localStorage.getItem('defaultFields');
          const currentDefaultFields = savedDefaultFields ? JSON.parse(savedDefaultFields) : {};
          const savedRequiredFields = localStorage.getItem('requiredFields');
          const currentRequiredFields = savedRequiredFields ? JSON.parse(savedRequiredFields) : {};
          
          let updatedDefaultFields = { ...currentDefaultFields };
          let updatedRequiredFields = { ...currentRequiredFields };
          let hasChanges = false;
          
          parsedFields.forEach(field => {
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
            setDefaultFields(updatedDefaultFields);
            setRequiredFields(updatedRequiredFields);
            console.log('✅ Auto-updated defaultFields and requiredFields with new custom fields');
          }
        }
      }
    }, 500); // Check every 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [onDesignSettingsChange]);
  
  // Update ref when customFields changes
  useEffect(() => {
    customFieldsRef.current = customFields;
  }, [customFields]);

  // Update default fields when custom fields change
  React.useEffect(() => {
    const updatedDefaultFields = { ...defaultFields };
    const updatedRequiredFields = { ...requiredFields };
    
    // Add new custom fields to default fields if they don't exist
    customFields.forEach(field => {
      if (!(field.name in updatedDefaultFields)) {
        updatedDefaultFields[field.name] = true; // Default to enabled
        updatedRequiredFields[field.name] = field.required; // Use field's required setting
      } else {
        // Update existing custom field's required setting to stay in sync
        updatedRequiredFields[field.name] = field.required;
      }
    });
    
    // Remove custom fields that no longer exist
    Object.keys(updatedDefaultFields).forEach(fieldName => {
      if (!['name', 'position', 'department', 'email', 'phone', 'managerId'].includes(fieldName)) {
        const fieldExists = customFields.some(field => field.name === fieldName);
        if (!fieldExists) {
          delete updatedDefaultFields[fieldName];
          delete updatedRequiredFields[fieldName];
        }
      }
    });
    
    setDefaultFields(updatedDefaultFields);
    setRequiredFields(updatedRequiredFields);
  }, [customFields]);

  // Map custom field types to Monday.com column types
  const mapFieldTypeToMondayColumnType = (fieldType) => {
    const typeMap = {
      'text': 'text',
      'email': 'email',
      'phone': 'phone',
      'number': 'numbers',
      'date': 'date',
      'dropdown': 'dropdown'
    };
    return typeMap[fieldType] || 'text';
  };

  const addCustomField = async () => {
    if (isFieldReadyToAdd()) {
      
      const newFieldWithId = { ...newField, id: Date.now() };
      
      // Add to Monday.com board if connected
      if (!isStandaloneMode && boardId) {
        try {
          console.log('📋 Adding custom field to Monday.com:', newField.name, 'type:', newField.type);
          
          const mondayColumnType = mapFieldTypeToMondayColumnType(newField.type);
          
          // Prepare column creation mutation
          // Note: column_type is an enum, not a string, so no quotes needed
          let createColumnMutation = `
            mutation {
              create_column(
                board_id: ${boardId},
                title: "${newField.name.replace(/"/g, '\\"')}",
                column_type: ${mondayColumnType}
              ) {
                id
                title
                type
              }
            }
          `;

          // For dropdown columns, add options if available
          if (newField.type === 'dropdown' && newField.options && newField.options.length > 0) {
            // Note: Dropdown options are set after column creation using change_column_value
            // We'll create the column first, then update it with options if needed
            console.log('📋 Dropdown field with options:', newField.options);
          }

          const response = await monday.api(createColumnMutation);
          console.log('✅ Column created in Monday.com:', response);

          if (response?.data?.create_column?.id) {
            const newColumnId = response.data.create_column.id;
            console.log('✅ Successfully added column to Monday.com:', newColumnId);
            
            // Save column mapping to localStorage
            const savedColumnMappings = JSON.parse(localStorage.getItem('columnMappings') || '{}');
            savedColumnMappings[newField.name] = newColumnId;
            localStorage.setItem('columnMappings', JSON.stringify(savedColumnMappings));
            console.log('💾 Saved custom field column mapping:', newField.name, '->', newColumnId);
            
            // If dropdown with options, update column settings
            if (newField.type === 'dropdown' && newField.options && newField.options.length > 0) {
              // Note: Setting dropdown options requires additional API calls
              // For now, we'll just create the column and options can be set manually in Monday.com
              console.log('ℹ️ Dropdown column created. Options can be set in Monday.com UI.');
            }
          } else {
            console.warn('⚠️ Column creation response missing ID:', response);
          }
        } catch (error) {
          console.error('❌ Error adding column to Monday.com:', error);
          console.error('❌ Error details:', error.message);
          // Continue with local field addition even if Monday.com sync fails
        }
      }

      // Add to local state
      const updatedCustomFields = [...customFields, newFieldWithId];
      setCustomFields(updatedCustomFields);

      // Update required fields to sync with the new custom field's required property
      const updatedRequiredFields = {
        ...requiredFields,
        [newField.name]: newField.required
      };
      setRequiredFields(updatedRequiredFields);

      // Save to localStorage immediately
      localStorage.setItem('customFields', JSON.stringify(updatedCustomFields));
      localStorage.setItem('requiredFields', JSON.stringify(updatedRequiredFields));

      setNewField({ name: '', type: 'text', required: false, options: [] });
    }
  };

  const startEditingField = (field) => {
    setEditingField({ ...field });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setIsEditing(false);
  };

  const saveEditedField = () => {
    if (editingField.name.trim()) {
      // Validate dropdown options if type is dropdown
      if (editingField.type === 'dropdown' && editingField.options.length === 0) {
        alert('Please add at least one option for the dropdown field.');
        return;
      }
      
      setCustomFields(customFields.map(field => 
        field.id === editingField.id ? editingField : field
      ));

      // Update required fields to sync with the custom field's required property
      setRequiredFields(prev => ({
        ...prev,
        [editingField.name]: editingField.required
      }));

      setEditingField(null);
      setIsEditing(false);
    }
  };

  const confirmDeleteField = (id) => {
    const fieldToRemove = customFields.find(field => field.id === id);
    setFieldToDelete(fieldToRemove);
    setShowDeleteConfirm(true);
  };

  const removeCustomField = async () => {
    if (fieldToDelete) {
      // Delete column from Monday.com if connected
      if (!isStandaloneMode && boardId) {
        try {
          // Get column ID from localStorage mappings
          const savedColumnMappings = JSON.parse(localStorage.getItem('columnMappings') || '{}');
          const columnId = savedColumnMappings[fieldToDelete.name];
          
          if (columnId) {
            console.log('🗑️ Deleting column from Monday.com:', fieldToDelete.name, 'column ID:', columnId);
            
            const deleteColumnMutation = `
              mutation {
                delete_column(
                  board_id: ${boardId},
                  column_id: "${columnId}"
                ) {
                  id
                  title
                }
              }
            `;
            
            const response = await monday.api(deleteColumnMutation);
            console.log('✅ Column deleted from Monday.com:', response);
            
            // Remove column mapping from localStorage
            const updatedColumnMappings = { ...savedColumnMappings };
            delete updatedColumnMappings[fieldToDelete.name];
            localStorage.setItem('columnMappings', JSON.stringify(updatedColumnMappings));
            console.log('💾 Removed column mapping from localStorage:', fieldToDelete.name);
          } else {
            console.log('⚠️ Column mapping not found for field:', fieldToDelete.name);
          }
        } catch (error) {
          console.error('❌ Error deleting column from Monday.com:', error);
          console.error('❌ Error details:', error.message);
          // Continue with local field deletion even if Monday.com sync fails
        }
      }
      
      // Remove from local state
      setCustomFields(customFields.filter(field => field.id !== fieldToDelete.id));
      
      // Remove the field from required fields as well
      setRequiredFields(prev => {
        const updated = { ...prev };
        delete updated[fieldToDelete.name];
        return updated;
      });
      
      // Remove from default fields
      const savedDefaultFields = JSON.parse(localStorage.getItem('defaultFields') || '{}');
      const updatedDefaultFields = { ...savedDefaultFields };
      delete updatedDefaultFields[fieldToDelete.name];
      localStorage.setItem('defaultFields', JSON.stringify(updatedDefaultFields));
      
      // Remove from localStorage
      const updatedCustomFields = customFields.filter(field => field.id !== fieldToDelete.id);
      localStorage.setItem('customFields', JSON.stringify(updatedCustomFields));
      localStorage.setItem('requiredFields', JSON.stringify({ ...requiredFields, [fieldToDelete.name]: undefined }));
      
      setFieldToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setFieldToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Dropdown options management
  const showInlineOptionInputForNewField = () => {
    setIsAddingForNewField(true);
    setShowInlineOptionInput(true);
    setInlineOptionValue('');
  };

  const showInlineOptionInputForEditing = () => {
    setIsAddingForNewField(false);
    setShowInlineOptionInput(true);
    setInlineOptionValue('');
  };

  const addInlineOption = () => {
    if (!inlineOptionValue.trim()) return;

    if (isAddingForNewField) {
      if (newField.options.length >= 20) {
        alert('Maximum 20 options allowed for dropdown fields.');
        return;
      }
      setNewField({
        ...newField,
        options: [...newField.options, inlineOptionValue.trim()]
      });
    } else {
      if (editingField.options.length >= 20) {
        alert('Maximum 20 options allowed for dropdown fields.');
        return;
      }
      setEditingField({
        ...editingField,
        options: [...editingField.options, inlineOptionValue.trim()]
      });
    }
    setInlineOptionValue('');
    // Keep input visible for quick addition of multiple options
  };

  const cancelInlineOption = () => {
    setShowInlineOptionInput(false);
    setInlineOptionValue('');
  };

  const removeDropdownOption = (index) => {
    setNewField({
      ...newField,
      options: newField.options.filter((_, i) => i !== index)
    });
  };

  const removeEditingDropdownOption = (index) => {
    setEditingField({
      ...editingField,
      options: editingField.options.filter((_, i) => i !== index)
    });
  };

  const startEditingOption = (option, index) => {
    setEditingOption(option);
    setEditingOptionIndex(index);
  };

  const saveEditedOption = () => {
    if (editingOption && editingOption.trim() && editingOptionIndex !== null) {
      const updatedOptions = [...editingField.options];
      updatedOptions[editingOptionIndex] = editingOption.trim();
      setEditingField({
        ...editingField,
        options: updatedOptions
      });
      setEditingOption(null);
      setEditingOptionIndex(null);
    }
  };

  const cancelEditingOption = () => {
    setEditingOption(null);
    setEditingOptionIndex(null);
  };

  const startEditingNewOption = (option, index) => {
    setEditingNewOption(option);
    setEditingNewOptionIndex(index);
  };

  const saveEditedNewOption = () => {
    if (editingNewOption && editingNewOption.trim() && editingNewOptionIndex !== null) {
      const updatedOptions = [...newField.options];
      updatedOptions[editingNewOptionIndex] = editingNewOption.trim();
      setNewField({
        ...newField,
        options: updatedOptions
      });
      setEditingNewOption(null);
      setEditingNewOptionIndex(null);
    }
  };

  const cancelEditingNewOption = () => {
    setEditingNewOption(null);
    setEditingNewOptionIndex(null);
  };



  const handleFieldTypeChange = (type) => {
    setNewField({
      ...newField,
      type,
      options: type === 'dropdown' ? [] : []
    });
  };

  const handleEditingFieldTypeChange = (type) => {
    setEditingField({
      ...editingField,
      type,
      options: type === 'dropdown' ? [] : []
    });
  };

  const updateDesignSetting = (key, value) => {
    const newSettings = { ...currentDesignSettings, [key]: value };
    if (onDesignSettingsChange) {
      onDesignSettingsChange(newSettings);
    }
    // Save to localStorage
    localStorage.setItem('designSettings', JSON.stringify(newSettings));
  };

  const toggleDefaultField = (fieldName) => {
    setDefaultFields(prev => {
      const newFields = {
        ...prev,
        [fieldName]: !prev[fieldName]
      };
      
      // Ensure at least one field is always enabled
      const enabledFields = Object.values(newFields).filter(Boolean).length;
      if (enabledFields === 0) {
        // If no fields are enabled, re-enable the field that was just toggled
        return {
          ...prev,
          [fieldName]: true
        };
      }
      
      return newFields;
    });
  };

  const toggleRequiredField = (fieldName) => {
    setRequiredFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));

    // If this is a custom field, also update the custom field's required property
    const fieldIndex = customFields.findIndex(field => field.name === fieldName);
    if (fieldIndex !== -1) {
      const updatedCustomFields = [...customFields];
      updatedCustomFields[fieldIndex] = {
        ...updatedCustomFields[fieldIndex],
        required: !requiredFields[fieldName]
      };
      setCustomFields(updatedCustomFields);
    }
  };

  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('customFields', JSON.stringify(customFields));
    localStorage.setItem('designSettings', JSON.stringify(currentDesignSettings));
    localStorage.setItem('defaultFields', JSON.stringify(defaultFields)); // Save default fields
    localStorage.setItem('requiredFields', JSON.stringify(requiredFields)); // Save required fields
    onClose();
  };

  // Reordering functions
  const moveFieldUp = (index) => {
    if (index > 0) {
      const newFields = [...customFields];
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
      setCustomFields(newFields);
      setSelectedFieldIndex(index - 1);
    }
  };

  const moveFieldDown = (index) => {
    if (index < customFields.length - 1) {
      const newFields = [...customFields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setCustomFields(newFields);
      setSelectedFieldIndex(index + 1);
    }
  };

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveFieldUp(index);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFieldDown(index);
        break;
      case 'Enter':
        event.preventDefault();
        startEditingField(customFields[index]);
        break;
      case 'Delete':
        event.preventDefault();
        confirmDeleteField(customFields[index].id);
        break;
      default:
        break;
    }
  };

  // Check if field is ready to be added (with dropdown exception)
  const isFieldReadyToAdd = () => {
    // Must have a field name
    if (!newField.name.trim()) {
      return false;
    }

    // For dropdown fields, must have at least one option
    if (newField.type === 'dropdown') {
      return newField.options.length > 0;
    }

    // For all other field types, just need the name
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-modal-content">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeSection === 'field-management' ? 'active' : ''}`}
              onClick={() => onTabChange('field-management')}
            >
              <List size={16} />
              Field Management
            </button>
            <button 
              className={`settings-tab ${activeSection === 'designer' ? 'active' : ''}`}
              onClick={() => onTabChange('designer')}
            >
              <Palette size={16} />
              Designer
            </button>
          </div>

          {activeSection === 'field-management' && (
            <div className="settings-section">
              <h3>Field Management</h3>
              <p className="section-description">
                Create custom fields and control which fields are visible and required in employee forms.
              </p>
              <div className="keyboard-help">
                <p><strong>Keyboard Shortcuts:</strong></p>
                <ul>
                  <li>Click on a field to select it</li>
                  <li>↑ ↓ Arrow keys to move fields up/down</li>
                  <li>Enter to edit selected field</li>
                  <li>Delete to remove selected field</li>
                </ul>
              </div>

                             <div className="custom-fields-list">
                 {customFields.map((field, index) => (
                   <div 
                     key={field.id} 
                     className={`custom-field-item ${selectedFieldIndex === index ? 'selected' : ''} ${editingField && editingField.id === field.id ? 'editing' : ''}`}
                     tabIndex={0}
                     onKeyDown={(e) => handleKeyDown(e, index)}
                     onClick={() => setSelectedFieldIndex(index)}
                   >
                     {editingField && editingField.id === field.id ? (
                       // Inline editing mode
                       <div className="field-edit-mode">
                         <div className="field-edit-inputs">
                           <input
                             type="text"
                             placeholder="Field name"
                             value={editingField.name}
                             onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                             className="field-name-input"
                           />
                           <select
                             value={editingField.type}
                             onChange={(e) => handleEditingFieldTypeChange(e.target.value)}
                             className="field-type-select"
                           >
                             <option value="text">Text</option>
                             <option value="number">Number</option>
                             <option value="date">Date</option>
                             <option value="email">Email</option>
                             <option value="phone">Phone</option>
                             <option value="dropdown">Dropdown</option>
                           </select>
                           <label className="required-checkbox">
                             <input
                               type="checkbox"
                               checked={editingField.required}
                               onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                             />
                             <span>Required</span>
                           </label>
                         </div>
                         
                         {/* Inline Dropdown Options Management */}
                         {editingField.type === 'dropdown' && (
                           <div className="inline-dropdown-options">
                             <h5>Dropdown Options ({editingField.options.length}/20)</h5>
                             <div className="dropdown-options-list">
                               {editingField.options.map((option, optionIndex) => (
                                 <div key={optionIndex} className="dropdown-option-item">
                                   {editingOptionIndex === optionIndex ? (
                                     <div className="option-edit-mode">
                                       <input
                                         type="text"
                                         value={editingOption}
                                         onChange={(e) => setEditingOption(e.target.value)}
                                         className="option-edit-input"
                                         autoFocus
                                       />
                                       <button 
                                         className="save-option-btn"
                                         onClick={saveEditedOption}
                                         title="Save option"
                                       >
                                         <Save size={14} />
                                       </button>
                                       <button 
                                         className="cancel-option-btn"
                                         onClick={cancelEditingOption}
                                         title="Cancel edit"
                                       >
                                         <X size={14} />
                                       </button>
                                     </div>
                                   ) : (
                                     <>
                                       <span className="option-name">{option}</span>
                                       <div className="option-actions">
                                         <button 
                                           className="edit-option-btn"
                                           onClick={() => startEditingOption(option, optionIndex)}
                                           title="Edit option"
                                         >
                                           <Edit size={14} />
                                         </button>
                                         <button 
                                           className="remove-option-btn"
                                           onClick={() => removeEditingDropdownOption(optionIndex)}
                                           title="Remove option"
                                         >
                                           <Trash2 size={14} />
                                         </button>
                                       </div>
                                     </>
                                   )}
                                 </div>
                               ))}
                             </div>
                             {showInlineOptionInput && !isAddingForNewField && (
                               <div className="inline-option-input">
                                 <input
                                   type="text"
                                   value={inlineOptionValue}
                                   onChange={(e) => setInlineOptionValue(e.target.value)}
                                   placeholder="Enter option name..."
                                   className="inline-option-text-input"
                                   autoFocus
                                   onKeyPress={(e) => {
                                     if (e.key === 'Enter') {
                                       addInlineOption();
                                     } else if (e.key === 'Escape') {
                                       cancelInlineOption();
                                     }
                                   }}
                                 />
                                 <button
                                   className={`inline-add-btn ${inlineOptionValue.trim() ? 'option-ready' : ''}`}
                                   onClick={addInlineOption}
                                   disabled={!inlineOptionValue.trim()}
                                   title="Add option"
                                 >
                                   <Plus size={14} />
                                 </button>
                                 <button
                                   className="inline-cancel-btn"
                                   onClick={cancelInlineOption}
                                   title="Cancel"
                                 >
                                   <X size={14} />
                                 </button>
                               </div>
                             )}
                             {!showInlineOptionInput || isAddingForNewField ? (
                               <button
                                 className={`add-option-btn ${editingField.options.length >= 20 ? 'disabled' : ''} ${!showInlineOptionInput && editingField.options.length < 20 ? 'option-ready' : ''}`}
                                 onClick={showInlineOptionInputForEditing}
                                 disabled={editingField.options.length >= 20}
                               >
                                 <Plus size={14} />
                                 Add Option
                               </button>
                             ) : null}
                           </div>
                         )}
                         
                         <div className="field-edit-actions">
                           <button className="save-edit-btn" onClick={saveEditedField}>
                             <Save size={16} />
                             Save
                           </button>
                           <button className="cancel-edit-btn" onClick={cancelEditing}>
                             <X size={16} />
                             Cancel
                           </button>
                         </div>
                       </div>
                     ) : (
                       // Normal display mode
                       <>
                         <div className="field-info">
                           <span className="field-name">{field.name}</span>
                           <span className="field-type">{field.type}</span>
                           {field.required && <span className="field-required">Required</span>}
                           {field.type === 'dropdown' && field.options && (
                             <span className="field-options-count">
                               {field.options.length} options
                             </span>
                           )}
                         </div>
                         <div className="field-actions">
                           <button 
                             className="move-up-btn"
                             onClick={(e) => {
                               e.stopPropagation();
                               moveFieldUp(index);
                             }}
                             disabled={index === 0}
                             title="Move up (↑)"
                           >
                             <ChevronUp size={16} />
                           </button>
                           <button 
                             className="move-down-btn"
                             onClick={(e) => {
                               e.stopPropagation();
                               moveFieldDown(index);
                             }}
                             disabled={index === customFields.length - 1}
                             title="Move down (↓)"
                           >
                             <ChevronDown size={16} />
                           </button>
                           <button 
                             className="edit-field-btn"
                             onClick={(e) => {
                               e.stopPropagation();
                               startEditingField(field);
                             }}
                             title="Edit field (Enter)"
                           >
                             <Edit size={16} />
                           </button>
                           <button 
                             className="remove-field-btn"
                             onClick={(e) => {
                               e.stopPropagation();
                               confirmDeleteField(field.id);
                             }}
                             title="Delete field (Delete)"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </>
                     )}
                   </div>
                 ))}
               </div>

              <div className={`add-field-form ${isFieldReadyToAdd() ? 'form-ready' : ''}`}>
                <h4>Add New Field</h4>
                <div className="field-inputs">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  />
                                     <select
                     value={newField.type}
                     onChange={(e) => handleFieldTypeChange(e.target.value)}
                   >
                     <option value="text">Text</option>
                     <option value="number">Number</option>
                     <option value="date">Date</option>
                     <option value="email">Email</option>
                     <option value="phone">Phone</option>
                     <option value="dropdown">Dropdown</option>
                   </select>
                  <label className="required-checkbox">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    />
                    Required
                  </label>
                                     <button
                                       className={`add-field-btn ${isFieldReadyToAdd() ? 'ready-to-add' : ''}`}
                                       onClick={addCustomField}
                                       disabled={!isFieldReadyToAdd()}
                                     >
                     <Plus size={16} />
                     Add Field
                   </button>
                 </div>

                 {/* Dropdown Options Management */}
                 {newField.type === 'dropdown' && (
                   <div className="dropdown-options-section">
                     <h5>Dropdown Options ({newField.options.length}/20)</h5>
                                            <div className="dropdown-options-list">
                         {newField.options.map((option, index) => (
                           <div key={index} className="dropdown-option-item">
                             {editingNewOptionIndex === index ? (
                               <div className="option-edit-mode">
                                 <input
                                   type="text"
                                   value={editingNewOption}
                                   onChange={(e) => setEditingNewOption(e.target.value)}
                                   className="option-edit-input"
                                   autoFocus
                                 />
                                 <button 
                                   className="save-option-btn"
                                   onClick={saveEditedNewOption}
                                   title="Save option"
                                 >
                                   <Save size={14} />
                                 </button>
                                 <button 
                                   className="cancel-option-btn"
                                   onClick={cancelEditingNewOption}
                                   title="Cancel edit"
                                 >
                                   <X size={14} />
                                 </button>
                               </div>
                             ) : (
                               <>
                                 <span className="option-name">{option}</span>
                                 <div className="option-actions">
                                   <button 
                                     className="edit-option-btn"
                                     onClick={() => startEditingNewOption(option, index)}
                                     title="Edit option"
                                   >
                                     <Edit size={14} />
                                   </button>
                                   <button 
                                     className="remove-option-btn"
                                     onClick={() => removeDropdownOption(index)}
                                     title="Remove option"
                                   >
                                     <Trash2 size={14} />
                                   </button>
                                 </div>
                               </>
                             )}
                           </div>
                         ))}
                       </div>
                                           {showInlineOptionInput && isAddingForNewField && (
                                             <div className="inline-option-input">
                                               <input
                                                 type="text"
                                                 value={inlineOptionValue}
                                                 onChange={(e) => setInlineOptionValue(e.target.value)}
                                                 placeholder="Enter option name..."
                                                 className="inline-option-text-input"
                                                 autoFocus
                                                 onKeyPress={(e) => {
                                                   if (e.key === 'Enter') {
                                                     addInlineOption();
                                                   } else if (e.key === 'Escape') {
                                                     cancelInlineOption();
                                                   }
                                                 }}
                                               />
                                               <button
                                                 className={`inline-add-btn ${inlineOptionValue.trim() ? 'option-ready' : ''}`}
                                                 onClick={addInlineOption}
                                                 disabled={!inlineOptionValue.trim()}
                                                 title="Add option"
                                               >
                                                 <Plus size={14} />
                                               </button>
                                               <button
                                                 className="inline-cancel-btn"
                                                 onClick={cancelInlineOption}
                                                 title="Cancel"
                                               >
                                                 <X size={14} />
                                               </button>
                                             </div>
                                           )}
                                           {!showInlineOptionInput || !isAddingForNewField ? (
                                             <button
                                               className={`add-option-btn ${newField.options.length >= 20 ? 'disabled' : ''} ${!showInlineOptionInput && newField.options.length < 20 ? 'option-ready' : ''}`}
                                               onClick={showInlineOptionInputForNewField}
                                               disabled={newField.options.length >= 20}
                                             >
                                               <Plus size={14} />
                                               Add Option
                                             </button>
                                           ) : null}
                   </div>
                 )}


              </div>

              {/* Form Settings Section */}
              <div className="form-settings-section">
                <h3>Form Settings</h3>
                <p className="section-description">
                  Control which fields are visible and required when adding or editing employees. At least one field must remain enabled.
                </p>

                <div className="default-fields-list">
                  <h4>Built-in Fields</h4>
                  <div className="field-toggle-group">
                    <div className={`field-toggle-item ${!defaultFields.name ? 'disabled' : ''}`}>
                      <div className="field-toggle-info">
                        <span className="field-name">Full Name</span>
                        <span className="field-description">Employee's full name</span>
                      </div>
                      <div className="field-controls">
                        <label className="required-checkbox">
                          <input
                            type="checkbox"
                            checked={requiredFields.name}
                            onChange={() => toggleRequiredField('name')}
                            disabled={!defaultFields.name}
                          />
                          <span>Required</span>
                        </label>
                        <button 
                          className={`toggle-btn ${defaultFields.name ? 'active' : ''}`}
                          onClick={() => toggleDefaultField('name')}
                          title={defaultFields.name ? 'Disable field' : 'Enable field'}
                          aria-label={defaultFields.name ? 'Disable field' : 'Enable field'}
                        />
                      </div>
                    </div>

                    <div className={`field-toggle-item ${!defaultFields.position ? 'disabled' : ''}`}>
                      <div className="field-toggle-info">
                        <span className="field-name">Position</span>
                        <span className="field-description">Job title or position</span>
                      </div>
                      <div className="field-controls">
                        <label className="required-checkbox">
                          <input
                            type="checkbox"
                            checked={requiredFields.position}
                            onChange={() => toggleRequiredField('position')}
                            disabled={!defaultFields.position}
                          />
                          <span>Required</span>
                        </label>
                        <button 
                          className={`toggle-btn ${defaultFields.position ? 'active' : ''}`}
                          onClick={() => toggleDefaultField('position')}
                          title={defaultFields.position ? 'Disable field' : 'Enable field'}
                          aria-label={defaultFields.position ? 'Disable field' : 'Enable field'}
                        />
                      </div>
                    </div>

                    <div className={`field-toggle-item ${!defaultFields.department ? 'disabled' : ''}`}>
                      <div className="field-toggle-info">
                        <span className="field-name">Department</span>
                        <span className="field-description">Department or team</span>
                      </div>
                      <div className="field-controls">
                        <label className="required-checkbox">
                          <input
                            type="checkbox"
                            checked={requiredFields.department}
                            onChange={() => toggleRequiredField('department')}
                            disabled={!defaultFields.department}
                          />
                          <span>Required</span>
                        </label>
                        <button 
                          className={`toggle-btn ${defaultFields.department ? 'active' : ''}`}
                          onClick={() => toggleDefaultField('department')}
                          title={defaultFields.department ? 'Disable field' : 'Enable field'}
                          aria-label={defaultFields.department ? 'Disable field' : 'Enable field'}
                        />
                      </div>
                    </div>

                    <div className={`field-toggle-item ${!defaultFields.email ? 'disabled' : ''}`}>
                      <div className="field-toggle-info">
                        <span className="field-name">Email</span>
                        <span className="field-description">Email address</span>
                      </div>
                      <div className="field-controls">
                        <label className="required-checkbox">
                          <input
                            type="checkbox"
                            checked={requiredFields.email}
                            onChange={() => toggleRequiredField('email')}
                            disabled={!defaultFields.email}
                          />
                          <span>Required</span>
                        </label>
                        <button 
                          className={`toggle-btn ${defaultFields.email ? 'active' : ''}`}
                          onClick={() => toggleDefaultField('email')}
                          title={defaultFields.email ? 'Disable field' : 'Enable field'}
                          aria-label={defaultFields.email ? 'Disable field' : 'Enable field'}
                        />
                      </div>
                    </div>

                    <div className={`field-toggle-item ${!defaultFields.phone ? 'disabled' : ''}`}>
                      <div className="field-toggle-info">
                        <span className="field-name">Phone</span>
                        <span className="field-description">Phone number</span>
                      </div>
                      <div className="field-controls">
                        <label className="required-checkbox">
                          <input
                            type="checkbox"
                            checked={requiredFields.phone}
                            onChange={() => toggleRequiredField('phone')}
                            disabled={!defaultFields.phone}
                          />
                          <span>Required</span>
                        </label>
                        <button 
                          className={`toggle-btn ${defaultFields.phone ? 'active' : ''}`}
                          onClick={() => toggleDefaultField('phone')}
                          title={defaultFields.phone ? 'Disable field' : 'Enable field'}
                          aria-label={defaultFields.phone ? 'Disable field' : 'Enable field'}
                        />
                      </div>
                    </div>

                    <div className={`field-toggle-item ${!defaultFields.managerId ? 'disabled' : ''}`}>
                      <div className="field-toggle-info">
                        <span className="field-name">Manager</span>
                        <span className="field-description">Reporting manager</span>
                      </div>
                      <div className="field-controls">
                        <label className="required-checkbox">
                          <input
                            type="checkbox"
                            checked={requiredFields.managerId}
                            onChange={() => toggleRequiredField('managerId')}
                            disabled={!defaultFields.managerId}
                          />
                          <span>Required</span>
                        </label>
                        <button 
                          className={`toggle-btn ${defaultFields.managerId ? 'active' : ''}`}
                          onClick={() => toggleDefaultField('managerId')}
                          title={defaultFields.managerId ? 'Disable field' : 'Enable field'}
                          aria-label={defaultFields.managerId ? 'Disable field' : 'Enable field'}
                        />
                      </div>
                    </div>
                  </div>

                  {customFields.length > 0 && (
                    <>
                      <h4>Custom Fields</h4>
                      <div className="field-toggle-group">
                        {customFields.map(field => (
                          <div key={field.id} className={`field-toggle-item ${!defaultFields[field.name] ? 'disabled' : ''}`}>
                            <div className="field-toggle-info">
                              <span className="field-name">{field.name}</span>
                              <span className="field-description">
                                {field.type} field
                              </span>
                            </div>
                            <div className="field-controls">
                              <label className="required-checkbox">
                                <input
                                  type="checkbox"
                                  checked={requiredFields[field.name]}
                                  onChange={() => toggleRequiredField(field.name)}
                                  disabled={!defaultFields[field.name]}
                                />
                                <span>Required</span>
                              </label>
                              <button 
                                className={`toggle-btn ${defaultFields[field.name] ? 'active' : ''}`}
                                onClick={() => toggleDefaultField(field.name)}
                                title={defaultFields[field.name] ? 'Disable field' : 'Enable field'}
                                aria-label={defaultFields[field.name] ? 'Disable field' : 'Enable field'}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}



          {activeSection === 'designer' && (
            <div className="settings-section">
              <h3>Designer</h3>
              <p className="section-description">
                Customize the appearance of your organizational chart.
              </p>

              <div className="design-options">
                <div className="design-option">
                  <label>Card Style</label>
                  <select
                    value={currentDesignSettings.cardStyle}
                    onChange={(e) => updateDesignSetting('cardStyle', e.target.value)}
                  >
                    <option value="rounded">Rounded</option>
                    <option value="sharp">Sharp</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="design-option">
                  <label>Avatar Size</label>
                  <select
                    value={currentDesignSettings.avatarSize}
                    onChange={(e) => updateDesignSetting('avatarSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="design-option">
                  <label>Primary Color</label>
                  <input
                    type="color"
                    value={currentDesignSettings.primaryColor}
                    onChange={(e) => updateDesignSetting('primaryColor', e.target.value)}
                  />
                </div>

                <div className="design-option">
                  <label>Secondary Color</label>
                  <input
                    type="color"
                    value={currentDesignSettings.secondaryColor}
                    onChange={(e) => updateDesignSetting('secondaryColor', e.target.value)}
                  />
                </div>

                <div className="design-option">
                  <label>Edge Type</label>
                  <select
                    value={currentDesignSettings.edgeType}
                    onChange={(e) => updateDesignSetting('edgeType', e.target.value)}
                  >
                    <option value="straight">Straight</option>
                    <option value="curved">Curved</option>
                    <option value="bezier">Bezier</option>
                  </select>
                </div>

                <div className="design-option">
                  <label>Edge Color</label>
                  <input
                    type="color"
                    value={currentDesignSettings.edgeColor}
                    onChange={(e) => updateDesignSetting('edgeColor', e.target.value)}
                  />
                </div>

                <div className="design-option">
                  <label>Edge Width: {currentDesignSettings.edgeWidth}px</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={currentDesignSettings.edgeWidth}
                    onChange={(e) => updateDesignSetting('edgeWidth', parseFloat(e.target.value))}
                    style={{ width: '100%', marginTop: '5px' }}
                  />
                </div>

                <div className="design-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentDesignSettings.showContactInfo}
                      onChange={(e) => updateDesignSetting('showContactInfo', e.target.checked)}
                    />
                    Show Contact Information
                  </label>
                </div>

                <div className="design-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentDesignSettings.showDepartment}
                      onChange={(e) => updateDesignSetting('showDepartment', e.target.checked)}
                    />
                    Show Department
                  </label>
                </div>
              </div>


            </div>
          )}
        </div>

        <div className="settings-modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={saveSettings}>
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

             {/* Delete Confirmation Modal */}
       {showDeleteConfirm && fieldToDelete && (
         <div className="delete-confirmation-overlay">
           <div className="delete-confirmation-modal">
             <div className="delete-confirmation-header">
               <h3>Delete Field</h3>
             </div>
             <div className="delete-confirmation-content">
               <p>
                 Are you sure you want to delete <strong>"{fieldToDelete.name}"</strong>?
               </p>
               <p className="warning-text">
                 This action cannot be undone and will remove this field from all employee profiles.
               </p>
             </div>
             <div className="delete-confirmation-actions">
               <button className="cancel-delete-btn" onClick={cancelDelete}>
                 Cancel
               </button>
               <button className="confirm-delete-btn" onClick={removeCustomField}>
                 Delete
               </button>
             </div>
           </div>
         </div>
       )}


    </div>
  );
};

export default Settings;
