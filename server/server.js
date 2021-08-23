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
    const jsonData = parser.parse(data,{
        attrNodeName: "#attr",
        textNodeName: "#text",
        attributeNamePrefix: "",
        arrayMode: "true",
        ignoreAttributes: false,
        parseAttributeValue: true,
      },
      true);
      console.log(jsonData);
      console.log(jsonData['mcq-test-results']['mcq-test-result'][0])
      console.log(jsonData['mcq-test-results']['mcq-test-result'][1])

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
              //add Student data only if student number not found
              
              const studentIndex = searchStudent(studentRecord['student-number'],db[testIdIndex].students)
              if(studentIndex === -1)
              {
                const studentResult={
                    studentNumber:studentRecord['student-number'],
                    scored:studentRecord['summary-marks']['#attr'].obtained
    
                };
                db[testIdIndex].students.push(studentResult);
              }
              console.log(db[0].students)
          }
      });
      /*{
  '#attr': { 'scanned-on': '2017-12-04T12:12:10+11:00' },
  'first-name': 'Jane',
  'last-name': 'Austen',
  'student-number': 521585128,
  'test-id': 1234,
  'summary-marks': { '#attr': { available: 20, obtained: 13 } }
} */

};
//calculate Results
const findResult = (testId)=>{
    const response = "Initial Response";
    const testIdToNum = parseInt(testId);
    console.log("testIdToNum:"+testIdToNum)
    const testIdIndex = searchIdIndex(testIdToNum);
    console.log(typeof testIdToNum);
    console.log(testIdIndex);
    console.log( db[0].testId);
    
    if(testIdIndex === -1){
        return "Test ID Not Found";
    }
    else{
        return "Test ID Found";
    }

    return response;
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
        if(req.headers['content-type'] === "text/xml+markr"){
            console.log("XML received");
            //console.log("req.body"+req.message)
            /*********Simple way to get data from POST Req******* */
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
          
            console.log("Unparsed Data:"+data); 
            parseAndStore(data);
            

        }
        //sets http status code of response
        res.writeHead(200);
    
        //sets HTTP response to be sent back
        res.end("Data Stored Sucessfully");
    }
    else if(req.method === "GET"){
        console.log("GET Received URL:" +req.url);
       
        const responseToSend = handleGetReq(req.url);
        res.writeHead(200, { "Content-Type": "text/html" });
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