import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {CommonModule} from '@angular/common';
import {NFC, Ndef} from '@ionic-native/nfc/ngx';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, CommonModule, HttpClientModule],
    providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy}, NFC, Ndef, SQLite, ScreenOrientation, SplashScreen],
    bootstrap: [AppComponent],
})
export class AppModule {
}
