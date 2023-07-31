// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

async function createDataset() {
  // Creates a client
  const bigqueryClient = new BigQuery();

  const query = `SELECT term, ARRAY_AGG(STRUCT(rank, week) ORDER BY week DESC LIMIT 1) x
        FROM \`bigquery-public-data.google_trends.top_terms\`
        WHERE refresh_date = 
            (SELECT
                MAX(refresh_date)
            FROM \`bigquery-public-data.google_trends.top_terms\`  
            )
        GROUP BY term
        ORDER BY (SELECT rank FROM UNNEST(x))`;

  const query2 = `SELECT term, ARRAY_AGG(STRUCT(rank, week) ORDER BY week DESC LIMIT 1) x
        FROM \`bigquery-public-data.google_trends.top_rising_terms\`
        WHERE refresh_date = 
            (SELECT
                MAX(refresh_date)
            FROM \`bigquery-public-data.google_trends.top_rising_terms\`  
            )
        GROUP BY term
        ORDER BY (SELECT rank FROM UNNEST(x))`;

  try {
    // Run the query as a job
    const [job] = await bigqueryClient.createQueryJob(query);
    const [job2] = await bigqueryClient.createQueryJob(query2);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();
    const [rows2] = await job2.getQueryResults();

    const map = new Map();
    rows.forEach((row) => {
      map.set(row.term.toUpperCase(), false);
    });

    rows2.forEach((row) => {
      if (map.has(row.term.toUpperCase())) {
        map.set(row.term.toUpperCase(), true);
      }
    });

    return map;
  } catch (error) {
    console.log('error: ' + error);
  }
}

createDataset().then((map) => {
  app.get('', (req, res) => {
    res.render('index', { map });
  });
  app.listen(port, () => console.info(`App listening on port ${port}`));
});

// Imports
const express = require('express');
const app = express();
const port = 3000;

// Static Files
app.use(express.static('public'));
// Specific folder example
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/images'));

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation
