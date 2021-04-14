import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private refreshConversation=new Subject();
  private gotContacts=new Subject();

  private refreshChatData=new Subject();
  private msgSended=new Subject();
  private storedAllStoredMessage=new Subject();
  public emoji=new Subject();
  public fileSended=new Subject();
  public fileDownloaded=new Subject();

emoji$;

  constructor() {

  }
  setEmoji(){
     this.emoji=new Subject();
     this.emoji$ = this.emoji.asObservable();
   }


 refreshConversation$ = this.refreshConversation.asObservable();
 refreshChatData$ = this.refreshChatData.asObservable();
 msgSended$ = this.msgSended.asObservable();
storedAllStoredMessage$ = this.storedAllStoredMessage.asObservable();
fileSended$ = this.fileSended.asObservable();
fileDownloaded$ = this.fileDownloaded.asObservable();
gotContacts$ = this.gotContacts.asObservable();


 refreshConversationF(message){
   this.refreshConversation.next(message)
 }

  sendEmoji(emoji){
    this.emoji.next(emoji)
  }

  refreshChatDataF(message){
    this.refreshChatData.next(message)
  }

    msgSendedF(msgId){
      this.msgSended.next(msgId)
    }

    storedAllStoredMessageF(){
      this.storedAllStoredMessage.next()
    }

    fileSendedF(data){
      this.fileSended.next(data)
    }
    fileDownloadedF(path,msgId){
      this.fileDownloaded.next({path:path,msgId:msgId})
    }

     gotContactsF(data){
       this.gotContacts.next({'data':data})
     }


}
