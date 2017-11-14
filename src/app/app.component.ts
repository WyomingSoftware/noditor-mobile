import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';


@Component({
  templateUrl: 'app.html'
})

/**
 * App bootstrap class
 * @param  {Platform}     platform     Ionic platform system info class
 * @param  {StatusBar}    statusBar    Cordova status bar
 * @param  {SplashScreen} splashScreen Cordova splash screen
 */
export class NoditorApp {


  rootPage:any = TabsPage;


  constructor(platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen) {

    platform.ready().then(() => {
      // The platform is ready and plugins are available.
      // Perform higher level native functions needed.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }


}
