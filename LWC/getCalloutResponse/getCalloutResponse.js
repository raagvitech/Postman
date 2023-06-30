import { LightningElement,track} from 'lwc';
import generateNewAccessToken from '@salesforce/apex/APICalloutController.generateNewAccessToken';
import httpCallout from '@salesforce/apex/APICalloutController.httpCallout';
import createNewResource from '@salesforce/apex/APICalloutController.createNewResource';
import createNewRemoteSiteRec from '@salesforce/apex/MetadataAPIUtility.createNewRemoteSiteRec';

export default class GetCalloutResponse extends LightningElement {
    @track url = ''
    @track fetchedData
    @track jsonBodyValue = null
    @track basicAuth = false
    @track oAuth = false
    @track bearerToken = false
    @track keysarray = []
    @track valuesarray = []
    @track response = false
    @track generateJSONClicked = false
    @track inputsDisabled = false
    @track userData
    @track urlActiveSection = 'URLSEC'
    @track authActiveSection = 'AUTHSEC'
    @track bodyActiveSection = 'BODYSEC'

    @track accessFullname = 'None'
    @track accessremoteUrl = 'None'

    @track urlSection = true
    @track bodySection = false
    @track authSection = false

    @track nextSec = true
    @track sendSec = false

    @track headerValues = new Object();
    @track inputparams = {auth:'None',method:'GET'}

    @track key=[]
    @track value=[]

//Handle selecting HTTP method

    methodValue = 'GET';
    get methodOptions() {
        return [
            {label: 'GET', value: 'GET'},
            {label: 'POST', value: 'POST'},
            {label: 'PUT', value: 'PUT'},
            {label: 'DELETE', value: 'DELETE'}
        ]
    }

    handleMethodChange(event){
        this.methodValue = event.target.value
        this.inputparams.method = this.methodValue
        if(this.methodValue == 'GET' || this.methodValue == 'DELETE'){
            this.bodySection = false
            this.keysarray = []
            this.valuesarray = []
            this.jsonBodyValue = ''
            this.inputparams.body = undefined
        }
        if(this.authSection == true &&(this.methodValue == 'GET' || this.methodValue == 'DELETE')){
            this.nextSec = false
        }else{
            this.nextSec = true
        }
        
    }
 
    
//Handle URL change

    onUrlChange(event){
        this.url = event.target.value
        this.inputparams.url = this.url
    }


//Handle displaying next sections when next button clicked

    nextSection(){  
        this.sendSec = true

        if(this.methodValue != 'GET' && this.methodValue != 'DELETE' && this.authSection == true){
            this.bodySection = true
        }

        if(this.urlSection == true){ 
            this.authSection = true
        }
        if((this.authSection == true &&(this.methodValue == 'GET' || this.methodValue == 'DELETE'))||this.bodySection==true){
            this.nextSec = false
        } 
    }


//Handle selecting authorization type

    authvalue = 'None';
    get authOptions() {
        return [
            { label: 'None', value: 'None' },
            { label: 'Basic authentication', value: 'Basic authentication' },
            { label: 'OAuth 2.0', value: 'OAuth 2.0' },
            { label: 'Bearer token', value: 'Bearer token' }
        ];
    }

    handleAuthChange(event) {
        this.authvalue = event.detail.value;
        this.inputparams.auth = this.authvalue

        this.basicAuth = (this.authvalue == 'Basic authentication');
        this.oAuth = (this.authvalue == 'OAuth 2.0')
        this.bearerToken = (this.authvalue == 'Bearer token')
        
    }

//Handle adding header values for OAuth 2.0 and Basic auth

    usernameChange(event){
        this.username = event.target.value
        this.headerValues.username=this.username;
    }
       
    passwordChange(event){
        this.password = event.target.value
        this.headerValues.password=this.password;
    }

    grantTypeChange(event){
        this.grantType = event.target.value
        this.headerValues.grant_type=this.grantType;
    }
    clientIdChange(event){
        this.clientId = event.target.value
        this.headerValues.client_id=this.clientId;
    }
    clientSecretChange(event){
        this.clientSecret = event.target.value
        this.headerValues.client_secret=this.clientSecret;
    }
    accessTokenUrlChange(event){
        this.tokenUrl = event.target.value
    }

    bearerTokenValueChange(event){
        this.token = event.target.value
        this.inputparams.token = this.token
    }
    

//Handle entering body detils in the form


    keyChangeHandler(event){
        this.key[event.target.dataset.index]  = event.target.value
        this.keyindexdata = event.target.dataset.index;
        if(this.key[event.target.dataset.index].length>0){
            this.keysarray[event.target.dataset.index] = this.key[event.target.dataset.index]
        }  
    }

    valueChangeHandler(event){

        this.value[event.target.dataset.index] = event.target.value
        this.valindexdata = event.target.dataset.index;
        if(this.value[event.target.dataset.index].length>0){
            this.valuesarray[event.target.dataset.index] = this.value[event.target.dataset.index]
        }
    }
    clearBody(){
        this.jsonBodyValue = ''
        this.inputparams.body = undefined
    }
    
//Delete a key-value pair at a particular index

    delClicked(event){

        this.keysarray.splice(event.target.dataset.index, 1)
        this.valuesarray.splice(event.target.dataset.index, 1)
        this.forms.splice(event.target.dataset.index,1)
    }
    
    
// Handle add or remove forms

    count = 1
    @track forms = [0,1,2]
    addForm(){

        this.count = this.count+1
        this.forms.push(this.count)
    } 
    
