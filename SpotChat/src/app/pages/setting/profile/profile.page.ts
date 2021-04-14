import { Component, OnInit ,NgZone ,ViewChild} from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import {AlertController,LoadingController,ActionSheetController,ToastController} from '@ionic/angular'
import {Http ,Headers,RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Base64 } from '@ionic-native/base64/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import  { Crop }  from '@ionic-native/crop/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FirebaseStorageService } from '../../../services/firebase-storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})


export class ProfilePage implements OnInit {
  user={
    userPhone:"",
    userName:'',
    userAbout:"",
    userAvatar:""
  };

  headerOptions: any = { 'Content-Type': 'application/json' };
  headers = new Headers(this.headerOptions);
  imagePreview='../assets/images/profile.png';
  imageResponse:any;
  imageUrlShare;
  shareProfile;
  imageFileName;
  todaysDate;
  constructor(
     private fStorage:FirebaseStorageService,private toastController:ToastController,
      private ngZone: NgZone, private platform: Platform,private socialSharing:SocialSharing,
      private actionSheet:ActionSheetController,private crop:Crop,private imagePicker:ImagePicker,
      private storage:Storage,private router:Router,private http:Http,
      private alertController:AlertController,private loadingController:LoadingController,private base64:Base64) {
      this.storage.get('userPhone').then((data)=>{
        if (data) {
          this.user=data;
          console.log(data);

        }else{
          this.router.navigateByUrl('/register');
        }

      })
      this.storage.get('shareProfile').then((data)=>{
        this.shareProfile=data;
      })

    }

/*
    uploadFile(data) {
console.log('uploading');
  this.presentToast('uploading started',2);

  const fileTransfer: FileTransferObject = this.transfer.create();
  const uploadOpts: FileUploadOptions = {
                  fileKey: 'file',
                  fileName: data.substr(data.lastIndexOf('/') + 1)
               };
               alert(uploadOpts.fileName);

  fileTransfer.upload(data, 'https://spot-chat.herokuapp.com/uploadImage', uploadOpts)
    .then((data) => {
      this.presentToast('upload success'+respData.fileUrl,2);
    console.log(data+" Uploaded Successfully");
     var respData = JSON.parse(data.response);
            //     console.log(this.respData);
                this.user['userAvatar']= respData.fileUrl;
    //this.presentToast("Image uploaded successfully");
  }, (err) => {
    console.log(err);
  //  loader.dismiss();
  alert(JSON.stringify(err));
    this.presentToast('upload error'+JSON.stringify(err),6);
  });
}

*/
    pickImage(){
      console.log('getting image');
       //
       //         hasReadPermission:boolean() {
       //           this.imagePicker.hasReadPermission().then((result)=>{
       //             if (result) {
       //               return true;
       //             }
       //             else{
       //               this.requestReadPermission();
       //               return false;
       //             }
       //           })
       // };

                  this.imagePicker.hasReadPermission().then((result)=>{
                    if (result) {
                      // return true;
                    }
                    else{
                      this.requestReadPermission();
                      return false;
                    }
                  })


      //
      // if (this.hasReadPermission()) {
      //
      // }else{
      //   return false;
      // }
      let options = {
        maximumImagesCount: 1,
        outputType: 0
      };
      this.imageResponse = [];
      //  this.imageResponse.push('../assets/chat/user2.jpeg');
      this.imagePicker.getPictures(options).then((results) => {
        for (var i = 0; i < results.length; i++) {
        //     this.uploadFile(results[i]);
        this.getPhotoUrl(results[i]);
          this.crop.crop(results[i],{quality:40}).then((newImg)=>{
            this.base64.encodeFile(newImg).then((base64File: string) => {
              this.user['userAvatar']=base64File;
              this.fStorage.upload(base64File);
              this.storage.set('userPhone',this.user).then(()=>{
              // here  this.events.publish('userData',this.user);
              })
              //  this.imagePreview = base64File; //imgPath a string that receives the file encoded in base64
            }, (err) => {
              console.log('ERRO' +err);
            });
          })
        }

      }, (err) => { });
    }

