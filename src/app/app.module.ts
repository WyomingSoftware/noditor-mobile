import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule} from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { NoditorApp } from './app.component';

import { SettingsPage } from '../pages/settings/settings';
import { LoggerListPage } from '../pages/logger/logger-list';
import { LoggerPage } from '../pages/logger/logger';
import { ServersPage } from '../pages/servers/servers';
import { StatsDetailsPage } from '../pages/stats/stats-details';
import { ServerSetupModal } from '../pages/servers/server-setup';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


// COMPONENTS
import { MessageComponent } from '../components/message';
import { HintsComponent } from '../components/hints';

// PROVIDERS
import { HttpService } from '../providers/httpService';
import { UTILS} from '../providers/utils';
import { ServersService } from '../providers/serversService';
import { LoggerService } from '../providers/loggerService';

@NgModule({
  declarations: [
    NoditorApp,
    MessageComponent,
    HintsComponent,
    SettingsPage,
    LoggerListPage,
    LoggerPage,
    ServersPage,
    StatsDetailsPage,
    ServerSetupModal,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(NoditorApp),
    IonicStorageModule.forRoot({
      name: '__noditordb',
         driverOrder: ['websql', 'indexeddb' ]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    NoditorApp,
    SettingsPage,
    LoggerListPage,
    LoggerPage,
    ServersPage,
    StatsDetailsPage,
    ServerSetupModal,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UTILS,
    HttpService,
    LoggerService,
    ServersService,
    MessageComponent,
    HintsComponent,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
