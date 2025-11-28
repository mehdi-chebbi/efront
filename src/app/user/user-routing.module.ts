import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { FormatricesComponent } from './formatrices/formatrices.component';
import { HomeComponent } from './home/home.component';
import { FormationComponent } from './formation/formation.component';
import { AuthComponent } from './auth/auth.component';
import { AuthInscriptionComponent } from './auth-inscription/auth-inscription.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfilComponent } from './profil/profil.component';
import { DetailsComponent } from './details/details.component';
import { ParticipationComponent } from './participation/participation.component';
import { AvisComponent } from './avis/avis.component';
import { CertificationComponent } from './certification/certification.component';
import { ChatbotUserComponent } from './chatbot-user/chatbot-user.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirection par défaut
  { path: 'home', component: HomeComponent }, // Composant principal
  { path: 'formation', component: FormationComponent }, // Composant principal
  { path: 'formatrices', component: FormatricesComponent },
  { path: 'certification/:id', component: CertificationComponent },
  { path: 'contact', component: ContactComponent }, // Composant principal
  { path: 'auth', component: AuthComponent}, // Composant principal
  { path: 'inscription', component: AuthInscriptionComponent}, // Composant principal
  { path: 'ForgetPaswword', component: ForgotPasswordComponent},
  { path: 'user/:id', component: ProfilComponent },
  { path: 'Profil', component: ProfilComponent},
  { path: 'Avis', component: AvisComponent},
  { path: 'Participation/:id/:formationId', component: ParticipationComponent},
  { path: 'DetailFormation/:id', component: DetailsComponent}, // Composant principal
  { path: 'chat', component: ChatbotUserComponent},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
