/******************************************************************************************
 * Server to listen to Requests and take action
 ******************************************************************************************/

//load http module that's standard with nodejs
const http = require("http");

//xml parser
//const DomParser  = require("dom-parser");
const parser = require("fast-xml-parser");

//host and port that the server will be bound to
const host = 'localhost';
const port = 4567;

//temporary ds to store kids score, later transfer to file
let db = [];
//array of test id's
//[{testid:123,studentsData:[{studentNum:1,}]},{}]

const searchIdIndex = (testId)=>{
    if(db.length === 0)
    {
        return -1;
    }
    else 
    {
        for(let i=0;i<db.length;i++){
            if(db[i].testId === testId)
            {
                return i;
            }
        }
        return -1;

    }
};
//find student
const searchStudent = (studentNumber,studentArray)=>{
    if(studentArray.length === 0){
        return -1;
    }
    else
    {
        for(let i=0;i<studentArray.length;i++)
        {
            if(studentArray[i].studentNumber === studentNumber){
                return i;
            }
        }
        return -1;
    }
};
//Parse the XML data received from POST request and store it
const parseAndStore = (data)=>
{
    try{const jsonData = parser.parse(data,{
        attrNodeName: "#attr",
        textNodeName: "#text",
        attributeNamePrefix: "",
        arrayMode: "true",
        ignoreAttributes: false,
        parseAttributeValue: true,
      },
      true);
      console.log(jsonData);
      console.log("typeof"+Array.isArray(jsonData['mcq-test-results']['mcq-test-result']))
      console.log(jsonData['mcq-test-results']['mcq-test-result'][0])
      console.log(jsonData['mcq-test-results']['mcq-test-result'][1])
      //in case of single student record, the parser returns an object instead of array,so we have to convert it to array of object
      if(Array.isArray(jsonData['mcq-test-results']['mcq-test-result']) === false)
      {
        const tempRecord = jsonData['mcq-test-results']['mcq-test-result'];
        jsonData['mcq-test-results']['mcq-test-result'] = [tempRecord];
      }
      const dataToStore = jsonData['mcq-test-results']['mcq-test-result'].map(studentRecord=>{
          //if(studentRecord['test-id'])
          const testIdIndex = searchIdIndex(studentRecord['test-id']);
          if(testIdIndex === -1)
          {
              console.log("testidnotfound..pushing to db")
              const studentResult={
                studentNumber:studentRecord['student-number'],
                scored:studentRecord['summary-marks']['#attr'].obtained

            };
              const testData = {
                  testId:studentRecord['test-id'],
                  availableScore:studentRecord['summary-marks']['#attr'].available,
                  students:[]
              };
              testData.students.push(studentResult);
              db.push(testData);
              console.log(db[0])
              console.log(db[0].students);
              
          }else //TestId found in array
          {
              console.log("test id found");

              //if available has changed keep the highest value
              if(db[testIdIndex].availableScore < studentRecord['summary-marks']['#attr'].available)
              {
                db[testIdIndex].availableScore =  studentRecord['summary-marks']['#attr'].available;
              }

              //add Student data only if student number not found
              
              const studentIndex = searchStudent(studentRecord['student-number'],db[testIdIndex].students)
              if(studentIndex === -1)
              {
                const studentResult={
                    studentNumber:studentRecord['student-number'],
                    scored:studentRecord['summary-marks']['#attr'].obtained
    
                };
                db[testIdIndex].students.push(studentResult);
              }else   //Duplicate student record, keep the highest score
              {
                  if(db[testIdIndex].students[studentIndex].scored < studentRecord['summary-marks']['#attr'].obtained){
                    db[testIdIndex].students[studentIndex].scored = studentRecord['summary-marks']['#attr'].obtained;
                  }

                  
              }
              console.log(db[0].students)
          }
      });
      //parsed data structure
      /*{
  '#attr': { 'scanned-on': '2017-12-04T12:12:10+11:00' },
  'first-name': 'Jane',
  'last-name': 'Austen',
  'student-number': 521585128,
  'test-id': 1234,
  'summary-marks': { '#attr': { available: 20, obtained: 13 } }
} */
return("Data Stored Successfully");
    }
      catch(err){
          return(`Invalid Data. Error: ${err.message}`);
      }

};

//finds min, max and sum of array, returns and array with these three outputs
const minMaxSumArray = (studentArray)=>{

    return studentArray.reduce((acc, val) => {
        acc[0] = ( acc[0] === undefined || val.scored < acc[0] ) ? val.scored : acc[0];//min
        acc[1] = ( val.scored > acc[1] ) ? val.scored : acc[1];//max
        acc[2] += val.scored;//sum
        return acc;
    }, [,0,0]);
};

//helper function to calculate std dev
const sqrSumArray = (studentArray,mean)=>{
    return studentArray.reduce((total,student)=>{
        const diff = student.scored - mean;
        const sqrDiff = diff * diff;
        return total + sqrDiff;
    },0);
};

