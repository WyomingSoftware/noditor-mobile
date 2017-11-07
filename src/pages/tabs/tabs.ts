import { Component } from '@angular/core';
import { SettingsPage } from '../settings/settings';
import { LoggerListPage } from '../logger/logger-list';
import { ServersPage } from '../servers/servers';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ServersPage;
  tab2Root = LoggerListPage;
  tab3Root = SettingsPage;

  constructor() {
  }
}
