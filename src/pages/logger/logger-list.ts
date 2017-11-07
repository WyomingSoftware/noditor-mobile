import { Component} from '@angular/core';
import { NavController, Events, AlertController } from 'ionic-angular';
import { LoggerService } from '../../providers/loggerService';
import { UTILS } from '../../providers/utils';
import { LoggerPage } from './logger';
import { MessageComponent } from '../../components/message';


@Component({
  templateUrl: 'logger-list.html'
})


/** Displays list of logger messages from LoggerService.
  */
export class LoggerListPage{


  messages = []; // base list populated by the constructor
  timer:any;

  /** Class constructor.
    * Gets the messages form the LoggerService provider.
    *
    * flags:object => state flag from the parent view that can be changed by this child view
    */
  constructor(public navCtrl: NavController,
    public logger:LoggerService,
    public events:Events,
    public alertCtrl:AlertController,
    public msg:MessageComponent,
    public utils:UTILS) {

  }


  /** Fired only once when the page first opens. Events are added here.
    * Starts an interval that changes the timeAgo
    * displays every 3 seconds.
    */
  ionViewDidLoad():void {
    this.events.subscribe('logger:updated', this.loggerUpdatedEventHandler);
    this.timer = setInterval(() => {
      for (let i=0; i<this.messages.length; i++){
        this.messages[i].timeAgo = this.utils.timeAgo(this.messages[i].dttm);
      }
    }, 3000);
  }

  /** Fired each time this view comes to the fore-front. Loads or reloads the logger list.
    */
  ionViewWillEnter(){
    this.load();
  }


  /** Fired when the page will be destroy (popped). Events are cleared.
    * Stops the timeAgo interval.
    */
  ionViewWillUnload(){
    this.events.unsubscribe('logger:updated', this.loggerUpdatedEventHandler);
    clearInterval(this.timer);
  }


  /** A logger entry has been added or removed, the logger list needs to be updated.
    *
    * data:object => ignored
    */
  loggerUpdatedEventHandler= (data:any) => {
    this.load();
  }


  /** Loads the logger list from the LoggerService.
    */
  load(){
    this.messages = this.logger.get();
    // Force the message toString in case it is an object
    for (let i=0; i<this.messages.length; i++){
      this.messages[i].message = this.messages[i].message.toString();
      this.messages[i].timeAgo = this.utils.timeAgo(this.messages[i].dttm);
      this.messages[i]._dttm = new Date(this.messages[i].dttm).toString();
    }
  }


  /** Sorts the array by timestamp.
    *
    * a => any: sort comparison
    * b => any: sort comparison
    */
  //sortByTimestamp(b,a) {
  //    return parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10);
  //}



  /** Fired by the slider "Delete Button" and prompts the user to confirm delete.
    *
    * event:object => HTML event
    * lineNumber:number => list line number to delete
    */
  delete(event, lineNumber){
      let confirm = this.alertCtrl.create({
          title: 'Confirm Delete',
          subTitle: 'Are you sure you want to delete the logged item?',
          buttons: [
              {
                text: 'Cancel', handler: () => {;}
              },
              {
                text: 'Delete', handler: () => {this.doDelete(event, lineNumber);}
              }
          ]
      });
      confirm.present();
  }


  /** Called by the delete() method to perform the delete
    *
    * event:object => HTML event
    * lineNumber:number => list line number to delete
    */
  doDelete(event, lineNumber){
    try{
      this.messages = this.logger.delete(lineNumber);
    }
    catch(error){
        this.msg.showError('Logger.doDelete','Problem deleting the log item please try again.', error);
    }
  }


  /** Opens the LoggerPage page to display the log item.
    *
    * event:object => HTML event
    * log:object => object: the item (LOG) selected in the HTML list
    */
  itemTapped(log) {
      this.navCtrl.push(LoggerPage, {log: log});
  }


}
