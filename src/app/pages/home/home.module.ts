import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { FooterComponent } from '@app/components/footer/footer.component';
import {CommonModules} from "@app/common.modules";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        CommonModules
    ],
  declarations: [
      HomePage,
      FooterComponent,
  ]
})
export class HomePageModule {}
