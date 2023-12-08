// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

async function createDataset() {
  // Load dotenv configuration
  require('dotenv').config();

  // Get environment variables
  const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

  // Creates a client
  const bigqueryClient = new BigQuery({GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_API_KEY});

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
    const [job1] = await bigqueryClient.createQueryJob(query);
    const [job2] = await bigqueryClient.createQueryJob(query2);

    // Wait for the query to finish
    const [topData] = await job1.getQueryResults();
    const [risingData] = await job2.getQueryResults();

    const map = new Map();
    topData.forEach((trend) => {
      map.set(trend.term.toUpperCase(), false);
    });

    risingData.forEach((trend) => {
      if (map.has(trend.term.toUpperCase())) {
        map.set(trend.term.toUpperCase(), true);
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
  app.listen(port);
});

// Imports
const express = require('express');
const app = express();
const port = 3000;

// Static Files
app.use(express.static('public'));
app.use('/js', express.static(__dirname + 'public/js'));

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');