    get isDisabled(){
        return this.forms.length < 2
    }

//Generate JSON from form data

    generateJSON(){

        this.generateJSONClicked = true
        var jsonbody = {};

        for (var i = 0; i < this.keysarray.length; i++) {
            var k = this.keysarray[i];
            var val = this.valuesarray[i];
            jsonbody[k] = val
        }

        this.jsonBodyValue = JSON.stringify(jsonbody)
        this.inputparams.body = this.jsonBodyValue
    } 


//Handle done button click

    doneClicked(){
        
//Verify whether url is valid
        function isValidHttpUrl(string) {
            try{
                const newUrl = new URL(string);
                return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
            }catch (err) {
                return false;
            }
        }
        if(isValidHttpUrl(this.url)==true){
            this.response = true
            this.fetchedData = ''

            //Create String from User inputs
            this.userInputs = 'URL: ' + this.url  + '\n' + 'Method: ' + this.methodValue  + '\n' + 'Authentication: ' + this.authvalue + '\n' + 'Body: ' + this.jsonBodyValue + '\n'

            if(this.authvalue == 'Basic authentication'){
                this.userInputs =  this.userInputs + '\n' + 'Authentication details: ' + '\n' + 
                                    'Username: ' + this.username + '\n' + 
                                    'Password: ' + this.password + '\n'
            }

            else if(this.authvalue == 'OAuth 2.0'){
            this.userInputs =  this.userInputs + '\n' + 'Authentication details: ' + '\n' +  
                            'Username: ' + this.username + '\n' + 
                            'Password: ' + this.password + '\n' + 
                            'Grant type: ' + this.grantType + '\n' +
                            'Client Id: ' + this.clientId + '\n' +
                            'Client secret: ' + this.clientSecret + '\n'+
                            'Access URL: ' + this.tokenUrl + '\n'
            }

            else if(this.authvalue == 'Bearer token'){
            this.userInputs =  this.userInputs + '\n' + 'Authentication details: ' + '\n' +  'Bearer token: ' + this.token
            }
            else{}


//Create a new remote site settings based on input

            var pathArray = this.url.split( '/' );
            var protocol = pathArray[0];
            var host = pathArray[2];
            var baseurl = protocol + '//' + host;
            const remoteUrl = baseurl
            const fullname = baseurl.replace(/[^a-zA-Z ]/g, "")
        

            if(this.authvalue == 'OAuth 2.0'){
                var accesspathArray = this.tokenUrl.split( '/' );
                var accessprotocol = accesspathArray[0];
                var accesshost = accesspathArray[2];
                var accessbaseurl = accessprotocol + '//' + accesshost;
                this.accessremoteUrl = accessbaseurl
                this.accessFullname = this.accessremoteUrl.replace(/[^a-zA-Z ]/g, "")

            }else{
                this.accessremoteUrl = 'None'
                this.accessFullname = 'None'
            }


            createNewRemoteSiteRec({remoteSiteName:fullname,RemoteSiteUrl:remoteUrl,accessTokenUrl:this.accessremoteUrl,accessTokenFullname:this.accessFullname})
            .then(result=>{

            })
            .catch(error=>{
                this.error = error.message;
                alert(JSON.stringify(error.body.message))
            })
        }else{
            alert('Invalid URL')
        }
    }
    getData(){

//If method is GET or DELETE, make input body null
        if(this.methodValue == 'GET' || this.methodValue == 'DELETE'){
            
            this.inputparams.body = undefined
            this.jsonBodyValue = ''
        }
//If authentication is OAuth 2.0 get access token

        if(this.authvalue == 'OAuth 2.0'){
            generateNewAccessToken({header:JSON.stringify(this.headerValues),accessTokenUrl:this.tokenUrl})  
            .then(result=>{
                this.responseval = result
                this.responseBody = this.responseval.slice(this.responseval.indexOf('{'))
                this.jsonresponsebody = JSON.parse(this.responseBody)
                this.accesstoken = this.jsonresponsebody['access_token']
                this.inputparams.token = this.accesstoken

//If method is POST or PUT to create new resource

                if(this.methodValue == 'POST' || this.methodValue == 'PUT'){
                    createNewResource({token:this.accesstoken,body:this.inputparams.body,endPointUrl:this.inputparams.url})
                    .then(result=>{
                        this.fetchedData = result;
                    })
                    .catch(error =>{
                        this.error = error.message;
                        alert(JSON.stringify(error.body.message))
                    })
            //Else other methods        
                }else{
                    httpCallout({inputs:JSON.stringify(this.inputparams),header:JSON.stringify(this.headerValues)})
                    .then(result=>{
                        this.fetchedData = result;
                    })
                    .catch(error =>{
                        this.error = error.message;
                        alert(JSON.stringify(error.body.message))
                    })  
                }
            })
            .catch(error =>{
                this.error = error.message;
                alert(JSON.stringify(error.body.message))
            })           
        }

//If authentication is not OAuth 2.0

        else{
            httpCallout({inputs:JSON.stringify(this.inputparams),header:JSON.stringify(this.headerValues)})
            .then(result=>{
                
                this.fetchedData =  result
            })
            .catch(error =>{
                this.error = error.message;
                alert(JSON.stringify(error.body.message))
            })
        }   
    }

//Handle edit inputs button clicked
    editInputs(){
        this.response = false
    } 
    customHideModalPopup(){
        this.response = false
    }

}    