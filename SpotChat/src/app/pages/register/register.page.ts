import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController } from '@ionic/angular';
import { ServerService } from '../../services/server.service';
import { FCM } from '@ionic-native/fcm/ngx';
import { Socket } from 'ng-socket-io';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {



  @ViewChild('mobileIn', { static: false }) mobIn;
  @ViewChild('otp1', { static: false }) first;
  for = "notUpdate";

  verifyB: boolean = false;
  mobile: string = '';
  id: string = '';
  data2: string = '';
  counter = 0;
  seconds: any;
  a = '';
  b = '';
  c = '';
  d = '';
  code: string;
  data: any;
  currentDate: string = new Date().toLocaleDateString();
  token_key = 'authorized';
  email: string = "";
  token: string;

  constructor(private socket: Socket, private fcm: FCM, private router: Router,
    public http: Http, private storage: Storage, private server: ServerService,
    public alertController: AlertController, public loadingController: LoadingController,
    public modalController: ModalController, public statusBar: StatusBar) {
    this.statusBar.backgroundColorByHexString('#e8e8e8');
  }

  ngOnInit() {
    this.storage.set('userPhone', { userPhone: '7984545163', email: '', gender: '', name: '' });
    this.getToken();
    //this.presentAlert('9099858434');,nam
  }


  getToken() {
    this.fcm.getToken().then(token => {
      this.token = token;
      //   alert('got token'+token);
      this.storage.set('notificationToken', token).then(() => {
        console.log('token saved');
        //this.socket.emit('')
      })
      // Register your new token in your back-end if you want
      // backend.registerToken(token);
    });
  }





  async presentAlertPhone(x) {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Numbers',
      cssClass: 'alertNnumber',
      buttons: [{
        text: x,
        role: 'ok',
        cssClass: 'secondary',
        handler: (blah) => {
          this.get(x);
        }
      }]
    });

    await alert.present();
  }

  get(n) {
    this.mobile = n;
  }

  async presentAlert(x) {
    const alert = await this.alertController.create({
      message: x,
      mode: 'md',
      buttons: [{
        text: 'Ok',
        role: 'ok',
        handler: (blah) => {
          if (x.includes('Concurrent')) {
            setTimeout(() => {
              this.mobIn.setFocus();
            }, 400);
          }
        }
      }]
    });
    await alert.present();
  }



  loading: any = null;
  async presentLoading() {
    this.loading = await this.loadingController.create({
      spinner: 'circular',
      duration: 20000,
      message: 'Please wait...',
      translucent: true,
      showBackdrop: true,
      cssClass: 'custom-class custom-loading'
    });
    return await this.loading.present();
  }

  loaderDismiss() {
    this.loading.dismiss();
  }




  sendOTP() {
    if (this.mobile.length === 0) {
      alert('Please enter phone number to proceed');

    }
    else if (this.mobile.length != 10 || this.mobile.length > 10 || this.mobile.length < 10) {
      //alert(this.mobile);
      alert('invalid phone number');
    }
    else {
      if (this.for == 'update') {
        this.presentLoading();
        this.http.get('https://nexmo202.000webhostapp.com/send-sms.php?mobile=91' + this.mobile)
          .map(res => res.text())
          .subscribe(res => {
            //console.log(res.id);
            this.data2 = res;
            //if these two lines removed everything fails again.
            this.data2 = this.data2.replace(/\n/g, "");
            this.data2 = this.data2.replace(/\t/g, "");
            console.log(this.data2);
            if (this.data2.includes('Concurrent')) {
              //   alert('Concurrent message');
              this.loaderDismiss();
              this.mobile = '';

              this.presentAlert('Concurrent verification to same phone number is not allowed. Please wait for a couples of minutes and try again.');

            }
            else if (this.data2.includes('account does not have sufficient credit')) {
              this.loaderDismiss();
              this.presentAlert('Something went Wrong. Please try again later.');
            }
            else {
              if (JSON.parse(this.data2).id) {
                this.id = JSON.parse(this.data2).id;
                this.loading.dismiss();
                this.verifyB = true;
                this.startTimer(30);
                setTimeout(() => {
                  this.first.setFocus();
                }, 400);
                //   alert('OTP sent');
                var data = {
                  id: JSON.parse(this.data2).id,
                  mobile: this.mobile
                }

              }

            }

            //alert(JSON.stringify(res));
            //this.navCtrl.push(OtpReceivePage,{mobileno:this.mobile})
          }, (err) => {
            console.log(err);
            this.loading.dismiss();

          });

      }
      else {


        this.presentLoading();
        this.http.get('https://nexmo202.000webhostapp.com/send-sms.php?mobile=91' + this.mobile)
          .map(res => res.text())
          .subscribe(res => {
            //console.log(res.id);
            this.data2 = res;
            //if these two lines removed everything fails again.
            this.data2 = this.data2.replace(/\n/g, "");
            this.data2 = this.data2.replace(/\t/g, "");
            console.log(this.data2);
            if (this.data2.includes('Concurrent')) {
              //   alert('Concurrent message');
              this.loading.dismiss();
              this.mobile = '';

              this.presentAlert('Concurrent verification to same phone number is not allowed. Please wait for a couples of minutes and try again.');

            }
            else if (this.data2.includes('account does not have sufficient credit')) {
              this.loading.dismiss();
              this.presentAlert('Something went Wrong. Please try again later.');
            }
            else {
              if (JSON.parse(this.data2).id) {
                this.id = JSON.parse(this.data2).id;
                this.loading.dismiss();
                this.verifyB = true;
                this.startTimer(30);
                setTimeout(() => {
                  //this.inputElement.setFocus();
                  this.first.setFocus();
                }, 400);
                //   alert('OTP sent');
                var data = {
                  id: JSON.parse(this.data2).id,
                  mobile: this.mobile
                }

              }

            }

            //alert(JSON.stringify(res));
            //this.navCtrl.push(OtpReceivePage,{mobileno:this.mobile})
          }, (err) => {
            console.log(err);
            this.loading.dismiss();

          });



      }
      //  this.http.setHeader("content-type", "application/json");

    }
  }



  verify() {
    this.code = this.a + this.b + this.c + this.d;
    //  alert(this.code);
    if (this.code.length === 4) {
      this.presentLoading();

      this.http.get('https://nexmo202.000webhostapp.com/verify.php?id=' + this.id + '&' + 'code=' + this.code)
        .map(res => res.text())
        .subscribe(res => {
          console.log(res);
          this.data = res;
          //if these two lines removed everything fails again.
          this.data = this.data.replace(/\n/g, "");
          this.data = this.data.replace(/\t/g, "");
          if (this.data.includes('code provided does not match')) {
            this.loaderDismiss();

            //  alert('wrong code');
            this.presentAlert('Wrong Code Entered');
            //  this.loaderDismiss();
            this.a = '';
            this.b = '';
            this.c = '';
            this.d = '';
            this.code = '';

          }
          else if (this.data.includes('was not found or it has been verified already')) {
            this.loaderDismiss();

            this.presentAlert('Code has been expired');
            this.a = '';
            this.b = '';
            this.c = '';
            this.d = '';
            this.code = '';
            this.verifyB = false;
            this.mobile = '';
            //  document.getElementById('backBtn').click();
          }
          else if (this.data.includes('too many times')) {
            //this.loaderDismiss();
            this.loaderDismiss();

            this.presentAlert('Too many wrong attempts');
            this.a = '';
            this.b = '';
            this.c = '';
            this.d = '';
            this.code = '';
            this.verifyB = false;
            this.mobile = '';

            //  document.getElementById('backBtn').click();

          }
          else {
            if (JSON.parse(this.data).request_id == this.id) {
              var data = {

                userPhone: this.mobile,
                gender: '',
                username: '',
                email: ''
              }
              //      alert(this.token_key);
              this.storage.set('userPhone', data).then(() => {
                if (this.for != 'update') {
                  //      alert('going to tab');
                  this.server.addNewUser(this.mobile, this.email, this.token);
                  this.loaderDismiss();


                }

              });

              //   alert('otp verified');
            }
            else {
              //  this.loaderDismiss();

              this.presentWrongOTP();
              //    this.loaderDismiss();
              console.log(this.data);
              //   this.data=JSON.parse(this.data);
              this.loaderDismiss();
              this.a = '';
              this.b = '';
              this.c = '';
              this.d = '';
              this.code = '';
              setTimeout(() => {
                //this.inputElement.setFocus();
                this.first.setFocus();
              }, 400);

            }
            this.loaderDismiss();

          }
          this.loaderDismiss();


        }, (err) => {
          console.log(err);
          this.loaderDismiss();
        });
    }
    else {
      this.loaderDismiss();

      this.presentWrongOTP();
      this.first.setFocus();
      this.a = '';
      this.b = '';
      this.c = '';
      this.d = '';
      this.code = '';
    }
  }

  async presentWrongOTP() {
    this.loaderDismiss();

    const alert = await this.alertController.create({
      header: 'Wrong OTP',
      buttons: [{
        text: 'Ok',
        role: 'ok',
        handler: (blah) => {
          this.alertClickOk();
        }
      }]
    });

    await alert.present();
    this.a = '';
    this.b = '';
    this.c = '';
    this.d = '';
    this.code = '';
    this.first.setFocus();
  }

  alertClickOk() {
    setTimeout(() => {
      //this.inputElement.setFocus();
      this.first.setFocus();
    }, 400);
  }

  otpController(event, next, prev) {
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
      console.log(this.code);

    }
    else if (next && event.target.value.length > 0) {
      next.setFocus();
      console.log(this.code);

    }
    else {
      if (event.target.value.length === 1) {
        setTimeout(() => {
          //this.inputElement.setFocus();
          this.verify();
          //this.first.setFocus();
        }, 400);
      }

      return 0;

    }
  }



  task: any;

  startTimer(maxTime) {
    clearInterval(interval);
    this.seconds = maxTime;
    var interval = setInterval(() => {
      this.seconds -= 1;
      //  console.log(this.seconds);
      if (this.seconds === 0) {
        this.reSendOTP();
        clearInterval(interval);
      }
    }, 1000);
  }


  reSendOTP() {
    //  alert('resending');
  }


  closeModal() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }




}
