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
    
    // Event listeners
    loadBtn.addEventListener('click', handleFileUpload);
    document.getElementById('exportCsv').addEventListener('click', exportCsv);
    document.getElementById('exportJson').addEventListener('click', exportJson);
});

// Handle file upload and processing
function handleFileUpload() {
    const trainFile = document.getElementById('trainFile').files[0];
    const testFile = document.getElementById('testFile').files[0];
    
    if (!trainFile || !testFile) {
        alert('Please upload both train.csv and test.csv files');
        return;
    }
    
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
                },
                error: function(error) {
                    alert('Error parsing test.csv: ' + error);
                }
            });
        },
        error: function(error) {
            alert('Error parsing train.csv: ' + error);
        }
    });
}

// Merge train and test datasets
function mergeDatasets() {
    mergedData = [...trainData, ...testData];
    performEDA();
}

// Perform Exploratory Data Analysis
function performEDA() {
    displayOverview();
    displayPreviewTable();
    analyzeMissingValues();
    generateStatisticalSummary();
    createVisualizations();
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
            tableHTML += `<td>${mergedData[i][col]}</td>`;
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
        const missingCount = mergedData.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
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
        const values = mergedData.map(row => row[col]).filter(val => !isNaN(val));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sorted = values.sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
        
        numericHTML += `<tr>
            <td>${col}</td>
            <td>${mean.toFixed(2)}</td>
            <td>${median.toFixed(2)}</td>
            <td>${stdDev.toFixed(2)}</td>
        </tr>`;
    });
    
    numericHTML += '</table>';
    numericStatsDiv.innerHTML = numericHTML;
    
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
    
    categoricalStatsDiv.innerHTML = categoricalHTML;
}

// Create all visualizations
function createVisualizations() {
    createDemographicCharts();
    createDistributionCharts();
    createSurvivalCharts();
    createCorrelationHeatmap();
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
    const ages = mergedData.map(row => row.Age).filter(age => !isNaN(age));
    new Chart(document.getElementById('ageChart'), {
        type: 'histogram',
        data: {
            labels: ages,
            datasets: [{
                label: 'Age Distribution',
                data: ages,
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
                        text: 'Age'
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
    const fares = mergedData.map(row => row.Fare).filter(fare => !isNaN(fare) && fare < 200); // Filter outliers
    new Chart(document.getElementById('fareChart'), {
        type: 'histogram',
        data: {
            labels: fares,
            datasets: [{
                label: 'Fare Distribution',
                data: fares,
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
                    text: 'Fare Distribution (Outliers Filtered)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fare'
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
        if (passenger.Survived !== undefined) {
            const sex = passenger.Sex;
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
        if (passenger.Survived !== undefined) {
            const pclass = passenger.Pclass;
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

// Create correlation heatmap
function createCorrelationHeatmap() {
    // Prepare data for correlation analysis (only train data with Survived values)
    const analysisData = trainData.filter(passenger => 
        !isNaN(passenger.Age) && 
        !isNaN(passenger.Fare) && 
        !isNaN(passenger.SibSp) && 
        !isNaN(passenger.Parch) &&
        passenger.Survived !== undefined
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
    const correlations = {};
    
    features.forEach(feature1 => {
        correlations[feature1] = {};
        features.forEach(feature2 => {
            const corr = calculateCorrelation(
                numericData.map(d => d[feature1]),
                numericData.map(d => d[feature2])
            );
            correlations[feature1][feature2] = corr;
        });
    });
    
    // Create heatmap
    const ctx = document.getElementById('correlationHeatmap').getContext('2d');
    new Chart(ctx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Correlation Matrix',
                data: features.flatMap((feature1, i) => 
                    features.map((feature2, j) => ({
                        x: feature1,
                        y: feature2,
                        v: correlations[feature1][feature2]
                    }))
                ),
                backgroundColor(context) {
                    const value = context.dataset.data[context.dataIndex].v;
                    const alpha = Math.abs(value);
                    return value < 0 ? 
                        `rgba(255, 99, 132, ${alpha})` : 
                        `rgba(75, 192, 192, ${alpha})`;
                },
                borderWidth: 1,
                borderColor: 'white',
                width: ({chart}) => (chart.chartArea || {}).width / features.length - 1,
                height: ({chart}) => (chart.chartArea || {}).height / features.length - 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.dataset.data[context.dataIndex].v;
                            return `Correlation: ${value.toFixed(3)}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Correlation Heatmap'
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: features,
                    title: {
                        display: true,
                        text: 'Features'
                    }
                },
                y: {
                    type: 'category',
                    labels: features,
                    title: {
                        display: true,
                        text: 'Features'
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
        alert('No data to export');
        return;
    }
    
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
}

// Export JSON summary
function exportJson() {
    if (mergedData.length === 0) {
        alert('No data to export');
        return;
    }
    
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
        const missingCount = mergedData.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
        summary.missingValues[col] = (missingCount / mergedData.length) * 100;
    });
    
    // Calculate numeric statistics
    const numericColumns = ['Age', 'Fare', 'SibSp', 'Parch'];
    numericColumns.forEach(col => {
        const values = mergedData.map(row => row[col]).filter(val => !isNaN(val));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sorted = values.sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
        
        summary.numericStats[col] = {
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            stdDev: stdDev.toFixed(2)
        };
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
}
