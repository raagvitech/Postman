/**
 * @ Author: Vignesha S
 * @ Create Time: 2023-04-17 11:15:34
 * @ Modified by: Your name
 * @ Modified time: 2023-06-30 12:59:21
 * @ Description: APex emthod to perform HTTP callouts
 */

public class ApiCalloutController {

//Generate new access token from user credentials
    @AuraEnabled
    public static string generateNewAccessToken(String header,String accessTokenUrl){

        HTTP http = new HTTP();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setEndpoint(accessTokenUrl);

        String jsonBodyString = APICalloutController.getBodyString(header);
        request.setBody(jsonBodyString);
        HttpResponse response = HTTP.send(request);
        String finalResponse = response.getStatusCode() +' '+  response.getStatus() + response.getBody();
        return finalResponse;
    }


//Create body string

    public static String getBodyString(String body){
        Map<String, Object> bodyMap = (Map<String, Object>)JSON.deserializeUntyped(body);
        String jsonBodyString = '';
        if(bodyMap.size()>0){
            Set <String> bodyKeys = new Set <String>();
            bodyKeys = bodyMap.keySet();
            List<String> keyList = new List<String>(bodyKeys);
            jsonBodyString = keyList[0] + '=' + bodyMap.get(keyList[0]);
            if(bodyMap.size()>1){
                for(Integer i=1;i<keyList.size();i++){
                    jsonBodyString = jsonBodyString + '&' + keyList[i] + '=' + bodyMap.get(keyList[i]);
                }
            }
        }
        return jsonBodyString;
    }


//HTTP callout to get response

    @AuraEnabled
    public static String httpCallout(String inputs,String header){

        Map<String, Object> inputparamsMap = (Map<String, Object>)JSON.deserializeUntyped(inputs);
        Map<String, Object> headerMap = (Map<String, Object>)JSON.deserializeUntyped(header);

        String endpoint = String.valueOf(inputparamsMap.get('url'));
        String authType = String.valueOf(inputparamsMap.get('auth'));
        String method = String.valueOf(inputparamsMap.get('method'));
        String token = String.valueOf(inputparamsMap.get('token'));
        String body = String.valueOf(inputparamsMap.get('body'));

        Http http = new HTTP();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint);
        request.setMethod(method);

        if(headerMap.size()>0){
            String jsonBodyString = ApiCalloutController.getBodyString(header);
            request.setBody(jsonBodyString);
        }

        if(body!=null){
            String jsonBodyString = ApiCalloutController.getBodyString(body);
            request.setBody(jsonBodyString);
        }
        if(token!=null){
            String access_token = token;
            request.setHeader('Authorization', 'Bearer ' + access_token);
        }

        if(authType == 'Basic authentication'){
            String username = String.valueOf(headerMap.get('username'));
            String password = String.valueOf(headerMap.get('password'));
            Blob headerValue = Blob.valueOf(username + ':' + password);
            String authorizationHeader = 'BASIC ' +EncodingUtil.base64Encode(headerValue);
            request.setHeader('Authorization', authorizationHeader);
        }
        HttpResponse response = http.send(request);
        String finalResponse = response.getStatusCode() +' '+ response.getStatus() + response.getBody();
        return finalResponse;
    }


//HTTP callout to create new resource

    @AuraEnabled
    public static string createNewResource(String token,String body,String endPointUrl){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endPointUrl);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(body);
        request.setHeader('Authorization', 'Bearer ' + token);
        HttpResponse response = http.send(request);
        String finalResponse = response.getStatusCode() +' '+  response.getStatus() + response.getBody();
        return finalResponse;
    }     
}

    

