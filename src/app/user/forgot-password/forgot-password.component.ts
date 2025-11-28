import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  resetCodeForm: FormGroup;
  newPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  currentStep: number = 1;
  storedEmail: string = '';  // Stocke l'email pour éviter de le redemander

  constructor(private fb: FormBuilder, private userService: UserServiceService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetCodeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  // Étape 1: Envoi de la demande pour l'OTP
  onForgotPasswordSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.value.email;
    this.userService.forgotPassword(email).subscribe(
      (response) => {
        this.storedEmail = email; // Stocker l'email pour éviter de le redemander
        this.successMessage = 'Un code de réinitialisation a été envoyé à votre email.';
        this.currentStep = 2;
      },
      (error) => {
        this.errorMessage = error.error.message || 'Une erreur est survenue.';
      }
    );
  }

  // Étape 2: Vérification du code OTP
  onVerifyCodeSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const { code } = this.resetCodeForm.value;
    this.userService.verifyResetCode(this.storedEmail, code).subscribe(
      (response) => {
        this.successMessage = 'Code vérifié. Vous pouvez réinitialiser votre mot de passe.';
        this.currentStep = 3;
      },
      (error) => {
        this.errorMessage = error.error.message || 'Code invalide ou expiré.';
      }
    );
  }

  // Étape 3: Réinitialisation du mot de passe
  onResetPasswordSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const { newPassword } = this.newPasswordForm.value;
    const code = this.resetCodeForm.value.code; // Récupérer le code OTP entré à l'étape précédente

    this.userService.resetPassword(this.storedEmail, code, newPassword).subscribe(
      (response) => {
        this.successMessage = 'Mot de passe réinitialisé avec succès.';
        this.currentStep = 4; // Indiquer que le processus est terminé
      },
      (error) => {
        this.errorMessage = error.error.message || 'Une erreur est survenue.';
      }
    );
  }

  // Avancer dans le processus si les données sont valides
  goToNextStep(): void {
    if (this.currentStep === 1 && this.forgotPasswordForm.valid) {
      this.onForgotPasswordSubmit();
    } else if (this.currentStep === 2 && this.resetCodeForm.valid) {
      this.onVerifyCodeSubmit();
    } else if (this.currentStep === 3 && this.newPasswordForm.valid) {
      this.onResetPasswordSubmit();
    }
  }
}
