import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditingPageComponent } from './editing-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [EditingPageComponent],
  imports: [CommonModule, SharedModule],
  exports: [EditingPageComponent],
})
export class EditingPageModule {}
