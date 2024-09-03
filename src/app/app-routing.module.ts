import { RouterModule, Routes } from '@angular/router';
import { EditingPageComponent } from './editing-page/editing-page.component';
import { HomeComponent } from './home/home/home.component';
import { NgModule } from '@angular/core';
import { FileSavedComponent } from './file-saved/file-saved.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'editing-page', component: EditingPageComponent },
  { path: 'file-saved', component: FileSavedComponent },
  { path: 'home', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
