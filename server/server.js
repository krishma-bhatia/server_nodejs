/******************************************************************************************
 * Server to listen to Requests and take action
 ******************************************************************************************/

//load http module that's standard with nodejs
const http = require("http");

//host and port that the server will be bound to
const host = 'localhost';
const port = 4567;

//request listener f'n to receive request object and send response object --rename later storeData
const requestListener = (req,res)=>{

    if(req.url === "/import" && req.method === "POST")
    {
        if(req.headers['content-type'] === "text/xml+markr"){
            console.log("XML received");
            //console.log("req.body"+req.message)
            let data = '';
            req.on('data',chunk=>{
                data += chunk;
            })
            req.on('end',chunk=>{
                console.log(data)
            })
        }
        //sets http status code of response
        res.writeHead(200);
    
        //sets HTTP response to be sent back
        res.end("Data Stored Sucessfully");
    }
    else if(req.url === "/import" && req.method === "GET"){

    }
    else{
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
}


//create server
const server = http.createServer(requestListener);

//bind server to n/w address by 3 args-port,host,callback f'n which fires when server begins to listen
server.listen(port,host,()=>{
    console.log(`Server is running on http://${host}:${port}`);

})