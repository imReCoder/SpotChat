import { Injectable,NgZone } from '@angular/core';
import { FirebaseStorageService } from '../services/firebase-storage.service';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { EventsService } from '../services/events.service';
import { ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  constructor(private webView:WebView,private toastCtrl:ToastController,private file:File,private _fileTransfer:FileTransfer,private platform:Platform,
    private ngZone: NgZone,private fStorage:FirebaseStorageService,private storage:Storage,private eventsService:EventsService) { }


  gotFile(file){
    if (file) {
      //this.chooserUri=file.uri;
      this.getUrl(file);
    //  this.send(file);
      // this.fStorage.uploadFile(file,'client phone').then(()=>{
      //   alert('upload success');
      // })
    }else{
      alert("no file got");
    }
  }

    async presentToast(text,time) {
      const toast = await this.toastCtrl.create({
        message:text,
        duration: time*1000,
        animated:true,
        color:'dark',
        translucent:true
      });
      toast.present();
    }

  private getUrl(file): void {
    var uri=file.uri;
        if (!uri) { return; }
        // iOS fix for getting the proper url
        uri = this.platform.is('ios') && uri.indexOf('file://') < 0 ? `file://${uri}` : uri;

        (<any>window).resolveLocalFileSystemURL(uri, entry => {
            this.ngZone.run(() => {
                // Use this property to show the image on the view
                  var imgurl = entry.toInternalURL();
                  var imageShare= entry.toURL();
                  alert('image uri is '+imageShare);

                  //return imgurl;
            });
        });
    }

async downloadFile(url,name,msgId){
  alert('downloading file');
  // var mimeType;
  // var folder='others';
  //
  // if (type.includes('image')) {
  //   mimeType='.jpg';
  //   folder='images';
  // }else if(type.includes('video')){
  //   mimeType='.mp4'
  //   folder='videose';
  // }else if(type.includes('document')){
  //   mimeType='.docx';
  //   folder='documents';
  // }else if(type.includes('pdf')){
  //   mimeType='.pdf';
  //   folder='documents';
  // }
  const _fileTransfer: FileTransferObject = this._fileTransfer.create();
  _fileTransfer.onProgress((progressEvent) => {
    this.presentToast("Progress- "+Math.round(((progressEvent.loaded / progressEvent.total) * 100))+'%',1000)
    //alert();
   });
  await _fileTransfer.download(url, this.file.externalRootDirectory+'/SpotChat/'+'images'+'/'+name).then((entry) => {
  console.log('write complete: ' + entry.toURL());
  alert('download completed with file path '+ entry.toURL());
  this.eventsService.fileDownloadedF(this.webView.convertFileSrc(entry.toURL()),msgId);
  return {status:'ok'};
//  this.events.publish('gotImg',dataurl);

//  //alert('download complete'+ entry.toURL())
  }, (error) => {
  console.log(error);
  alert('error in downloading file ');
  alert(JSON.stringify(error))
  return {status:false};
  });
}

      async saveFile(fileData,phone){

        var mimeType=fileData.mediaType;
        var folder='others';
        if (fileData.mediaType.includes('image')) {
          mimeType='.jpg';
          folder='images';
        }else if(fileData.mediaType.includes('video')){
          mimeType='.mp4'
          folder='videose';
        }else if(fileData.mediaType.includes('document')){
          mimeType='.docx';
          folder='documents';
        }else if(fileData.mediaType.includes('pdf')){
          mimeType='.pdf';
          folder='documents';
        }
        await this.saveToDirectory(fileData,mimeType,folder,phone);
        return {status:'ok'};

      }


       async saveToDirectory(fileData,mimeType,folder,phone):Promise<any>{
        this.file.checkDir(this.file.externalRootDirectory,'SpotChat').then((data)=>{
          this.file.checkDir(this.file.externalRootDirectory,'SpotChat/'+folder).then((data)=>{

                    this.file.checkFile(this.file.externalRootDirectory+'/SpotChat/'+folder,fileData['name']+mimeType).then((files)=>{
                    alert('file found with this name '+fileData['name']+mimeType);
                      //alert('file already present with name '+fileData.name);
                    }).catch(async (err)=>{
                      await this.writeFile(fileData,mimeType,folder).then((st)=>{
                          if (st.status=='ok') {
                            return {status:'ok'};
                          }
                        })
                      })
                    }).catch((err)=>{
                      this.createDirectory('SpotChat/'+folder,fileData,mimeType,folder,phone);
                      //  //alert('file not found');
                      })

                    }).catch((err)=>{
                  //    //alert('spotchat file not found');
                      this.createDirectory('SpotChat',fileData,mimeType,folder,phone);
                    })
      }


async writeFile(fileData,mimeType,folder):Promise<any>{
  // alert('writing file');
  //   let contentType = this.getContentType(fileData.dataURI);
  //   let DataBlob = this.base64toBlob(fileData.data, contentType);
  // let filePath = this.file.externalRootDirectory +'/SpotChat/'+folder+'/'+fileData.name;
  //          this.file.writeFile(filePath, fileData.name, DataBlob, fileData.mediaType).then((success) => {
  //            alert('write file success with name '+fileData.name);
  //              console.log("File Writed Successfully", success);
  //          }).catch((err) => {
  //            alert('error in writing file with name '+fileData.name);
  //            alert(JSON.stringify(err));
  //              console.log("Error Occured While Writing File", err);
  //          })
  const _fileTransfer: FileTransferObject = this._fileTransfer.create();
  await _fileTransfer.download(fileData.uri, this.file.externalRootDirectory+'/SpotChat/'+folder+'/'+fileData.name+mimeType).then((entry) => {
  console.log('write complete: ' + entry.toURL());
  alert('writing completed with file name '+fileData.name);
  return {status:'ok'};
//  this.events.publish('gotImg',dataurl);

//  //alert('download complete'+ entry.toURL())
  }, (error) => {
  console.log(error);
  alert('error in writing file ');
  alert(JSON.stringify(error))
  return {status:false};
  });
}

updateStoredChat(myPhone,clientPhone,data,id){

}


      createDirectory(dirPath,fileData,mimeType,folder,phone){
    this.file.createDir(this.file.externalRootDirectory, dirPath, false).then(response => {
      this.saveToDirectory(fileData,mimeType,folder,phone);

    }).catch((err)=>{
      alert('erro in creating directory '+dirPath);
      alert(JSON.stringify(err));
    })
      }
        updateDirectory(url,phone){
          const _fileTransfer: FileTransferObject = this._fileTransfer.create();
          _fileTransfer.download(url, this.file.externalRootDirectory+'/SpotChat/'+phone+'.jpg').then((entry) => {
          console.log('download complete: ' + entry.toURL());
        //  this.events.publish('gotImg',dataurl);

        //  //alert('download complete'+ entry.toURL())
          }, (error) => {
          console.log(error);
        //  //alert(JSON.stringify(error))
          });
        }

        //here is the method is used to get content type of an bas64 data
      public getContentType(base64Data: any) {
        try{

         let block = base64Data.split(";");
          let contentType = block[0].split(":")[1];
          return contentType;
        }
        catch(err){
          alert('erro in getting content type ');
          alert(JSON.stringify(err));
        }
      }
        public base64toBlob(byteArrays, contentType) {
          try{

                   // contentType = contentType || '';
                   // var sliceSize = 512;
                   // let byteCharacters = atob(decodeURIComponent(b64Data));
                   // let byteArrays = [];
                   // for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                   //     let slice = byteCharacters.slice(offset, offset + sliceSize);
                   //     let byteNumbers = new Array(slice.length);
                   //     for (let i = 0; i < slice.length; i++) {
                   //         byteNumbers[i] = slice.charCodeAt(i);
                   //     }
                   //     var byteArray = new Uint8Array(byteNumbers);
                   //     byteArrays.push(byteArray);
                   // }
                   let blob = new Blob(byteArrays, {
                       type: contentType
                   })
                   return blob;
                 }
                  catch(err) {
                    alert('error in blob conversion');
                    alert(JSON.stringify(err));
                 }
               }


               getFilePath(){
                 return this.file.externalRootDirectory+'/SpotChat/'+'images'+'/';
               }



}
