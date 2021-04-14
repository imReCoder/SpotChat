import { Injectable,ViewChild } from '@angular/core';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
import { Storage } from '@ionic/storage';
import {Http ,Headers,RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { EventsService } from './../services/events.service';

declare var navigator: any;
@Injectable({
  providedIn: 'root'
})
export class ContactsService {
contactList:any=[];
spotContacts:any=[];
refreshStatus:string='off';
  headerOptions: any = { 'Content-Type': 'application/json' };
  headers = new Headers(this.headerOptions);
  constructor(private toastController:ToastController,private storage:Storage,
    private http:Http,private contacts:Contacts,public eventsService:EventsService) {
  this.storage.get('spotContacts').then((data)=>{
      if (data) {
        this.spotContacts=data;

      }else{
        console.log("no spotContacts");

      }
  })

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

  con:number=0;
  count:number=0;
   Allcontacts;


   checkLast(){
  if (this.con<this.Allcontacts.length-1) {
  this.con++;
  this.pushContacts();

  }else{
    // here  this.events.publish('contactFinished',this.contactList);
    this.eventsService.gotContactsF(this.contactList);
    this.storage.set('contacts',this.contactList);
      this.refreshStatus='off';
  }
}

lastPhone:string;

pushContacts(){
     var contacts=this.Allcontacts;
   var contact = contacts[this.con];
   var i=this.con;

 if (contacts[i].name) {
 if (contacts[i].name.formatted) {
   var no =contacts[i].name.formatted;
   var phonenumber=contacts[i].phoneNumbers;
   if(phonenumber != null && no !=null ) {
       for(var n=0;n<phonenumber.length;n++) {
           var type=phonenumber[n].type;
           if(type=='mobile') {
               var phone=phonenumber[n].value;
               var mobile;
               if(phone.slice(0,1)=='+' || phone.slice(0,1)=='0'){
                   mobile=phone.replace(/[^a-zA-Z0-9+]/g, "");
               }
               else {
                   var mobile_no=phone.replace(/[^a-zA-Z0-9]/g, "");
                   mobile = mobile_no.replace(/\D/g, '').slice(-10);
               }
               if (mobile.length>=10) {
                var length=mobile.length;
                var start=length-10;
                 var p=mobile.substring(start,length);
                 var contactData={
                     "name":no,
                     "phone":p,
                 }
                 this.count++;
                 var indexS=this.spotContacts.findIndex(l=>l['phone']==p);

                 var index=this.contactList.findIndex(k=>k['phone']==p);
                 if (index==-1 && indexS==-1) {
                   if (this.lastPhone!=p) {
                     this.contactList.push(contactData);
                   }
                 }

                 this.lastPhone=p;

               }
               else{

               }

           }
       }
   }
 }
}

this.checkLast();
}




    async getContacts(): Promise<any> {
      if (this.refreshStatus=='off') {
      //  this.refreshStatus='on';
      var options = {
    		    filter : "",
    		    multiple:true,
    		    hasPhoneNumber:true
    		};

  	     await	this.contacts.find(["*"],options).then((contacts) => {
         this.Allcontacts=contacts;
    		   this.pushContacts();

    		}).catch((err) => {
    		  	console.log('err',err);
            this.presentToast("Some error occured",2);

    		});
    }
    else{
      this.presentToast("Refreshing contact list...",1);

    }
  }
counter:number=0;
    startSync(){
  //    //alert('started syncing');
      var index;
      if (this.spotContacts) {
         index=this.spotContacts.findIndex(p=>p['phone']==this.contactList[this.counter]);
      }else{
        index=-1;
      }

      if (index==-1) {
    //  console.log('started Syncing');
//    var length=this.contactList[this.counter].length;
//    var start=length-10;
//    var phone=this.contactList[this.counter]['phone'].substring(start,length);
// here   this.events.publish('refreshStarted',this.contactList);

      this.http.post('https://spot-chat.herokuapp.com/checkContact', {phone:this.contactList[this.counter]}, new RequestOptions({ headers: this.headers }))  .map(res => res.text()).subscribe(data => {
        if (data) {
          this.refreshStatus='on';
          var response=JSON.parse(data);
          if(response.phone){
            console.log('user present');
              this.spotContacts.push(data);
              this.storage.set('spotContacts',this.spotContacts).then(()=>{
              // here  this.events.publish('refreshContactList',this.spotContacts);
                this.presentToast("user added "+data['phone'],3);

              });

            if (this.contactList.length==this.counter+1) {
              console.log("contacts synced succesfully");
              this.refreshStatus='off';
            // here  this.events.publish('refreshFinish','');

            }else{
              this.counter++;
              this.startSync();
            }


          }
          else{
            this.presentToast("user not present"+this.contactList[this.counter].phone,2);
            this.counter++;
            this.startSync();
            console.log('user not presentt');
          }
        }
      })
    }
    else{
      this.counter++;
      this.startSync();
    }
  }
}
