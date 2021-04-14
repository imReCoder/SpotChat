import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Contacts } from '@ionic-native/contacts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';//https://spot-chat.herokuapp.com/
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { FCM } from '@ionic-native/fcm/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ProfilePreviewPageModule } from './modals/profile-preview/profile-preview.module';
import { ImageViewPageModule } from './modals/image-view/image-view.module';

import { ContactsPageModule } from './modals/contacts/contacts.module';
//import { NativePageTransitions } from '@ionic-native/native-page-transitions/ngx'
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { LongPressModule } from 'ionic-long-press';
import  { Crop }  from '@ionic-native/crop/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SuperTabsModule} from '@ionic-super-tabs/angular';
import { AudioService } from './services/audio.service';
import { EventsService } from './services/events.service';
import { FileManagerService } from './services/file-manager.service';

import { NativeAudio } from '@ionic-native/native-audio/ngx';

import { Chooser } from '@ionic-native/chooser/ngx';
const config: SocketIoConfig = { url: 'https://spot-chat.herokuapp.com', options: {
   reconnection: true
  } };

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { environment } from '../environments/environment';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { VideoPlayer } from '@ionic-native/video-player/ngx';
@NgModule({
  declarations: [AppComponent ],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    SuperTabsModule.forRoot(),
    LongPressModule,
    AppRoutingModule,
    HttpModule,
    ContactsPageModule,
    ImageViewPageModule,
    ProfilePreviewPageModule,
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase, 'spotChat'), // imports firebase/app needed for everything
  AngularFirestoreModule, // imports firebase/firestore, only needed for database features
   AngularFireStorageModule, // imports firebase/storage only needed for storage features
     SocketIoModule.forRoot(config)],
  providers: [
    StatusBar,
    Keyboard,
  //  NativeStorage,
    FCM,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
   FileTransferObject,
     SocialSharing,

    AndroidPermissions,
    Contacts,
    AudioService,
    EventsService,
    FileManagerService,
    NativeAudio,
    SplashScreen,
    ImagePicker,
FileTransfer,
      File,
      WebView,
    Base64,
    Crop,
    VideoPlayer,
    Chooser
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
