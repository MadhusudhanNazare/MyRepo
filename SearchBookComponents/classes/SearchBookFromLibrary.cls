public without sharing class SearchBookFromLibrary {
    public SearchBookFromLibrary() {

    }

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getBookByName(String SearchText){
        Map<String, String> apexResponse = new Map<String, String>();
        try{
            //string endpointURL;
            system.debug('SearchText'+SearchText);
            String baseURL = '';
            
            baseURL = System.Label.OpenLibraryURL+SearchText+'&sort=new';
            system.debug('baseURL : ' + baseURL);
            
            HttpRequest httpRequest = new HttpRequest();
            httpRequest.setMethod('GET');
            httpRequest.setEndpoint(baseURL);
            httpRequest.setTimeout(120000);                   
    		
            system.debug('httpRequest : ' + httpRequest);
            Http httpObj = new Http();
            HttpResponse response = httpObj.send(httpRequest);
                    
            apexResponse.put('StatusCode', '' + response.getStatusCode());
			system.debug('response : ' + response.getBody());            
            if(response.getStatusCode() == 200 && String.isNotBlank(response.getBody())){
                apexResponse.put('Success', '' + response.getBody());              
                
            }else{
                apexResponse.put('Error', response.getBody());
            }
        }catch(Exception ex){
            System.debug('Exception ex : ' + ex.getMessage() + ', Stack : ' + ex.getStackTraceString());
            apexResponse.put('Error', ex.getMessage() + ', stack : ' + ex.getStackTraceString());
        }
        
		return apexResponse;
        
    }

}