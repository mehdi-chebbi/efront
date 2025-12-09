import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfilComponent } from './profil/profil.component';
import { TableComponent } from './table/table.component';
import { DetailsBackComponent } from './details-back/details-back.component';
import { AjouterFormationComponent } from './ajouter-formation/ajouter-formation.component';
import { EditFormationComponent } from './edit-formation/edit-formation.component';
import { QuizComponent } from './quiz/quiz.component';
import { DetailQuizComponent } from './detail-quiz/detail-quiz.component';
import { DetailsUserComponent } from './details-user/details-user.component';
import { ForumComponent } from './forum/forum.component';
import { CertifBackComponent } from './certif-back/certif-back.component';


const routes: Routes = [

  { path: 'dash', component: DashboardComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'table', component: TableComponent },
  { path: 'Forum', component: ForumComponent},
  { path: 'certif/:id', component:CertifBackComponent},
  { path: 'DetailFormations/:id', component: DetailsBackComponent},
  { path: 'EditFormations/:id', component: EditFormationComponent},
  { path: 'QuizFormations/:id', component:QuizComponent},
  { path: 'DetailsUser/:id', component:DetailsUserComponent},
  { path: 'QuizDetail/:idQuiz/:idformation', component:DetailQuizComponent},
  { path: 'AddFormations', component: AjouterFormationComponent} // Composant principal
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
