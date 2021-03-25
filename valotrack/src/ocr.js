"use strict";

const async = require("async");
const fs = require("fs");
const https = require("https");
const path = require("path");
const createReadStream = require("fs").createReadStream;
//const sleep = require("util").promisify(setTimeout);
const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */
const key = process.env.OCR_KEY;
const endpoint = process.env.OCR_ENDPNT;

const OCR_client = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);
// Status strings returned from Read API. NOTE: CASING IS SIGNIFICANT.
// Before Read 3.0, these are "Succeeded" and "Failed"
const STATUS_SUCCEEDED = "succeeded";
const STATUS_FAILED = "failed";
const PIC_URL =
  "http://becomingpeculiar.com/wp-content/uploads/2012/06/bookshelf.jpg";

function fsleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Perform read and await the result from URL
async function readTextFromURL(client, url) {
  // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
  let result = await client.read(url);
  // Operation ID is last path segment of operationLocation (a URL)
  let operation = result.operationLocation.split("/").slice(-1)[0];

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  while (result.status !== STATUS_SUCCEEDED) {
    console.log(`Waiting for OCR: ${result.status}`);
    await fsleep(1000);
    result = await client.getReadResult(operation);
  }
  console.log("Returning OCR results");
  return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
}

//prints text from readResults
function printRecText(readResults) {
  console.log("Recognized text:");
  for (const page in readResults) {
    if (readResults.length > 1) {
      console.log(`==== Page: ${page}`);
    }
    const result = readResults[page];
    if (result.lines.length) {
      for (const line of result.lines) {
        console.log(line.words.map((w) => w.text).join(" "));
      }
    } else {
      console.log("No recognized text.");
    }
  }
}

function computerVision() {
  console.log(`calling API at endpoint: ${endpoint}`);
  async.series(
    [
      async function () {

        printRecText(await readTextFromURL(OCR_client, PIC_URL));
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        });
      },
    ],
    (err) => {
      throw err;
    }
  );
}
export { computerVision as default };
//computerVision();
