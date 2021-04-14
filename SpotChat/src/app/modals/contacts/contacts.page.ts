import { Component, OnInit ,ViewChild} from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import {Http ,Headers,RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { ContactsService } from '../../services/contacts.service';
import { ActionSheetController,ToastController,AlertController, LoadingController } from '@ionic/angular';
import { ProfilePreviewPage } from '../../modals/profile-preview/profile-preview.page';
import { EventsService } from './../../services/events.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  @ViewChild('searchBar',{static:false}) searchBar;

  toolColor="primary";
  myPhone:string;
  goalList;
  imgLoadedS=false;
  imgLoadedC=false;
  goalListR=[];
  addPhone='';
  addName='';
  contactList=[];
  contactListR=[];
  contactListT=[];
  spotContactR=true;
  noSpotContacts:boolean=false;

  search:boolean=false;
  searchH:boolean=true;

  refreshStatus:String='off';
  headerOptions: any = { 'Content-Type': 'application/json' };
  headers = new Headers(this.headerOptions);
  constructor(private toastController:ToastController,private contactsService:ContactsService,
    private http:Http,private storage:Storage,private loadingController:LoadingController,
    private alertController:AlertController,private actionSheet:ActionSheetController,
    private router:Router,public contacts:Contacts,private modalCtr:ModalController,
    private androidPermissions:AndroidPermissions,public eventsService:EventsService,
    private statusBar:StatusBar) {



 //this.storage.set('contacts',[{name:'ranjit',phone:'7984545163'},{name:'sonu',phone:'7990085595'}]);
      this.storage.get('spotContacts').then((data)=>{
        if (data) {

          data = data.filter(function( element ) {
            return element !== undefined;
            });
            data = data.filter(function( element ) {
              return element !== null;
              });
              console.log(data);

            if (data.length!=0) {
          //  alert('present'+data.length);
            console.log(data);

          this.contactList=data;
          this.initializeItems();
          this.spotContactR=false;
        }
        else{
        //  alert('no contacts');
          this.spotContactR=false;
          console.log("no contacts");
          this.noSpotContacts=true;

        }

        }else{
      //
      //    alert('no contacts');
          this.spotContactR=false;
          console.log("no contacts");
          this.noSpotContacts=true;

        }

      })
      this.storage.get('firstSpot').then((data)=>{
        if (data) {
          //this.checkContactPermsission();
          this.getContacts();
        }
        else{
          this.checkContactPermsission();
            this.storage.set('firstSpot',{bool:true});
        }

      })
    }

    identify(index, club) {
      if (club) {
        return club.id;
      }
    }

 identifyC(index, club) {
   if (club) {
     return club.id;
   }
 }

    getContacts(){

      this.storage.get('contacts').then((data)=>{
        if (data) {
          console.log(data);
          data = data.filter(function( element ) {
            return element !== undefined;
            });
            data = data.filter(function( element ) {
              return element !== null;
              });
          this.contactListR=data;
          this.initializeItemsR();
          console.log(this.contactListR);


        }else{
          this.contactsService.getContacts();
        //  this.closeModal();
        }
      })
    }


    async viewProfile(data){
      const modal = await this.modalCtr.create({
        component: ProfilePreviewPage,
        componentProps: {
          userData: data
        }
      });
      return await modal.present();
      await modal.dismiss(data=>{
        console.log('modal dismissed',data);

      })
    }
    searchToggle(){
      this.searchH=false;
      setTimeout(()=>{
        this.toolColor='white'
        this.search=true;
      },40)

      setTimeout(()=>{
        this.searchBar.setFocus();
      },200)
    }

    cancelSearch(){
      setTimeout(()=>{
        this.search=false;
        this.toolColor='primary'
        this.searchH=true;

      },200)
    }


    refreshContacts(){
      this.checkContactPermsission();
    }


    initializeItems(): void {
      this.goalList = this.contactList;
    }
    initializeItemsR(): void {
      this.goalListR = this.contactListR;
    }


    filterList(evt) {
      console.log('initiaalized');
      this.initializeItems();
      this.initializeItemsR();


      const searchTerm = evt.srcElement.value;

      if (!searchTerm) {
        return;
      }

      this.goalList = this.goalList.filter(currentGoal => {
        if (currentGoal.name && searchTerm) {
          if (currentGoal.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||currentGoal.phone.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }
      });

      this.goalListR = this.goalListR.filter(currentGoal => {
        if (currentGoal.name && searchTerm) {
          if (currentGoal.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||currentGoal.phone.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }
      });
    }


    ngOnInit() {
      console.log(this.myPhone);
      console.log(this.contactListR);
      this.initializeItemsR()
      this.refreshContactListner();
    }


    async presentAlert() {
      const alert = await this.alertController.create({
        message: 'Your friend is not using SpotChat inivite him now ',
        buttons: [

          {
            text:'Cancel',
            role:'cancel',
            handler:  (data) => {
              console.log("cancel");

            }
          }
          ,{text:'Invite Now',role:'ok',
          handler:  (data) => {
            console.log("invite");

          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertUserPresent(x) {
    const alert = await this.alertController.create({
      message: x,
      buttons: [
        'OK'
      ]
    });

    await alert.present();

  }

    async presentAlertUserPresentSpotChat(x,data) {
      const alert = await this.alertController.create({
        message: x,
        buttons: [
          {text:'ok',role:'cancel'},
        {text:'Go for chat',handler:(()=>{
          console.log('go for chat');
          this.goforChat(data);
        })}
        ]
      });


      await alert.present();
    }

  alert;
  async addContact() {
    this.alert = await this.alertController.create({
      header: 'Add Phone',
      animated:true,
      backdropDismiss:false,

      inputs: [
        {
          name: "name",
          type: "text",
          placeholder:"Enter Name",
          id:'alertInput',
          value:this.addName
        },
        {
          name: "phone",
          type: "number",
          value:this.addPhone,
          placeholder:"Enter Phone Number",

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
          handler:  (data) => {
            var index=this.contactList.findIndex(k=>k.phone==data.phone);
            console.log(this.contactList);

            console.log('index is ',index);

            if (index==-1) {
              console.log('save',data);
              console.log(data);

              this.http.post('https://spot-chat.herokuapp.com/checkContact', data, new RequestOptions({ headers: this.headers })).map(res => res.text()).subscribe(resData => {
                if (resData) {
                  var response=JSON.parse(resData);
                  if (response.phone) {
                    console.log("user present");

                    this.noSpotContacts=false;
                    this.initializeItems();
                    var push={
                      phone:response.phone,
                      name:data.name,
                      image:response.avatar
                    }
                    this.contactList.push(push);
                    console.log("contact list is ",this.contactList);


                    this.storage.set('spotContacts',this.contactList).then(()=>{

                    })
                    this.contactListR=[...this.contactListR];
                    this.contactList=[...this.contactList];

                    this.dismissAddContacts();
                    return true;
                  }
                  else{
                    var push2={
                      phone:data.phone,
                      name:data.name
                    }
                    this.contactListR.findIndex(p=>p['phone']==data.phone);
                    if (index==-1) {
                      this.contactListR.unshift(push2);
                      this.storage.set('contacts',this.contactListR).then(()=>{
                      })
                    }
                    this.contactListR=[...this.contactListR];
                    this.contactList=[...this.contactList];

                    this.dismissAddContacts();

                    console.log("user not present");
                    this.presentAlert();
                    return false;
                  }

                }
              })
              return false;
            }
            else{
              console.log("user already present");
              this. presentAlertUserPresent('User already present in list');
            }
          }
        }
      ]
    });

    await this.alert.present().then(()=>{
      document.getElementById('alertInput').focus();
      console.log('input focused');

    });
  }

  checkUser(data){
    this.presentLoading(13);
    this.http.post('https://spot-chat.herokuapp.com/checkContact', data, new RequestOptions({ headers: this.headers }))
    .map(res => res.text()).subscribe(resData => {
      if (resData) {
        var response=JSON.parse(resData);
        if (response.phone) {
          console.log("user present");
          var push={
            phone:response.phone,
            name:data.name,
            image:response.avatar
          }
          this.contactList.push(push);
          var index =this.contactListR.findIndex(p=>p['phone']=response.phone);
          if (index==-1) {

          }else{
            console.log('deleting');

            this.contactListR.splice(index,1);
            this.storage.set('contacts',this.contactListR).then(()=>{

            })
          }
          this.storage.set('spotContacts',this.contactList).then(()=>{

          })
          this.noSpotContacts=false;
          this.contactList=[...this.contactList];
          this.contactListR=[...this.contactListR];

          setTimeout(()=>{
            this.initializeItems();

            this.initializeItemsR();
          },200)
          console.log("contact list is ",this.contactList);
          this.presentAlertUserPresentSpotChat('User is on SpotChat',data);

        //  this.dismissAddContacts();
        this.loaderDismiss();

          return true;
        }
        else{
          alert('inviting');
          this.loaderDismiss();

          return false;
        }

      }
    },(err)=>{
    //  alert('errr');
      console.log('erro occure',err);
      this.presentToast('Check your connection',2);
      this.loaderDismiss();
    })

  }

  dismissAddContacts(){
    this.alert.dismiss();
  }

  loading: any ;
  timeOut;
  async presentLoading(time) {
    this.timeOut=setTimeout(()=>{
      this.presentToast('Check Your Connection',3);
    },time*1000+500)
    this.loading = await this.loadingController.create({
      spinner: 'circular',
      duration: time*1000,
      message: 'Please wait...',
      translucent: true,
      showBackdrop: true,
      cssClass: 'custom-class custom-loading'
    });
    return await this.loading.present();
  }

  loaderDismiss(){
  clearTimeout(this.timeOut);
    this.loading.dismiss();
  }

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

  async presentActionSheet() {
    const actionSheet = await this.actionSheet.create({
      header: 'Albums',

      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Delete clicked');
        }
      }, {
        text: 'Share',
        icon: 'share',
        handler: () => {
          console.log('Share clicked');
        }
      }, {
        text: 'Play (open modal)',
        icon: 'arrow-dropright-circle',
        handler: () => {
          console.log('Play clicked');
        }
      }, {
        text: 'Favorite',
        icon: 'heart',
        handler: () => {
          console.log('Favorite clicked');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  checkContactPermsission(){
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_CONTACTS).then(
      result => this.contactsService.getContacts(),
      err => this.requestContactsPermission()
    );
  }

  requestContactsPermission(){
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_CONTACTS]).then(()=>{
      this.contactsService.getContacts();
    //  this.closeModal();
    });
  }

  goforChat(chat) {
    if (chat['name']) {
      chat['name']=chat['name'].charAt(0).toUpperCase()+chat['name'].slice(1);
    }

    chat['myPhone']=this.myPhone;
    console.log(chat);
    console.log("send data ",chat);

    this.closeModal();
    this.router.navigate(['messages', chat]);
  }

  closeModal() {
    this.modalCtr.dismiss({
      'dismissed': true
    });
  }

  refreshContactListner(){
    this.eventsService.gotContacts$.subscribe((data)=>{
       this.contactListR=data['data'];
       this.initializeItemsR();
    })
    // here // this.events.subscribe('refreshContactList',data=>{
    //   this.contactList=data;
    // });
    // this.events.subscribe('refreshFinish',data=>{
    //   this.refreshStatus='off';
    // });
    // this.events.subscribe('refreshStarted',data=>{
    //   this.refreshStatus='on';
    // })
    // this.events.subscribe('contactFinished',data=>{
    //   //this.refreshStatus='on';
    //   this.contactListR=data;
    // //    alert('got all contacts ');
    //   this.storage.set('contacts',data).then(()=>{
    //
    //   })

    //
    // })

  }

  deleteFromSpotContacts(data,i){
    console.log('delete');
    this.presentToast('Deleted',1);
    var index =this.contactList.findIndex(p=>p['phone']==data['phone']);
    if (index!=-1) {
      console.log('got index'+index);
      console.log(this.contactList[index]);

       this.contactList.splice(index,1);
      this.contactList = [...this.contactList];

      // this.contactList=this.contactList;
       console.log(this.contactList);
       if (this.contactList.length==0) {
         this.noSpotContacts=true;
       }
      this.initializeItems();

      if (this.contactList.length==0) {
        this.storage.set('spotContacts',null).then(()=>{
        })
        }
        else{

          this.storage.set('spotContacts',this.contactList).then(()=>{})
          }



    }
  }

  invite(contact,i){
    if (this.contactList) {
      var index=this.contactList.findIndex(p=>p['phone']==contact['phone']);
    }else{
      index=-1;
    }

    if (index==-1) {
      this.checkUser(contact);
    }else if(index!=-1){
      console.log("previous ",this.contactListR);
      console.log('index i is ',i);

      this.contactListR.splice(i,1);
      this.contactListR=[...this.contactListR];
      setTimeout(()=>{
        this.initializeItemsR();

      },100)
      console.log("updated ",this.contactListR);
      this.storage.set('contacts',this.contactListR);

      this.presentAlertUserPresent('User present in list');
    }
  }

}
