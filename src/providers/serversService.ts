import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable()


export class ServersService {


  /** Class constructor.
    */
  constructor(public storage: Storage) {
  }


  /**
   * Creates the list of demo servers
   * @return array list of demo servers
   */
  getDemos = function(){
    let demos = [];

    // Only demo servers have the demo = true key
    demos.push({
        "key":"noditor-server-1",
        demo:true,
        "name":"Demo @Noditor",
        "path":null,
        "passcode":"wyosoft",
        "url":"http://www.noditor.com"});

    demos.push({
        "key":"noditor-server-2",
        demo:true,
        "name":"Demo @Heroku",
        "path":null,
        "passcode":"wyosoft",
        "url":"https://noditor.herokuapp.com"});

    return demos;
  }


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

  set = function(server){
    var self = this;
    let store = {key:server.key, name:server.name, url:server.url,
      path:server.path, passcode:server.passcode};
    self.storage.set(server.key, store).then((data) => {
      console.log('ServersService.set', data)
    });
  }


  remove = function(key){
    console.log('ServersService.remove', key);
    var self = this;
    self.storage.remove(key).then((data) => {
      console.log('ServersService.removed')
    });
  }


}
