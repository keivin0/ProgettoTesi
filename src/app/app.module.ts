import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditingPageModule } from './editing-page/editing-page.module';
import { HomeModule } from './home/home/home.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    EditingPageModule,
    HomeModule, // Importa il modulo di routing principale
    SharedModule,
  ],
  bootstrap: [AppComponent], // Configura il bootstrap con AppComponent
})
export class AppModule {}
