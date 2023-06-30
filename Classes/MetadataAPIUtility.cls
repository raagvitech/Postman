/**
 * @ Author: Vignesha S
 * @ Create Time: 2023-05-17 18:42:06
 * @ Modified by: Your name
 * @ Modified time: 2023-06-30 12:58:31
 * @ Description: Apex class to create remote site settings and custom metadata types using Metadata API
 */


public with sharing class MetadataAPIUtility {

//Method to check for exixsting metadatatype records

  @AuraEnabled
  public static void createNewRemoteSiteRec(String remoteSiteName,String RemoteSiteUrl,String accessTokenUrl,String accessTokenFullname){

    List<sftestnamespace__Remote_site_setting__mdt> availableRemoteSites = [select MasterLabel,sftestnamespace__URL__c from sftestnamespace__Remote_site_setting__mdt where sftestnamespace__URL__c =:RemoteSiteUrl];
    List<sftestnamespace__Remote_site_setting__mdt> availableaccessRemoteSites = [select MasterLabel,sftestnamespace__URL__c from sftestnamespace__Remote_site_setting__mdt where sftestnamespace__URL__c =:accesstokenUrl];
 
    if(RemoteSiteUrl!='None'){
      if(availableRemoteSites.size()==0){
        MetadataAPIUtility.RemoteSiteRec(remoteSiteName,RemoteSiteUrl);
      }
    }
    if(accessTokenUrl!='None'){          
      if(availableaccessRemoteSites.size()==0){
        MetadataAPIUtility.RemoteSiteRec(accessTokenFullname,accessTokenUrl);
      }
    }
    MetadataAPIUtility.remoteSite(remoteSiteName,RemoteSiteUrl,accessTokenUrl,accessTokenFullname); 
  } 


  
//Method to create new remote site settings based on user inputs

  @future(callout=true)
  public static void remoteSite(String remoteSiteName,String RemoteSiteUrl,String accessTokenUrl,String accessTokenFullname){
    if(accessTokenUrl != 'None'){ 
      MetadataService.MetadataPort service = new MetadataService.MetadataPort();
      service.SessionHeader = new MetadataService.SessionHeader_element();
      service.SessionHeader.sessionId = UserInfo.getSessionId();
      MetadataService.RemoteSiteSetting remoteSiteSettings = new MetadataService.RemoteSiteSetting();
      remoteSiteSettings.fullName = accessTokenFullname;
      remoteSiteSettings.url = accessTokenUrl;
      remoteSiteSettings.description = 'Remote site settings created from apex';
      remoteSiteSettings.isActive = true;
      remoteSiteSettings.disableProtocolSecurity = false;
      MetadataService.SaveResult[] results = service.createMetadata(
        new List<MetadataService.Metadata>{ remoteSiteSettings }
      );
      for (MetadataService.SaveResult result : results) {
        if (result.success){
        } 
      }              
    }

    if(RemoteSiteUrl != 'None'){
      MetadataService.MetadataPort service = new MetadataService.MetadataPort();
      service.SessionHeader = new MetadataService.SessionHeader_element();
      service.SessionHeader.sessionId = UserInfo.getSessionId();
      MetadataService.RemoteSiteSetting remoteSiteSettings = new MetadataService.RemoteSiteSetting();
      remoteSiteSettings.fullName = remoteSiteName;
      remoteSiteSettings.url = RemoteSiteUrl;
      remoteSiteSettings.description = 'Remote site settings created from apex';
      remoteSiteSettings.isActive = true;
      remoteSiteSettings.disableProtocolSecurity = false;
      MetadataService.SaveResult[] results = service.createMetadata(
        new List<MetadataService.Metadata>{ remoteSiteSettings }
      );
      for (MetadataService.SaveResult result : results) {
        if (result.success) {
        }
      }
    } 
  }


//Method to create new custom metadata type record based on user inputs
  
  public static void RemoteSiteRec(String name,String url){

    Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
    customMetadata.fullName = 'sftestnamespace__Remote_site_setting__mdt.Remote_site_setting';
    customMetadata.label = name;

    Metadata.CustomMetadataValue nameField = new Metadata.CustomMetadataValue();
    nameField.field = 'sftestnamespace__Name__c';
    nameField.value = name;

    Metadata.CustomMetadataValue valueField = new Metadata.CustomMetadataValue();
    valueField.field = 'sftestnamespace__URL__c';
    valueField.value = url;

    customMetadata.values = new List<Metadata.CustomMetadataValue>{ nameField, valueField };

    Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
    mdContainer.addMetadata(customMetadata);

    Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, null);

  }
}  
