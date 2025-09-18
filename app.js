// Global variables to store data
let mergedData = [];
let trainData = [];
let testData = [];

// Configuration constants - UPDATE THESE FOR OTHER DATASETS
const TARGET_COLUMN = 'Survived';
const FEATURE_COLUMNS = ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked'];
const ID_COLUMN = 'PassengerId';

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    // File input elements
    const trainFileInput = document.getElementById('trainFile');
    const testFileInput = document.getElementById('testFile');
    const loadBtn = document.getElementById('loadBtn');
    
    // Output elements
    const overviewDiv = document.getElementById('overview');
    const previewTableDiv = document.getElementById('previewTable');
    const numericStatsDiv = document.getElementById('numericStats');
    const categoricalStatsDiv = document.getElementById('categoricalStats');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    // Event listeners
    loadBtn.addEventListener('click', handleFileUpload);
    document.getElementById('exportCsv').addEventListener('click', exportCsv);
    document.getElementById('exportJson').addEventListener('click', exportJson);
});

// Handle file upload and processing
function handleFileUpload() {
    const trainFile = document.getElementById('trainFile').files[0];
    const testFile = document.getElementById('testFile').files[0];
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    // Reset error message
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    if (!trainFile || !testFile) {
        showError('Please upload both train.csv and test.csv files');
        return;
    }
    
    loadingIndicator.style.display = 'block';
    
    // Parse CSV files
    Papa.parse(trainFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(trainResults) {
            trainData = trainResults.data.map(row => ({...row, source: 'train'}));
            
            Papa.parse(testFile, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(testResults) {
                    testData = testResults.data.map(row => ({...row, source: 'test'}));
                    mergeDatasets();
                    loadingIndicator.style.display = 'none';
                },
                error: function(error) {
                    loadingIndicator.style.display = 'none';
                    showError('Error parsing test.csv: ' + error);
                }
            });
        },
        error: function(error) {
            loadingIndicator.style.display = 'none';
            showError('Error parsing train.csv: ' + error);
        }
    });
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Merge train and test datasets
function mergeDatasets() {
    mergedData = [...trainData, ...testData];
    performEDA();
}

// Perform Exploratory Data Analysis
function performEDA() {
    try {
        displayOverview();
        displayPreviewTable();
        analyzeMissingValues();
        generateStatisticalSummary();
        createVisualizations();
    } catch (error) {
        showError('Error during EDA: ' + error.message);
    }
}

// Display dataset overview
function displayOverview() {
    const overviewDiv = document.getElementById('overview');
    overviewDiv.innerHTML = `
        <p><strong>Total Records:</strong> ${mergedData.length}</p>
        <p><strong>Train Records:</strong> ${trainData.length}</p>
        <p><strong>Test Records:</strong> ${testData.length}</p>
        <p><strong>Features:</strong> ${FEATURE_COLUMNS.join(', ')}</p>
    `;
}

// Display data preview table
function displayPreviewTable() {
    const previewTableDiv = document.getElementById('previewTable');
    let tableHTML = '<table><tr>';
    
    // Create table headers
    const columns = Object.keys(mergedData[0]);
    columns.forEach(col => {
        tableHTML += `<th>${col}</th>`;
    });
    tableHTML += '</tr>';
    
    // Add first 5 rows
    for (let i = 0; i < Math.min(5, mergedData.length); i++) {
        tableHTML += '<tr>';
        columns.forEach(col => {
            tableHTML += `<td>${mergedData[i][col] !== null && mergedData[i][col] !== undefined ? mergedData[i][col] : 'N/A'}</td>`;
        });
        tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    previewTableDiv.innerHTML = tableHTML;
}

// Analyze and visualize missing values
function analyzeMissingValues() {
    const missingValues = {};
    const columns = Object.keys(mergedData[0]);
    
    columns.forEach(col => {
        const missingCount = mergedData.filter(row => 
            row[col] === null || row[col] === undefined || row[col] === '' || isNaN(row[col])
        ).length;
        missingValues[col] = (missingCount / mergedData.length) * 100;
    });
    
    // Create bar chart
    const ctx = document.getElementById('missingValuesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(missingValues),
            datasets: [{
                label: 'Missing Values (%)',
                data: Object.values(missingValues),
                backgroundColor: 'rgba(255, 99, 132, 0.7)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage Missing'
                    }
                }
            }
        }
    });
}

