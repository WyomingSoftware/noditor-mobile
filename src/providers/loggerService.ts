import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';


@Injectable()


/**
 * A specialized logger class that manages the persistant storage of values for
 * messages such as errors. Only the last 30 messages are saved.
 *
 * All messages are stored in the object "logger" using window.localStorage
 * as an array along with a "where" key. The logger messages are considered expendable
 * so if the OS purges them it is acceptable.
 * @param  {Events} publicevents
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


    /**
     * Adds a new logger message to persistant storage. Sends out an event upon
     * completion.
     * @param  {string} type     the type of logger message, error or alarm
     * @param  {string} location location of error or message in source code
     * @param  {string} message  message in string format
     * @param  {any}    data     any object, mostly for errors but could be other data
     * @return {undefined}
     */
    set = function(type:string, location:string, message:string, data:any){

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


    /**
     * Deletes a row from the stored logger list.
     * @param  {number} lineNumber the array index to remove
     * @return {array}             the current list of logger messages after removing the deletion
     */
    delete(lineNumber:number){
      this.messages.splice(lineNumber,1);
      window.localStorage.setItem("logger", JSON.stringify(this.messages));
      return this.messages;
    }


    /**
     * Gets the list of logger messages.
     * @return {array}  the current list of logger messages
     */
    get = function(){
        return this.messages;
    }


}
