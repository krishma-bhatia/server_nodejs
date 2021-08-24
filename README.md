# server_nodejs
• Any key assumptions : 
-The input will come in XML Stream in POST Req as mentioned in the pdf: <<XML <xml-data></xml-dta>  XML>>
-Saved data in global structure instead of file due to time constraint.
-Have used JS Sort algorithm to find percentiles instead of other alghorithms.So, scope of improvement here
-Formatted the output as shown in PDF
-Have done a bit of Mocha testing on two major funtions in the code
-For sake of simpliciy, I have put all the code in one file server.js

• A short description of the approach you took
I verified the POST request, parsed xml data using fast-xml-parser and stored data in global structure for POST Request
For GET Request, a check is mae for Test ID .If Found, required calculations are done and sent in response to GET.
Handled Duplicate data conditions
Did error handling
Set HTTP error codes in case of Bad Requests

• Instructions on how to build/run it (the DevOps team aren't the sharpest
tools in the shed, so spell it out for them)
