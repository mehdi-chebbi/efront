import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfilComponent } from './profil/profil.component';
import { TableComponent } from './table/table.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DetailsBackComponent } from './details-back/details-back.component';
import { AjouterFormationComponent } from './ajouter-formation/ajouter-formation.component';
import { EditFormationComponent } from './edit-formation/edit-formation.component';
import { QuizComponent } from './quiz/quiz.component';
import { DetailQuizComponent } from './detail-quiz/detail-quiz.component';
import { NavBarBackComponent } from './nav-bar-back/nav-bar-back.component';
import { FooterBackComponent } from './footer-back/footer-back.component';
import { AsidBackComponent } from './asid-back/asid-back.component';
import { DetailsUserComponent } from './details-user/details-user.component';
import { ForumComponent } from './forum/forum.component';
import { CertifBackFormComponent } from './certif-back-form/certif-back-form.component';
import { CertifBackComponent } from './certif-back/certif-back.component';



@NgModule({
  declarations: [


    DashboardComponent,

        ProfilComponent,
        TableComponent,
        EditUserDialogComponent,
        DetailsBackComponent,
        AjouterFormationComponent,
        EditFormationComponent,
        QuizComponent,
        DetailQuizComponent,
        NavBarBackComponent,
        FooterBackComponent,
        AsidBackComponent,
        DetailsUserComponent,
        ForumComponent,
        CertifBackFormComponent,
        CertifBackComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,

    MatButtonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
