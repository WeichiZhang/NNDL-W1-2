Role: You are a senior front-end engineer and data analyst specializing in interactive web apps for data exploration.
Overall Task: 
Task 1:
Build a browser-only, GitHub Pages-deployable web app that performs interactive Exploratory Data Analysis (EDA) on the Kaggle Titanic dataset (from https://www.kaggle.com/competitions/titanic/data), which is split into train.csv (with Survived label) and test.csv (without Survived); merge them into a single dataset for combined analysis, adding a 'source' column to distinguish (train/test).
Task 2:
Visualize based on the data provided from the file “test.csv” and “train.csv” by the charts and dashboard.
Task 3:
Demonstrate the most important factors that caused the death in Titanic.
Strictly output in two separate code blocks:
1.	Label the first as 'index.html' (for HTML structure and UI, with basic CSS)
2.	Label the second as 'app.js' (for JavaScript logic)
Use CDN libraries: • PapaParse (robust CSV parse, handle commas in quotes) • Chart.js (charts) All processing must run client-side. Link app.js from index.html via <script src="app.js"></script>.
Workflow:
•	In index.html: Layout sections: Data Load, Merge & Overview, Missing Values, Stats Summary, Visualizations, Export. Add file inputs for train.csv and test.csv. Use basic CSS for responsiveness. Include deployment note text: 'Create public GitHub repo, commit index.html/app.js, enable Pages (main/root), test URL.'
•	In app.js: Data Schema: Target: Survived (0/1, train only). Features: Pclass, Sex, Age, SibSp, Parch, Fare, Embarked. Identifier: PassengerId (exclude). // Reuse note: Swap schema for other datasets.
•	In app.js: Load + merge train.csv & test.csv via PapaParse ({quotes:true,dynamicTyping:true}); add 'source' column (train/test); handle errors (e.g., missing files, alert user).
•	In app.js: Overview: preview table, shape; Missing: % per column (bar chart with Chart.js).
•	In app.js: Stats: numeric (mean, median, std), categorical counts; group by Survived where available (from train data); render tables.
•	In app.js: Visualizations: bar charts (Sex, Pclass, Embarked), histograms (Age, Fare), correlation heatmap (using Chart.js).
•	In app.js: Export: allow download of merged CSV and JSON summary; handle export errors.
•	In app.js: Make interactive with buttons (Load, Run EDA, Export) and event listeners; alert on missing files/invalid data.
Add English comments in code. Ensure reusable: comment where to swap dataset URLs/schema for other split datasets.
