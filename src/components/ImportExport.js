import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';
import Papa from 'papaparse';
import { exportToPDF, exportToCSV, importFromCSV } from '../utils/exportUtils';
import './ImportExport.css';

const ImportExport = ({ employees, onImportEmployees, onResetToSample, isDropdown = false, orgChartRef = null }) => {
  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState('replace'); // 'replace' or 'append'
  const [isExporting, setIsExporting] = useState(false);
  const [showPDFOptionsModal, setShowPDFOptionsModal] = useState(false);
  const [pdfExportOptions, setPDFExportOptions] = useState({
    includeExecutiveSummary: true,
    includeDepartmentAnalytics: true,
    includeOrgChart: false, // Default to false since we're removing html2canvas
    includeEmployeeDirectory: true,
    includeCustomFields: true
  });
  const [customFields, setCustomFields] = useState([]);
  const [defaultFields, setDefaultFields] = useState({});

  // Load custom fields and field settings from localStorage
  useEffect(() => {
    const savedCustomFields = localStorage.getItem('customFields');
    const savedDefaultFields = localStorage.getItem('defaultFields');

    if (savedCustomFields) {
      setCustomFields(JSON.parse(savedCustomFields));
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
  }, []);

  const handlePDFExport = () => {
    setShowPDFOptionsModal(true);
  };

  const handlePDFExportWithOptions = async () => {
    setShowPDFOptionsModal(false);
    setIsExporting(true);

    try {
      const result = await exportToPDF(employees, null, pdfExportOptions);

      if (result.success) {
        // PDF exported successfully
      } else {
        alert('Failed to export PDF. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while exporting the PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = () => {
    exportToCSV(employees);
  };



  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const previewData = results.data.slice(0, 5); // Show first 5 rows
          setImportPreview({
            totalRows: results.data.length,
            preview: previewData,
            file: file
          });
          setShowImportModal(true);
        },
        error: (error) => {
          alert('Error reading CSV file. Please check the file format.');
        }
      });
    } else {
      alert('Please select a valid CSV file.');
    }
  };

  const handleImportConfirm = () => {
    if (importPreview) {
      // Use the updated import function from exportUtils that handles custom fields and manager relationships
      importFromCSV(importPreview.file, (importedEmployees) => {
        if (importMode === 'replace') {
          onImportEmployees(importedEmployees);
        } else {
          // Append mode - merge with existing employees
          const existingIds = new Set(employees.map(emp => emp.id));
          const newEmployees = importedEmployees.filter(emp => !existingIds.has(emp.id));
          onImportEmployees([...employees, ...newEmployees]);
        }

        setShowImportModal(false);
        setImportPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, employees); // Pass existing employees for manager resolution
    }
  };

  const handleImportCancel = () => {
    setShowImportModal(false);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Dropdown menu version
  if (isDropdown) {
    return (
      <>
        <div className="dropdown-menu-content">
          <div className="menu-section">
            <h4>Export</h4>
            <button 
              className="menu-item" 
              onClick={handlePDFExport} 
              disabled={isExporting}
              style={{ opacity: isExporting ? 0.6 : 1 }}
            >
              <FileText size={16} />
              {isExporting ? 'Generating PDF...' : 'Export to PDF'}
            </button>
            <button className="menu-item" onClick={handleCSVExport}>
              <FileSpreadsheet size={16} />
              Export to CSV
            </button>
          </div>
          
          <div className="menu-section">
            <h4>Import</h4>
            <button 
              className="menu-item"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Import from CSV
            </button>

          </div>
          
          <div className="menu-section">
            <h4>Data Management</h4>
            <button 
              className="menu-item reset-button"
              onClick={onResetToSample}
              title="Replace all employees with 50 sample employees"
            >
              <AlertTriangle size={16} />
              Reset to Sample Data
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Import Preview Modal */}
        {showImportModal && (
          <div className="import-modal-overlay">
            <div className="import-modal">
              <div className="modal-header">
                <h3>Import CSV Preview</h3>
                <button className="close-btn" onClick={handleImportCancel}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="import-info">
                  <p><strong>File:</strong> {importPreview?.file.name}</p>
                  <p><strong>Total rows:</strong> {importPreview?.totalRows}</p>
                </div>

                <div className="import-mode">
                  <label>
                    <input
                      type="radio"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value)}
                    />
                    Replace all employees
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={(e) => setImportMode(e.target.value)}
                    />
                    Append to existing employees
                  </label>
                </div>

                {importMode === 'replace' && (
                  <div className="warning">
                    <AlertTriangle size={16} />
                    <span>This will replace all existing employees!</span>
                  </div>
                )}

                <div className="preview-table">
                  <h4>Preview (first 5 rows):</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          {/* Default fields */}
                          {defaultFields.name !== false && <th>Name</th>}
                          {defaultFields.position !== false && <th>Position</th>}
                          {defaultFields.department !== false && <th>Department</th>}
                          {defaultFields.email !== false && <th>Email</th>}
                          {defaultFields.phone !== false && <th>Phone</th>}
                          {/* Custom fields */}
                          {customFields.map(field =>
                            defaultFields[field.name] !== false && (
                              <th key={field.id}>{field.name}</th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview?.preview.map((row, index) => (
                          <tr key={index}>
                            {/* Default fields */}
                            {defaultFields.name !== false && <td>{row.Name || row.name || ''}</td>}
                            {defaultFields.position !== false && <td>{row.Position || row.position || ''}</td>}
                            {defaultFields.department !== false && <td>{row.Department || row.department || ''}</td>}
                            {defaultFields.email !== false && <td>{row.Email || row.email || ''}</td>}
                            {defaultFields.phone !== false && <td>{row.Phone || row.phone || ''}</td>}
                            {/* Custom fields */}
                            {customFields.map(field =>
                              defaultFields[field.name] !== false && (
                                <td key={field.id}>{row[field.name] || ''}</td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={handleImportCancel}>
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleImportConfirm}>
                  Import {importMode === 'replace' ? 'and Replace' : 'and Append'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Export Options Modal */}
        {showPDFOptionsModal && (
          <div className="import-modal-overlay">
            <div className="import-modal pdf-options-modal">
              <div className="modal-header">
                <h3>PDF Export Options</h3>
                <button className="close-btn" onClick={() => setShowPDFOptionsModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-content">
                <p className="modal-description">
                  Select the sections you want to include in your PDF report:
                </p>

                <div className="pdf-options-list">
                  <div className="option-item">
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={pdfExportOptions.includeExecutiveSummary}
                        onChange={(e) => setPDFExportOptions(prev => ({
                          ...prev,
                          includeExecutiveSummary: e.target.checked
                        }))}
                      />
                      {pdfExportOptions.includeExecutiveSummary ? <CheckSquare size={20} /> : <Square size={20} />}
                      <span>Executive Summary</span>
                    </label>
                    <p className="option-description">Key metrics and organizational overview</p>
                  </div>

                  <div className="option-item">
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={pdfExportOptions.includeDepartmentAnalytics}
                        onChange={(e) => setPDFExportOptions(prev => ({
                          ...prev,
                          includeDepartmentAnalytics: e.target.checked
                        }))}
                      />
                      {pdfExportOptions.includeDepartmentAnalytics ? <CheckSquare size={20} /> : <Square size={20} />}
                      <span>Department Analytics</span>
                    </label>
                    <p className="option-description">Department breakdown with visual charts</p>
                  </div>

                  <div className="option-item">
                    <label className="option-label">
                      <input
                        type="checkbox"
                        checked={pdfExportOptions.includeEmployeeDirectory}
                        onChange={(e) => setPDFExportOptions(prev => ({
                          ...prev,
                          includeEmployeeDirectory: e.target.checked
                        }))}
                      />
                      {pdfExportOptions.includeEmployeeDirectory ? <CheckSquare size={20} /> : <Square size={20} />}
                      <span>Employee Directory</span>
                    </label>
                    <p className="option-description">Complete list of all employees with details</p>
                  </div>

                  {customFields.length > 0 && (
                    <div className="option-item">
                      <label className="option-label">
                        <input
                          type="checkbox"
                          checked={pdfExportOptions.includeCustomFields}
                          onChange={(e) => setPDFExportOptions(prev => ({
                            ...prev,
                            includeCustomFields: e.target.checked
                          }))}
                        />
                        {pdfExportOptions.includeCustomFields ? <CheckSquare size={20} /> : <Square size={20} />}
                        <span>Custom Fields</span>
                      </label>
                      <p className="option-description">Include custom fields in employee directory</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowPDFOptionsModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={handlePDFExportWithOptions}
                  disabled={isExporting || !Object.values(pdfExportOptions).some(v => v)}
                >
                  {isExporting ? 'Generating PDF...' : 'Export PDF'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full panel version (original)
  return (
    <>
      <div className="import-export-panel">
        <div className="export-section">
          <h3>Export Data</h3>
          <div className="export-buttons">
            <button 
              className="export-btn pdf-btn" 
              onClick={handlePDFExport} 
              disabled={isExporting}
              style={{ opacity: isExporting ? 0.6 : 1 }}
            >
              <FileText size={16} />
              {isExporting ? 'Generating PDF...' : 'Export to PDF'}
            </button>
            <button className="export-btn csv-btn" onClick={handleCSVExport}>
              <FileSpreadsheet size={16} />
              Export to CSV
            </button>
          </div>
        </div>

        <div className="import-section">
          <h3>Import Data</h3>
          <div className="import-buttons">
            <button 
              className="import-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Import from CSV
            </button>

          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <div className="modal-header">
              <h3>Import CSV Preview</h3>
              <button className="close-btn" onClick={handleImportCancel}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="import-info">
                <p><strong>File:</strong> {importPreview?.file.name}</p>
                <p><strong>Total rows:</strong> {importPreview?.totalRows}</p>
              </div>

              <div className="import-mode">
                <label>
                  <input
                    type="radio"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={(e) => setImportMode(e.target.value)}
                  />
                  Replace all employees
                </label>
                <label>
                  <input
                    type="radio"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={(e) => setImportMode(e.target.value)}
                  />
                  Append to existing employees
                </label>
              </div>

              {importMode === 'replace' && (
                <div className="warning">
                  <AlertTriangle size={16} />
                  <span>This will replace all existing employees!</span>
                </div>
              )}

              <div className="preview-table">
                <h4>Preview (first 5 rows):</h4>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        {/* Default fields */}
                        {defaultFields.name !== false && <th>Name</th>}
                        {defaultFields.position !== false && <th>Position</th>}
                        {defaultFields.department !== false && <th>Department</th>}
                        {defaultFields.email !== false && <th>Email</th>}
                        {defaultFields.phone !== false && <th>Phone</th>}
                        {/* Custom fields */}
                        {customFields.map(field =>
                          defaultFields[field.name] !== false && (
                            <th key={field.id}>{field.name}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview?.preview.map((row, index) => (
                        <tr key={index}>
                          {/* Default fields */}
                          {defaultFields.name !== false && <td>{row.Name || row.name || ''}</td>}
                          {defaultFields.position !== false && <td>{row.Position || row.position || ''}</td>}
                          {defaultFields.department !== false && <td>{row.Department || row.department || ''}</td>}
                          {defaultFields.email !== false && <td>{row.Email || row.email || ''}</td>}
                          {defaultFields.phone !== false && <td>{row.Phone || row.phone || ''}</td>}
                          {/* Custom fields */}
                          {customFields.map(field =>
                            defaultFields[field.name] !== false && (
                              <td key={field.id}>{row[field.name] || ''}</td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleImportCancel}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleImportConfirm}>
                Import {importMode === 'replace' ? 'and Replace' : 'and Append'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportExport;