// Generate statistical summary
function generateStatisticalSummary() {
    // Numeric statistics
    const numericColumns = ['Age', 'Fare', 'SibSp', 'Parch'];
    let numericHTML = '<h3>Numeric Statistics</h3><table><tr><th>Feature</th><th>Mean</th><th>Median</th><th>Std Dev</th></tr>';
    
    numericColumns.forEach(col => {
        const values = mergedData.map(row => row[col]).filter(val => val !== null && !isNaN(val));
        if (values.length > 0) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const sorted = [...values].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
            
            numericHTML += `<tr>
                <td>${col}</td>
                <td>${mean.toFixed(2)}</td>
                <td>${median.toFixed(2)}</td>
                <td>${stdDev.toFixed(2)}</td>
            </tr>`;
        }
    });
    
    numericHTML += '</table>';
    document.getElementById('numericStats').innerHTML = numericHTML;
    
    // Categorical statistics
    const categoricalColumns = ['Pclass', 'Sex', 'Embarked'];
    let categoricalHTML = '<h3>Categorical Statistics</h3>';
    
    categoricalColumns.forEach(col => {
        categoricalHTML += `<h4>${col} Distribution</h4><table><tr><th>Value</th><th>Count</th><th>Percentage</th></tr>`;
        const counts = {};
        
        mergedData.forEach(row => {
            const value = row[col] || 'Unknown';
            counts[value] = (counts[value] || 0) + 1;
        });
        
        Object.entries(counts).forEach(([key, count]) => {
            const percentage = (count / mergedData.length) * 100;
            categoricalHTML += `<tr>
                <td>${key}</td>
                <td>${count}</td>
                <td>${percentage.toFixed(2)}%</td>
            </tr>`;
        });
        
        categoricalHTML += '</table>';
    });
    
    document.getElementById('categoricalStats').innerHTML = categoricalHTML;
}

// Create all visualizations
function createVisualizations() {
    createDemographicCharts();
    createDistributionCharts();
    createSurvivalCharts();
    createCorrelationChart();
}

// Create demographic charts
function createDemographicCharts() {
    // Sex distribution
    const sexCounts = countValues(mergedData, 'Sex');
    new Chart(document.getElementById('sexChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(sexCounts),
            datasets: [{
                data: Object.values(sexCounts),
                backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Passenger Gender Distribution'
                }
            }
        }
    });
    
    // Pclass distribution
    const pclassCounts = countValues(mergedData, 'Pclass');
    new Chart(document.getElementById('pclassChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(pclassCounts).map(key => `Class ${key}`),
            datasets: [{
                label: 'Passengers',
                data: Object.values(pclassCounts),
                backgroundColor: 'rgba(75, 192, 192, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Passenger Class Distribution'
                }
            }
        }
    });
    
    // Embarked distribution
    const embarkedCounts = countValues(mergedData, 'Embarked');
    new Chart(document.getElementById('embarkedChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(embarkedCounts),
            datasets: [{
                data: Object.values(embarkedCounts),
                backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(201, 203, 207, 0.7)']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Embarkation Port Distribution'
                }
            }
        }
    });
}

