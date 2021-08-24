const assert = require("assert");
const { handleGetReq, parseAndStore } = require("./server");

//handleGetReq
describe("handleGetReq", () => {
    it("should handle get req with invalid endpoint", () => {
      //Setup
      const url = "/results/1234/aggregat";
      const expected = "Invalid Request";
      //Exercise
      const actual = handleGetReq(url);
      //Verify
      assert.strictEqual(actual, expected);
    });
    it("should handle get req with invalid url", () => {
        //Setup
        const url = "/result/1234/aggregate";
        const expected = "Invalid Request";
        //Exercise
        const actual = handleGetReq(url);
        //Verify
        assert.strictEqual(actual, expected);
      });
      it("should handle get req with non-existing Test ID", () => {
        //Setup
        const url = "/results/1234/aggregate";
        const expected = "Test ID Not Found";
        //Exercise
        const actual = handleGetReq(url);
        //Verify
        assert.strictEqual(actual, expected);
      });
      it("should handle get req with valid Test ID", () => {
        //Setup
        const url = "/results/1234/aggregate";
        const data = `<mcq-test-results><mcq-test-result scanned-on="2017-12-04T12:12:10+11:00"><first-name>Jane</first-name><last-name>Austen</last-name><student-number>521585129</student-number><test-id>1234</test-id><summary-marks available="20" obtained="13" /></mcq-test-result>  </mcq-test-results>`;
        const status = parseAndStore(data);
         const expected = `{"mean":65.0,"stddev":0.0,"min":65.0,"max":65.0,"p25":65.0,"p50":65.0,"p75":65.0,"count":1}`;

         //Exercise
        const actual = handleGetReq(url);

        //Verify
        assert.strictEqual(actual, expected);
      });
    
  });

  //parseAndStore
describe("parseAndStore", () => {
    it("should return error for invalid xml data - empty string", () => {
      //Setup
      const data = "";
      const expected = "Invalid Data. Error: Start tag expected.";
      //Exercise
      const actual = parseAndStore(data);
      //Verify
      assert.strictEqual(actual, expected);
    });
    it("should return error for invalid xml data no closing tag", () => {
        //Setup
        const data = `<mcq-test-results><mcq-test-result scanned-on="2017-12-04T12:12:10+11:00">`;
        const expected = `Invalid Data. Error: Invalid '[    "mcq-test-results",    "mcq-test-result"]' found.`;
        //Exercise
        const actual = parseAndStore(data);
        //Verify
        assert.strictEqual(actual, expected);
      });
      it("should return success when input xml data is valid", () => {
        //Setup
        const data = `<mcq-test-results><mcq-test-result scanned-on="2017-12-04T12:12:10+11:00"><first-name>Jane</first-name><last-name>Austen</last-name><student-number>521585129</student-number><test-id>1234</test-id><summary-marks available="20" obtained="13" /></mcq-test-result>  </mcq-test-results>`;

        const expected = `Data Stored Successfully`;
        //Exercise
        const actual = parseAndStore(data);
        //Verify
        assert.strictEqual(actual, expected);
      });

  });