    private getPhotoUrl(uri: string): void {
          if (!uri) { return; }

          // iOS fix for getting the proper url
          uri = this.platform.is('ios') && uri.indexOf('file://') < 0 ? `file://${uri}` : uri;

          (<any>window).resolveLocalFileSystemURL(uri, entry => {
              this.ngZone.run(() => {
                  // Use this property to show the image on the view
                var imgurl = entry.toInternalURL();
                    var imageShare= entry.toURL();
                this.imageUrlShare=entry.toURL();
                this.storage.set('shareProfile',imageShare);
                this.shareProfile=imageShare;

//                let correctPath = uri.substr(0, uri.lastIndexOf('/') + 1);
            //    this.copyFileToLocalDir(imgurl,correctPath ,'RanjitProfile.jpg');

                  // Use this property to share the image using the SocialSharing plugin


              });
          });
      }


    changeName(){
      console.log("name change request");
      this.changeAlert('userName',this.user.userName,'text');
    }

    changeAbout(){
      console.log('about change request',this.user.userAbout);
      this.changeAlert("userAbout",this.user.userAbout,'text');

    }

    changePhone(){
      console.log('chnage phone');
      //   this.changeAlert("userPhone",this.user.userPhone,'number');
    }

    async changeAlert(name,value,type) {
      const alert = await this.alertController.create({
        header: 'Edit',
        //   message: 'Do you really want to Logout ?',
        inputs: [

          {
            name: name,
            type: type,
            value:value,
            id:'alertInput'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (data) => {
              console.log('Confirm Cancel: blah',data);
            }
          }, {
            text: 'Save',
            handler: (data) => {
              if (data[name]!="") {
                this.presentLoading();
                console.log(data);


                this.user[name]=data[name];
                console.log(this.user);
                this.storage.set('userPhone',this.user).then((data)=>{
                  this.http.post('https://spot-chat.herokuapp.com/updateprofile', this.user, new RequestOptions({ headers: this.headers }))  .map(res => res.text()).subscribe(data => {
                    if (data) {
                      var response=JSON.parse(data);
                      if(response.status=='ok'){
                        console.log('data updated');
                        this.loaderDismiss();
                        return true;
                      }
                      else{
                        console.log('some error occured',response.status);
                        this.loaderDismiss()
                        this.presentErrorAlert();
                      }
                    }
                  })
                })
              }
              else{
                return false;
              }

            }
          }
        ]
      });

      await alert.present().then(()=>{
        document.getElementById('alertInput').focus();
        console.log('input focused');

      });
    }

    loading: any = null;
    async presentLoading() {
      this.loading = await this.loadingController.create({
        spinner: 'circular',
        duration: 12000,
        message: 'Please wait...',
        translucent: true,
        showBackdrop: true,
        cssClass: 'custom-class custom-loading'
      });
      return await this.loading.present();
    }

    loaderDismiss(){
      this.loading.dismiss();
    }


    async presentErrorAlert() {
      this.loading.dismiss();

      const alert = await this.alertController.create({
        message: 'Some Error Occured. Please try again later.',
        buttons: ['OK']
      });

      await alert.present();
    }

    ngOnInit() {
    }


    async presentActionSheetProfile() {
      const actionSheet = await this.actionSheet.create({
        header: 'Profile Picture',

        buttons: [
          {
            text: 'Upload From Gallery',
            icon: 'images',
            handler: () => {
              console.log('pick clicked');
              this.pickImage();
            }
          },
          {
            text: 'Share',
            icon: 'share',
            handler: () => {
              console.log('share clicked');
              this.presentActionSheetShare();
            }
          },
          {
            text: 'Remove Profile Picture',
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              console.log('Delete clicked');
              this.removeProfile();
            }
          }]
        });
        await actionSheet.present();
      }


      async presentActionSheetShare() {
        const actionSheet = await this.actionSheet.create({
          header: 'Share Your Profile Picture',

          buttons: [
            {
              text: 'WhatsApp',
              icon: 'logo-whatsapp',
              handler: () => {
                console.log('whatsapp clicked');
                  this.shareViaWhatsApp(null, this.shareProfile,null);


              }
            },
            {
              text: 'Instagram',
              icon: 'logo-instagram',
              handler: () => {
                this.shareViaInstagram(null, this.shareProfile,null);
              }
            },
            {
              text: 'Facebook',
              icon: 'logo-facebook',
              handler: () => {
                console.log('facebook clicked');
                this.shareViaFacebook(null, this.shareProfile,null);
              }
            },
            {
              text: 'Twitter',
              icon: 'logo-twitter',
              handler: () => {
                console.log('facebook clicked');
                this.shareViaTwitter(null, this.shareProfile,null);
              }
            },
            {
              text: 'Save To Gallery',
              icon: 'images',
              handler: () => {
                console.log('facebook clicked');
                this.shareViaGallery(null, this.shareProfile,null);
              }
            },
            {
              text: 'Other',
              icon: 'arrow-undo',
              handler: () => {
                console.log('facebook clicked');
                this.shareViaOther('Hi check my profile pic', this.shareProfile,null);
              }
            }
          ]
          });
          await actionSheet.present();
        }

