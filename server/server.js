const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const path = require('path');
const database = require('../database');
const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

//==========================================================
//Need to set up query parameters for parent object of nested results array including page, count, sort, and product_id
//Look up ORDER BY to handle sort portion of request

const reviewsResultsArrayBuilder = (num) => {

  database.query(
    `SELECT reviews.review_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, reviews.date, reviews.reviewer_name, reviews.helpfulness, (
      SELECT JSON_BUILD_OBJECT(
        'id', id, 'url', url
      ) AS photos
      FROM reviews_photos
      WHERE reviews_photos.review_id = ${num}
      GROUP BY id)
    FROM reviews
    LEFT JOIN reviews_photos
    ON reviews_photos.review_id = reviews.review_id
    WHERE reviews.product = ${num}
    GROUP BY reviews.review_id`, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const results = data.rows;
      console.log(results);
    }
  });
}

app.get('/reviews', (req, res) => {
  reviewsResultsArrayBuilder(15);
});



//============================================================

// SELECT JSON_BUILD_OBJECT(
//   'photos', (SELECT JSON_AGG(ROW_TO_JSON("reviews_photos")) FROM reviews_photos))

// These build each part of the ratings object one by one
// SELECT COUNT(*) AS "1" FROM reviews WHERE rating = 1
// SELECT COUNT(*) AS "2" FROM reviews WHERE rating = 2;
// SELECT COUNT(*) AS "3" FROM reviews WHERE rating = 3;
// SELECT COUNT(*) AS "4" FROM reviews WHERE rating = 4;
// SELECT COUNT(*) AS "5" FROM reviews WHERE rating = 5;

// These build each part of the recommend object
// SELECT COUNT(*) AS "false" FROM reviews WHERE recommend = false;
// SELECT COUNT(*) AS "true" FROM reviews WHERE recommend = true;

// This creates average value for characteristics.quality.value
// `SELECT AVG(value) AS "value" FROM characteristic_reviews`

// SELECT characteristics.name, characteristics.id FROM characteristics INNER JOIN ON characteristic_reviews WHERE characteristics.id = characteristic_reviews.characteristic_id;


const metadataObjectBuilder = (num) => {

  // SELECT JSON_BUILD_OBJECT(
  //   'id', id, 'url', url
  // ) AS photos
  // FROM reviews_photos
  // WHERE reviews_photos.review_id = ${num}
  // GROUP BY id

  database.query(
    `SELECT JSON_BUILD_OBJECT(
      '1', value,
      '2', value,
      '3', value,
      '4', value,
      '5', value
    ) AS ratings
    FROM characteristic_reviews
    WHERE characteristic_reviews.review_id = ${num}
    GROUP BY id`, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const results = data.rows;
      console.log(results);
    }
  });
}

app.get('/reviews/meta', (req, res) => {
  metadataObjectBuilder(15);
});

app.listen(port, () => {
  console.log(`Reviews service listening at http://localhost:${port}`);
})