// Create distribution charts
function createDistributionCharts() {
    // Age distribution
    const ages = mergedData.map(row => row.Age).filter(age => age !== null && !isNaN(age));
    const ageRanges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71+'];
    const ageCounts = Array(ageRanges.length).fill(0);
    
    ages.forEach(age => {
        if (age <= 10) ageCounts[0]++;
        else if (age <= 20) ageCounts[1]++;
        else if (age <= 30) ageCounts[2]++;
        else if (age <= 40) ageCounts[3]++;
        else if (age <= 50) ageCounts[4]++;
        else if (age <= 60) ageCounts[5]++;
        else if (age <= 70) ageCounts[6]++;
        else ageCounts[7]++;
    });
    
    new Chart(document.getElementById('ageChart'), {
        type: 'bar',
        data: {
            labels: ageRanges,
            datasets: [{
                label: 'Age Distribution',
                data: ageCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Age Distribution'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age Range'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    });
    
    // Fare distribution
    const fares = mergedData.map(row => row.Fare).filter(fare => fare !== null && !isNaN(fare));
    const fareRanges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-100', '101+'];
    const fareCounts = Array(fareRanges.length).fill(0);
    
    fares.forEach(fare => {
        if (fare <= 10) fareCounts[0]++;
        else if (fare <= 20) fareCounts[1]++;
        else if (fare <= 30) fareCounts[2]++;
        else if (fare <= 40) fareCounts[3]++;
        else if (fare <= 50) fareCounts[4]++;
        else if (fare <= 100) fareCounts[5]++;
        else fareCounts[6]++;
    });
    
    new Chart(document.getElementById('fareChart'), {
        type: 'bar',
        data: {
            labels: fareRanges,
            datasets: [{
                label: 'Fare Distribution',
                data: fareCounts,
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Fare Distribution'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fare Range'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    });
}

// Create survival analysis charts
function createSurvivalCharts() {
    // Survival by sex
    const survivalBySexData = {};
    trainData.forEach(passenger => {
        if (passenger.Survived !== undefined && passenger.Survived !== null) {
            const sex = passenger.Sex || 'Unknown';
            if (!survivalBySexData[sex]) {
                survivalBySexData[sex] = { survived: 0, died: 0 };
            }
            if (passenger.Survived === 1) {
                survivalBySexData[sex].survived++;
            } else {
                survivalBySexData[sex].died++;
            }
        }
    });
    
    new Chart(document.getElementById('survivalBySex'), {
        type: 'bar',
        data: {
            labels: Object.keys(survivalBySexData),
            datasets: [
                {
                    label: 'Survived',
                    data: Object.values(survivalBySexData).map(data => data.survived),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                {
                    label: 'Died',
                    data: Object.values(survivalBySexData).map(data => data.died),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Survival by Gender'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Gender'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    });
    
    // Survival by passenger class
    const survivalByPclassData = {};
    trainData.forEach(passenger => {
        if (passenger.Survived !== undefined && passenger.Survived !== null) {
            const pclass = passenger.Pclass || 'Unknown';
            if (!survivalByPclassData[pclass]) {
                survivalByPclassData[pclass] = { survived: 0, died: 0 };
            }
            if (passenger.Survived === 1) {
                survivalByPclassData[pclass].survived++;
            } else {
                survivalByPclassData[pclass].died++;
            }
        }
    });
    
    new Chart(document.getElementById('survivalByPclass'), {
        type: 'bar',
        data: {
            labels: Object.keys(survivalByPclassData).map(key => `Class ${key}`),
            datasets: [
                {
                    label: 'Survived',
                    data: Object.values(survivalByPclassData).map(data => data.survived),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                {
                    label: 'Died',
                    data: Object.values(survivalByPclassData).map(data => data.died),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Survival by Passenger Class'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Passenger Class'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    });
}

// Create correlation chart
function createCorrelationChart() {
    // Prepare data for correlation analysis (only train data with Survived values)
    const analysisData = trainData.filter(passenger => 
        passenger.Age !== null && !isNaN(passenger.Age) && 
        passenger.Fare !== null && !isNaN(passenger.Fare) && 
        passenger.SibSp !== null && !isNaN(passenger.SibSp) && 
        passenger.Parch !== null && !isNaN(passenger.Parch) &&
        passenger.Survived !== null && !isNaN(passenger.Survived)
    );
    
    // Convert categorical variables to numeric
    const numericData = analysisData.map(passenger => ({
        Pclass: passenger.Pclass,
        Sex: passenger.Sex === 'male' ? 0 : 1,
        Age: passenger.Age,
        SibSp: passenger.SibSp,
        Parch: passenger.Parch,
        Fare: passenger.Fare,
        Embarked: passenger.Embarked === 'C' ? 0 : (passenger.Embarked === 'Q' ? 1 : 2),
        Survived: passenger.Survived
    }));
    
    // Calculate correlations
    const features = ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked', 'Survived'];
    const correlations = [];
    
    features.forEach(feature1 => {
        features.forEach(feature2 => {
            if (feature1 !== feature2) {
                const corr = calculateCorrelation(
                    numericData.map(d => d[feature1]),
                    numericData.map(d => d[feature2])
                );
                correlations.push({
                    x: feature1,
                    y: feature2,
                    v: corr
                });
            }
        });
    });
    
    // Create bar chart showing correlations with survival
    const survivalCorrelations = {};
    features.forEach(feature => {
        if (feature !== 'Survived') {
            const corr = calculateCorrelation(
                numericData.map(d => d[feature]),
                numericData.map(d => d['Survived'])
            );
            survivalCorrelations[feature] = corr;
        }
    });
    
    new Chart(document.getElementById('correlationChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(survivalCorrelations),
            datasets: [{
                label: 'Correlation with Survival',
                data: Object.values(survivalCorrelations),
                backgroundColor: Object.values(survivalCorrelations).map(val => 
                    val > 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'
                )
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Feature Correlation with Survival'
                }
            },
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Correlation Coefficient'
                    }
                }
            }
        }
    });
}

// Helper function to count values in a column
function countValues(data, column) {
    const counts = {};
    data.forEach(row => {
        const value = row[column] || 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
}

// Helper function to calculate correlation
function calculateCorrelation(x, y) {
    const n = x.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((a, b, i) => a + b * y[i], 0);
    const sum_x2 = x.reduce((a, b) => a + b * b, 0);
    const sum_y2 = y.reduce((a, b) => a + b * b, 0);
    
    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

// Export merged data as CSV
function exportCsv() {
    if (mergedData.length === 0) {
        showError('No data to export');
        return;
    }
    
    try {
        const csv = Papa.unparse(mergedData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'titanic_merged_data.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showError('Error exporting CSV: ' + error.message);
    }
}

// Export JSON summary
function exportJson() {
    if (mergedData.length === 0) {
        showError('No data to export');
        return;
    }
    
    try {
        // Create summary object
        const summary = {
            datasetInfo: {
                totalRecords: mergedData.length,
                trainRecords: trainData.length,
                testRecords: testData.length,
                features: FEATURE_COLUMNS
            },
            missingValues: {},
            numericStats: {},
            categoricalStats: {}
        };
        
        // Calculate missing values
        Object.keys(mergedData[0]).forEach(col => {
            const missingCount = mergedData.filter(row => 
                row[col] === null || row[col] === undefined || row[col] === '' || isNaN(row[col])
            ).length;
            summary.missingValues[col] = (missingCount / mergedData.length) * 100;
        });
        
        // Calculate numeric statistics
        const numericColumns = ['Age', 'Fare', 'SibSp', 'Parch'];
        numericColumns.forEach(col => {
            const values = mergedData.map(row => row[col]).filter(val => val !== null && !isNaN(val));
            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const sorted = [...values].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
                
                summary.numericStats[col] = {
                    mean: parseFloat(mean.toFixed(2)),
                    median: parseFloat(median.toFixed(2)),
                    stdDev: parseFloat(stdDev.toFixed(2))
                };
            }
        });
        
        // Calculate categorical statistics
        const categoricalColumns = ['Pclass', 'Sex', 'Embarked'];
        categoricalColumns.forEach(col => {
            summary.categoricalStats[col] = countValues(mergedData, col);
        });
        
        // Create and download JSON file
        const json = JSON.stringify(summary, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'titanic_summary.json');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showError('Error exporting JSON: ' + error.message);
    }
}
