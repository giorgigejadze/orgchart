// Test script to verify CSV import with manager relationships
import { importFromCSV } from './src/utils/exportUtils.js';

// Mock existing employees
const existingEmployees = [
  {
    id: 1001,
    name: 'Jane Doe',
    position: 'CFO',
    department: 'Finance',
    email: 'jane.doe@company.com',
    phone: '+1-555-0100',
    managerId: null
  }
];

// Test the import function
console.log('🧪 Testing CSV import with manager relationships...');

const testFile = new File(['Name,Position,Department,Email,Phone,Manager\nJohn Smith,CEO,Executive,john.smith@company.com,+1-555-0101,\nSarah Johnson,CTO,Technology,sarah.johnson@company.com,+1-555-0102,John Smith'], {
  type: 'text/csv',
  name: 'test.csv'
});

importFromCSV(testFile, (importedEmployees) => {
  console.log('✅ Import completed successfully!');
  console.log('📊 Imported employees:', importedEmployees.length);
  console.log('🔗 Manager relationships:');

  importedEmployees.forEach(emp => {
    const managerName = emp.managerId ?
      importedEmployees.find(m => m.id === emp.managerId)?.name || existingEmployees.find(m => m.id === emp.managerId)?.name || 'Unknown' :
      'No Manager';
    console.log(`  ${emp.name} (${emp.position}) → ${managerName}`);
  });

  // Check if edges should be created
  const edges = [];
  importedEmployees.forEach(emp => {
    if (emp.managerId) {
      const manager = importedEmployees.find(m => m.id === emp.managerId) || existingEmployees.find(m => m.id === emp.managerId);
      if (manager) {
        edges.push({
          id: `edge-${emp.managerId}-${emp.id}`,
          source: String(emp.managerId),
          target: String(emp.id)
        });
      }
    }
  });

  console.log('🔗 Expected edges:', edges.length);
  edges.forEach(edge => console.log(`  ${edge.source} → ${edge.target}`));

}, existingEmployees);
