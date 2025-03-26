
//------------------------------------------------------------------------------
// <autogenerated>
//     This code was generated by wsdl2js tool.
//     Runtime Version: 0.1
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </autogenerated>
//------------------------------------------------------------------------------
	//remote web server request object
	var xmlHttpRequest;
	function getHttpRequest(){
		var http_request;
		if (window.XMLHttpRequest) { // Mozilla, Safari, ...
			 http_request = new XMLHttpRequest();
		}else if (window.ActiveXObject) { // IE
			 http_request = new ActiveXObject("Microsoft.XMLHTTP");
		 }else{
			 alert("Your browser doesn't support to create XMLHttp Object,Some content on this page can't show.");
			 return null;
		}
		 return http_request;
	}

	// define a class to encapsulate invoking of web service
	// the class name is the name of web service
	// url -  location of access web service.
	function ScanLocalService(url){
		// url=http://localhost:5888/ScanLocal
		this.url = url
		this.GetAllScanner=GetAllScanner
		this.Scan=Scan
		this.ScanTo=ScanTo
	}


	// web service method
	function GetAllScanner() {
		soapMess ="<?xml version=\"1.0\" encoding=\"utf-8\"?>"
		+"<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
		+"<soap:Body>"
		+"<GetAllScanner xmlns=\"http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer/ImageServer%2C%20Version%3D1.0.0.0%2C%20Culture%3Dneutral%2C%20PublicKeyToken%3Dnull\">"
		soapMess +="</GetAllScanner>"
		soapMess +="</soap:Body></soap:Envelope>"
		xmlHttpRequest = getHttpRequest()
		xmlHttpRequest.onreadystatechange = GetAllScanner_callback
		xmlHttpRequest.open("POST",this.url,true);
		xmlHttpRequest.setRequestHeader("SOAPAction","http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer.ScanLocal/ImageServer#GetAllScanner");
		xmlHttpRequest.setRequestHeader("Content-Type","text/xml; charset=utf-8");
		xmlHttpRequest.send(soapMess);
	}

	// this function will be called when result return from web service.
	function GetAllScanner_callback(){
	// return value from web service is an xml document.
		var rawData;
		if (xmlHttpRequest.readyState == 4){
			if (xmlHttpRequest.status == 200){
				rawdata = xmlHttpRequest.responseXML;
				var resultNode = rawdata.documentElement.firstChild.firstChild.firstChild;
				var resultValue = new Array();
				for(i = 0;i<resultNode.childNodes.length;i++){
					resultValue[i] = resultNode.childNodes.item(i).firstChild.nodeValue;
				}
				// Now,you can process the returnValue in function GetAllScanner_handler
				GetAllScanner_handler(resultValue);
			}else{
				alert("web service response error:" + xmlHttpRequest.status + "," + xmlHttpRequest.statusText);
			}
		}
	}

	// process result value of method GetAllScanner
	function GetAllScanner_handler(/*ArrayOfScannerInfo*/ resultValue) {

	}



	// web service method
	function Scan(/*ScanParam*/ param) {
		soapMess ="<?xml version=\"1.0\" encoding=\"utf-8\"?>"
		+"<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
		+"<soap:Body>"
		+"<Scan xmlns=\"http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer/ImageServer%2C%20Version%3D1.0.0.0%2C%20Culture%3Dneutral%2C%20PublicKeyToken%3Dnull\">"
		soapMess += "<param>"+param+"</param>"
		soapMess +="</Scan>"
		soapMess +="</soap:Body></soap:Envelope>"
		xmlHttpRequest = getHttpRequest()
		xmlHttpRequest.onreadystatechange = Scan_callback
		xmlHttpRequest.open("POST",this.url,true);
		xmlHttpRequest.setRequestHeader("SOAPAction","http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer.ScanLocal/ImageServer#Scan");
		xmlHttpRequest.setRequestHeader("Content-Type","text/xml; charset=utf-8");
		xmlHttpRequest.send(soapMess);
	}

	// this function will be called when result return from web service.
	function Scan_callback(){
	// return value from web service is an xml document.
		var rawData;
		if (xmlHttpRequest.readyState == 4){
			if (xmlHttpRequest.status == 200){
				rawdata = xmlHttpRequest.responseXML;
				var resultNode = rawdata.documentElement.firstChild.firstChild.firstChild;
				var resultValue = resultNode
				// Now,you can process the returnValue in function Scan_handler
				Scan_handler(resultValue);
			}else{
				alert("web service response error:" + xmlHttpRequest.status + "," + xmlHttpRequest.statusText);
			}
		}
	}

	// process result value of method Scan
	function Scan_handler(/*boolean*/ resultValue) {

	}



	// web service method
	function ScanTo(/*ScanToParam*/ param) {
		soapMess ="<?xml version=\"1.0\" encoding=\"utf-8\"?>"
		+"<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
		+"<soap:Body>"
		+"<ScanTo xmlns=\"http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer/ImageServer%2C%20Version%3D1.0.0.0%2C%20Culture%3Dneutral%2C%20PublicKeyToken%3Dnull\">"
		soapMess += "<param>"+param+"</param>"
		soapMess +="</ScanTo>"
		soapMess +="</soap:Body></soap:Envelope>"
		xmlHttpRequest = getHttpRequest()
		xmlHttpRequest.onreadystatechange = ScanTo_callback
		xmlHttpRequest.open("POST",this.url,true);
		xmlHttpRequest.setRequestHeader("SOAPAction","http://schemas.microsoft.com/clr/nsassem/InfoDoc.ImageServer.ScanLocal/ImageServer#ScanTo");
		xmlHttpRequest.setRequestHeader("Content-Type","text/xml; charset=utf-8");
		xmlHttpRequest.send(soapMess);
	}

	// this function will be called when result return from web service.
	function ScanTo_callback(){
	// return value from web service is an xml document.
		var rawData;
		if (xmlHttpRequest.readyState == 4){
			if (xmlHttpRequest.status == 200){
				rawdata = xmlHttpRequest.responseXML;
				var resultNode = rawdata.documentElement.firstChild.firstChild.firstChild;
				var resultValue = resultNode
				// Now,you can process the returnValue in function ScanTo_handler
				ScanTo_handler(resultValue);
			}else{
				alert("web service response error:" + xmlHttpRequest.status + "," + xmlHttpRequest.statusText);
			}
		}
	}

	// process result value of method ScanTo
	function ScanTo_handler(/*boolean*/ resultValue) {

	}



