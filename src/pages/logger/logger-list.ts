import { Component} from '@angular/core';
import { NavController, Events, AlertController } from 'ionic-angular';
import { LoggerService } from '../../providers/loggerService';
import { UTILS } from '../../providers/utils';
import { LoggerPage } from './logger';
import { MessageComponent } from '../../components/message';
import { HintsComponent } from '../../components/hints';


@Component({
  templateUrl: 'logger-list.html',
  providers:[HintsComponent]
})


/**
 * Displays list of logger messages from LoggerService.
 * @param  {NavController}    navCtrl   Ionic navigation control
 * @param  {LoggerService}    logger    Common logger service component
 * @param  {Events}           events    Ionic events
 * @param  {AlertController}  alertCtrl Ionic alert boxes
 * @param  {MessageComponent} msg       Common messaging
 * @param  {UTILS}            utils     Common funtion timeago
 */
export class LoggerListPage{


  messages = []; // base list populated by the constructor
  timer:any;
  showHints:boolean;

  /**
   * Class constructor.
   */
  constructor(public navCtrl: NavController,
    public logger:LoggerService,
    public events:Events,
    public alertCtrl:AlertController,
    public msg:MessageComponent,
    public utils:UTILS) {

    this.showHints = (window.localStorage.getItem("noditor.showHints") === 'true');

  }


  /**
   * Fired only once when the page first opens. Events are added here.
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
    this.events.subscribe('showHints:changed', (flag) => {
      this.showHints = flag;
    });
  }


  /**
   * Fired each time this view comes to the fore-front. Loads or reloads the logger list.
   */
  ionViewWillEnter():void{
    this.load();
  }


  /**
   * Fired when the page will be destroy (popped). Events are cleared.
   * Stops the timeAgo interval.
   */
  ionViewWillUnload():void{
    this.events.unsubscribe('logger:updated', this.loggerUpdatedEventHandler);
    clearInterval(this.timer);
  }


  /**
   * A logger entry has been added or removed, the logger list needs to be updated.
   * @param  {object}  data     event data payload, ignored
   */
  loggerUpdatedEventHandler= (data:any):void => {
    this.load();
  }


  /**
   * Loads the logger list from the LoggerService.
   */
  load():void{
    this.messages = this.logger.get();
    // Force the message toString in case it is an object
    for (let i=0; i<this.messages.length; i++){
      this.messages[i].message = this.messages[i].message.toString();
      this.messages[i].timeAgo = this.utils.timeAgo(this.messages[i].dttm);
      this.messages[i]._dttm = new Date(this.messages[i].dttm).toString();
    }
  }


  /**
   * Fired by the slider "Delete Button" and prompts the user to confirm delete.
   * @param {object}    event      event data
   * @param {number} lineNumber    line number in array to remove
   */
  delete(event:any, lineNumber:number):void{
      let confirm = this.alertCtrl.create({
          title: 'Confirm Delete',
          subTitle: 'Are you sure you want to delete the logged item?',
          buttons: [
              {
                text: 'Cancel', handler: () => {;}
              },
              {
                text: 'Delete', handler: () => {
                  try{
                    this.messages = this.logger.delete(lineNumber);
                  }
                  catch(error){
                      this.msg.showError('Logger.doDelete','Problem deleting the log item please try again.', error);
                  }
                }
              }
          ]
      });
      confirm.present();
  }


  /**
   * Opens the LoggerPage page to display the log item.
   * @param {LoggerPage} log LoggerPage instance to open, embedded in HTML (click) handler
   */
  itemTapped(loggerPage:LoggerPage):void {
      this.navCtrl.push(LoggerPage, {log: loggerPage});
  }


}
