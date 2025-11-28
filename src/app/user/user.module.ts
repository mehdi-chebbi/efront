import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants
import { FormatricesComponent } from './formatrices/formatrices.component';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { FormationComponent } from './formation/formation.component';
import { AuthComponent } from './auth/auth.component';
import { AuthInscriptionComponent } from './auth-inscription/auth-inscription.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ProfilComponent } from './profil/profil.component';
import { MatStepperModule } from '@angular/material/stepper';
// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { EditProfileDialogComponent } from './edit-profile-dialog/edit-profile-dialog.component'; // ✅ Ajout de MatSelectModule
import { TranslateModule } from '@ngx-translate/core';
import { FormationsComponent } from './formations/formations.component';
import { DetailsComponent } from './details/details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ParticipationComponent } from './participation/participation.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { AvisComponent } from './avis/avis.component';
import { CertificationComponent } from './certification/certification.component';
import { TruncatePipe } from './truncate-pipe.pipe';
import { ChatbotUserComponent } from './chatbot-user/chatbot-user.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    FormatricesComponent,
    HomeComponent,

    ContactComponent,
    FormationComponent,
    AuthComponent,
    AuthInscriptionComponent,
    ForgotPasswordComponent,
    ProfilComponent,
    AvisComponent,
    FooterComponent,
    EditProfileDialogComponent,
    FormationsComponent,
    FooterComponent,
    DetailsComponent,
    NavbarComponent,
    ParticipationComponent,
    CertificationComponent,
    TruncatePipe,
    ChatbotUserComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    TranslateModule, // Ajout obligatoire ici !,
    MatDialogModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    // Angular Material
    MatTabsModule,
    MatCardModule,
    MatStepperModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,

    MatDividerModule,
    MatInputModule,
    MatSelectModule // ✅ Import du module
  ]
})
export class UserModule { }
