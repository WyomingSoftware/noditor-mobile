import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()


/**
 * Provider to maintain a list of user defined servers in the Ionic storage engine.
 *
 * Eeach server is described by a simple object.
 * {
     key:string,
     demo:boolean,
     name:string,
     path:null,
     passcode:string,
     url:string
 * }
 *
 * @param  {Storage} publicstorage Ionic storage plugin
 */
export class ServersService {


  /** Class constructor.
    */
  constructor(public storage: Storage) {
  }


  /**
   * Creates the list of demo servers
   * @return array list of demo servers
   */

  /**
   * Gets a list of demos servers. All servers are described by an object but only
   * demo servers have the demo key.
   * @return {array} an array of the demo servers
   */
  getDemos = function(){
    let demos = [];
    demos.push({
        "key":"noditor-server-1",
        "demo":true, // Only demo servers have the demo:boolean = true key
        "name":"Demo @Noditor",
        "path":null,
        "passcode":"wyosoft",
        "url":"http://www.noditor.com"});

    demos.push({
        "key":"noditor-server-2",
        "demo":true, // Only demo servers have the demo:boolean = true ke
        "name":"Demo @Heroku",
        "path":null,
        "passcode":"wyosoft",
        "url":"https://noditor.herokuapp.com"});

    return demos;
  }


  /**
   * Gets a list of user defined server from the Ionic storage engine.
   * @return {Promise} returns a promise with an array of servers
   */
  get = function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        try{
          let servers = [];
          self.storage.length().then((len) => {
            if(len > 0){
              self.storage.forEach( (value, key, index) => {
                servers.push(value)
                if(index == len) resolve(servers);
              });
            }
            else{
              resolve(servers);
            }
          });
        }
        catch(err){
          reject(err);
        }
      });
  }


  /**
   * Adds or updates a server to the local Ionic storage engine.
   * @param  {object}    server an object that describes the server including its unique key
   * @return {undefined}
   */
  set = function(server:any){
    var self = this;
    let store = {key:server.key, name:server.name, url:server.url,
      path:server.path, passcode:server.passcode};
    self.storage.set(server.key, store).then((data) => {});
  }


  /**
   * Removes a server from the local Ionic storage engine.
   * @param  {string} key the unique key of the server object to remove
   * @return {undefined}
   */
  remove = function(key:string){
      var self = this;
      self.storage.remove(key).then((data) => {});
  }


}
