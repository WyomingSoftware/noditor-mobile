import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';


@Injectable()


/** A specialized logger class that manages the persistant storage of values for
  * messages such as errors. Only the last 12 messages are saved.
  *
  * All messages are stored in the object "logger" using window.localStorage
  * as an array along with a "where" key.
  */
export class LoggerService {


    messages:any = [];


    /** Class constructor. Will load the logger array from local storage.
      */
    constructor(public events:Events) {
        this.messages = JSON.parse(window.localStorage.getItem("logger"));
        if(this.messages == null){
            this.messages = [];
        }
    }


    /** Adds a logger message to the logger list. Only the last 30 are stored.
      *
      * type => string: error, notifications, alert, geo
      * location => string: location of error or message
      * message => string: message in string format
      * data => object: any ole object, mostly an error but could be actual data
      *                  for a notification or alert
      */
    set = function(type, location, message, data){

      let dataStr = null;
      if(data && type == 'notifications'){
        dataStr = data.toString();
      }
      else if(data){
        dataStr = data.toString() +' <---> '+JSON.stringify(data);
      }
      else {
        dataStr = "";
      }
      let icon = type;
      if (type == 'error') icon = 'alarm';
      else if (type == 'geo') icon = 'pin';

      let obj = {type:type, icon:icon, location:location, dttm:new Date(), timestamp: Date.now(), message:message, data:dataStr};

      // Push the message to the array as a object
      this.messages.unshift(obj);

      // If there are more than 30 messages pull the bottom row
      if (this.messages.length > 30){
          this.messages = this.messages.slice(0,30);
      }
      window.localStorage.setItem("logger", JSON.stringify(this.messages));
      this.events.publish('logger:updated');
    }


    /** Deletes a row from the logger list with confirmation.
      *
      * lineNumber:number => the line number to remove from the logger array
      */
    delete(lineNumber){
      this.messages.splice(lineNumber,1);
      window.localStorage.setItem("logger", JSON.stringify(this.messages));
      return this.messages;
    }


    /** Gets the list of logger messages.
      */
    get = function(){
        return this.messages;
    }


}