//https://devdactic.com/ionic-4-image-upload-storage/
//https://www.c-sharpcorner.com/article/how-to-save-picture-to-specific-path-in-ionic-3-using-native-camera-plugin/
  async presentToast(text,time) {
   const toast = await this.toastController.create({
     message:text,
     duration: time*1000,
     animated:true,
     color:'dark',
     translucent:true
   });
   toast.present();
 }
        removeProfile(){
          this.storage.set('userPhone',this.user).then((data)=>{

            this.http.post('https://spot-chat.herokuapp.com/updateprofile', this.user, new RequestOptions({ headers: this.headers }))  .map(res => res.text()).subscribe(data => {
              if (data) {
                var response=JSON.parse(data);
                if(response.status=='ok'){
                  delete this.user['userAvatar'];
                  this.base64.encodeFile(this.imagePreview).then((base64File: string) => {
                    this.loaderDismiss();
              //      this.user['userAvatar']=base64File;
                    this.fStorage.upload(base64File);
                    this.storage.set('userPhone',this.user).then(()=>{
                    // here  this.events.publish('userData',this.user);
                    })
                    //  this.imagePreview = base64File; //imgPath a string that receives the file encoded in base64
                  }, (err) => {
                    console.log('ERRO' +err);
                  });
                  console.log('data updated');
                  return true;
                }
                else{
                  console.log('some error occured',response.status);
                  this.loaderDismiss()
                  this.presentErrorAlert();
                }
              }
            })
          })
        }


        shareViaWhatsApp(text,image,url){
          this.socialSharing.shareViaWhatsApp( null,image,null).then((res) => {
            // Success
            console.log('shared sucees');

          }).catch((e) => {
            // Error!
          });
        }

        shareViaFacebook(text,image,url){
          this.socialSharing.shareViaFacebook(text, image, url).then((res) => {
            // Success
          }).catch((e) => {
            // Error!
          });
        }
        shareViaInstagram(text,image,url){
          this.socialSharing.shareViaInstagram(text, image).then((res) => {
            // Success
          }).catch((e) => {
            // Error!
          });
        }
        shareViaTwitter(text,image,url){
          this.socialSharing.shareViaTwitter(text, image, url).then((res) => {
            // Success
          }).catch((e) => {
            // Error!
          });
        }
        shareViaGallery(text,image,url){
          this.socialSharing.saveToPhotoAlbum(image).then((res) => {
            // Success
            console.log('saved sucees');

          }).catch((e) => {
            // Error!
          });
        }

        shareViaOther(text,image,url){
          this.socialSharing.share(text, image, url).then((res) => {
            // Success
          }).catch((e) => {
            // Error!
          });
        };



  requestReadPermission() {
   // no callbacks required as this opens a popup which returns async
   this.imagePicker.requestReadPermission().then(()=>{
     this.pickImage();
   })
 }

        ionViewWillLeave() {

       // let options: NativeTransitionOptions = {
       //  direction: 'down',
       //  duration: 300,
       //  slidePixels: 20,
       //  iosdelay: 100,
       //  androiddelay: 150,
       //  fixedPixelsTop: 0,
       //  fixedPixelsBottom: 60
       // };
       //
       // this.nativePageTransition.slide(options);
       }


      }
