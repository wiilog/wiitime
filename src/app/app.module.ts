import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {CommonModule} from '@angular/common';
import {NFC, Ndef} from '@awesome-cordova-plugins/nfc/ngx';
import {SQLite} from '@awesome-cordova-plugins/sqlite/ngx';
import {ScreenOrientation} from '@awesome-cordova-plugins/screen-orientation/ngx';
import {HttpClientModule} from '@angular/common/http';
import {FTP} from '@awesome-cordova-plugins/ftp/ngx';
import {BackgroundMode} from '@awesome-cordova-plugins/background-mode/ngx';


@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, CommonModule, HttpClientModule],
    providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy}, NFC, Ndef, SQLite, ScreenOrientation, FTP, BackgroundMode],
    bootstrap: [AppComponent],
})
export class AppModule {
}
