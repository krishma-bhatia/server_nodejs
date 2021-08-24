  # server_nodejs
• Any key assumptions :
-The code has been written in Javascript (and run using NodeJS)
-The input will come in XML Stream in POST Req as mentioned in the pdf: <<XML <xml-data></xml-dta>  XML>>
-Saved data in global structure instead of file due to time constraint.
-Have used JS Sort algorithm to find percentiles instead of other alghorithms.So, scope of improvement here
-Formatted the output as shown in PDF
-Have done a bit of Mocha testing on two major funtions in the code
-For sake of simpliciy, I have put all the code in one file server.js
-Tested data with 3 student records due to time constraints
-Some console logs are present in code to help with debugging

• A short description of the approach you took
I verified the POST request, parsed xml data using fast-xml-parser and stored data in global structure for POST Request
For GET Request, a check is mae for Test ID .If Found, required calculations are done and sent in response to GET.
Handled Duplicate data conditions
Did error handling
Set HTTP error codes in case of Bad Requests
Did little bit of testing to check output of main f'ns for POST and GET

• Instructions on how to build/run it (the DevOps team aren't the sharpest
tools in the shed, so spell it out for them)

Download the zip file.Extract the contents.Open folder server_nodejs-main in VS Code .(I used gitBash for commands) 
cd server_nodejs-main
ls will give two folders-server and test
server folder contains the code in server.js
test folder contains test files
-To run the code:
npm install
cd server
node server.js
This will open the server port.

Open another terminal
Type : curl -X POST -H 'Content-Type: text/xml+markr' http://localhost:4567/import -d @-
Press Enter
Copy following sample data and paste on next line:
<<XML
<mcq-test-results>
<mcq-test-result scanned-on="2017-12-04T12:12:10+11:00">
<first-name>Jane</first-name>
<last-name>Austen</last-name>
<student-number>521585127</student-number>
<test-id>1234</test-id>
<summary-marks available="20" obtained="13" />
</mcq-test-result>
</mcq-test-results>
XML>>
Send The end of stream signal (ON Windows,Gitbash, it can be done using ctrl + Z and Enter)
If successful, a message will be displayed: Data Stored Successfully

Similarly, use curl GET.. command as mentioned in PDF to fetch results


--For Testing:
cd test
npm test
