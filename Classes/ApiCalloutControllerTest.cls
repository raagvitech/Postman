@isTest
private class ApiCalloutControllerTest {
    @isTest 
    static void testBasicAuthCallout() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        String jsonbody = JSON.serialize('{"username":"raagvitech.com","password":"ElTjfZY3HyqRsReFBhjKpfHd"}');
        String inputs = '{"url":"https://example.com/example/test","auth":"Basic authentication","method":"GET","token":"testtoken123","body":' + jsonbody + '}';
        String header = '{"username":"test","password":"test123"}';
        String res = ApiCalloutController.httpCallout(inputs,header);
        System.assertEquals(res,'200 OKResponse body');
    }

    @isTest 
    static void testcreateResource() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        String token = 'test1234';
        String body = 'body';
        String endPointUrl = 'https://example.com/example/test';
        String res = ApiCalloutController.createNewResource(token,body,endPointUrl);
        System.assertEquals(res,'200 OKResponse body');
    }
    @isTest 
    static void generateNewAccessTokenTest() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        String header = '{"username":"test","password":"test123"}';
        String accessTokenUrl = 'https://example.com/example/test';
        String res = ApiCalloutController.generateNewAccessToken(header,accessTokenUrl);
        System.assertEquals(res,'200 OKResponse body');
    }
}