//Percentile calculation
const quantile = (sorted, q) => {
  
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base].scored + rest * (sorted[base + 1].scored - sorted[base].scored);
    } else {
        return sorted[base].scored;
    }
};

// sort array ascending
const asc = arr => arr.sort((a, b) => a.scored - b.scored);

//calculate Results and form response to send to GET Req
const findResult = (testId)=>{
    const response = "Initial Response";
    const testIdToNum = parseInt(testId);
    console.log("testIdToNum:"+testIdToNum)
    const testIdIndex = searchIdIndex(testIdToNum);
    
    if(testIdIndex === -1){
        return "Test ID Not Found";
    }
    else{//prepare response 
        /*format sample output:{"mean":65.0,"stddev":0.0,"min":65.0,"max":65.0,"p25":65.0,"p50":65.0,"p
75":65.0,"count":1}*/
        const response = {"mean":0.0,"stddev":0.0,"min":0.0,"max":0.0,"p25":0.0,"p50":0.0,
        "p75":0.0,"count":0}
        //const mean = findStudentArrayMean(db[testIdIndex].students);
        const count = db[testIdIndex].students.length;
        const minMaxSum = minMaxSumArray(db[testIdIndex].students);
        const sum = minMaxSum[2];
        const mean = sum/count;
        const percentage = 100/db[testIdIndex].availableScore;
        response["mean"] = parseFloat(mean*percentage).toFixed(1);
        response["min"] = parseFloat(minMaxSum[0]*percentage).toFixed(1); 
        response["max"] = parseFloat(minMaxSum[1]*percentage).toFixed(1);
        response["count"] = count;
        const sqrSum = sqrSumArray(db[testIdIndex].students,mean);
        //const stdDev = sqrSum/count;
        response["stddev"] = parseFloat(sqrSum/count*percentage).toFixed(1);
        const sorted = asc(db[testIdIndex].students);//array sorting
        response["p25"] = parseFloat(quantile(sorted, .25)*percentage).toFixed(1);
        response["p50"] = parseFloat(quantile(sorted, .50)*percentage).toFixed(1);
        response["p75"] = parseFloat(quantile(sorted, .75)*percentage).toFixed(1);
        
        //return string interpolation to match the required output format
        return (`{"mean":${response["mean"]},"stddev":${response["stddev"]},"min":${response["min"]},"max":${response["max"]},"p25":${response["p25"]},"p50":${response["p50"]},"p75":${response["p75"]},"count":${response["count"]}}`);
    }

}
//handle Get req
const handleGetReq = (url)=>{
    const urlArray = url.split("/");

    if(urlArray.length ===4)
    {
    if(urlArray[1] === "results" && !(isNaN(urlArray[2])) && urlArray[3] === "aggregate")
    {
        return findResult(urlArray[2]);
    }
    else
    {
        return "Invalid Request";
    }
    }
    else{
        return("Invalid Request");
    }
}
//request listener f'n to receive request object and send response object --rename later storeData
const requestListener = async (req,res)=>{

    if(req.url === "/import" && req.method === "POST")
    {
        let code = 200;
        let response = "SUCCESS";
        if(req.headers['content-type'] === "text/xml+markr"){
            //console.log("XML received");
           
            /*********Simplest way to get data from POST Req******* */
            // let data = '';
            // req.on('data',chunk=>{
            //     data += chunk;
            // })
            // req.on('end',chunk=>{
            //     console.log(data)
            // })
            const buffers = [];

            for await (const chunk of req) {
              buffers.push(chunk);
            }
          
            const data = Buffer.concat(buffers).toString();
          
            //console.log("Unparsed Data:"+data); 
            if((data.slice(0,5) === "<<XML") && (data.slice(-5) ==="XML>>")){
                //console.log("valid data")
                //console.log("sliced data"+(data.slice(5)).slice(0,-5))
                const status = parseAndStore((data.slice(5)).slice(0,-5));

                if(status === "Data Stored Successfully"){
                    code = 200; //Success
                }else{
                    code = 400; //Invalid req error
                }
                response = status;
            }else //invalid tags
            {
                console.log("Invalid data") 
                //sets http status code of response
                //res.writeHead(400);
                code = 400;
                response = "400:BAD REQUEST";
            }
        }else //Invalid Header
        {
            code = 400;
            response = "400:BAD REQUEST";
        }
        //sets http status code of response
        res.writeHead(code);
        //sets HTTP response to be sent back
        res.end(response);

    }
    else if(req.method === "GET"){
        console.log("GET Received URL:" +req.url);
       
        const responseToSend = handleGetReq(req.url);
        const code = responseToSend[0] === "{"?200:400;
        res.writeHead(code, { "Content-Type": "text/html" });
        res.end(responseToSend);
    }
    else{
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
};


//create server
const server = http.createServer(requestListener);

//bind server to n/w address by 3 args-port,host,callback f'n which fires when server begins to listen
server.listen(port,host,()=>{
    console.log(`Server is running on http://${host}:${port}`);

})

module.exports = {handleGetReq, parseAndStore};