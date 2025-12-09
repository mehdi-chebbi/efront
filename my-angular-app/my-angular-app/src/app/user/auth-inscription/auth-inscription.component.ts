import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Pour la redirection
import { TranslateService } from '@ngx-translate/core';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-auth-inscription',
  templateUrl: './auth-inscription.component.html',
  styleUrls: ['./auth-inscription.component.css']
})
export class AuthInscriptionComponent implements OnInit {
  inscriptionForm: FormGroup;
  selectedRole: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  isLoading = false;
  currentStep = 1; // Étape actuelle du formulaire
  totalSteps = 3;
  emailAlreadyExists = false;// Nombre total d'étapes

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private translate: TranslateService,
    private router: Router
  ) {
    translate.setDefaultLang('Fr');
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern('^[a-zA-Zà-ÿÀ-ÿ\\s]+$')]],
      prenom: ['', [Validators.required, Validators.pattern('^[a-zA-Zà-ÿÀ-ÿ\\s]+$')]],
      email: ['', [Validators.required, Validators.email ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*]).{6,}$')
      ]],
      role: ['', Validators.required],
      Langue: ['', Validators.required],
      poste: [''],
      phone: ['', [Validators.required]],
      photo: [''],
      organisation: [''],
      departement: [''],
      adresse: ['', Validators.required]
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {}

  get nom() { return this.inscriptionForm.get('nom'); }
  get prenom() { return this.inscriptionForm.get('prenom'); }
  get email() { return this.inscriptionForm.get('email'); }
  get password() { return this.inscriptionForm.get('password'); }
  get role() { return this.inscriptionForm.get('role'); }
  get poste() { return this.inscriptionForm.get('poste'); }
  get phone() { return this.inscriptionForm.get('phone'); }
  get organisation() { return this.inscriptionForm.get('organisation'); }
  get adresse() { return this.inscriptionForm.get('adresse'); }
  get Langue() { return this.inscriptionForm.get('Langue'); }
  get  departement() { return this.inscriptionForm.get('departement'); }
  get photo() { return this.inscriptionForm.get('photo'); }

  // Fonction pour sélectionner un fichier (photo)
  onFileSelected(event: any): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  // Passer à l'étape suivante
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  // Revenir à l'étape précédente
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Changement du rôle et mise à jour des champs correspondants
  onRoleChange(event: any): void {
    this.selectedRole = event.target.value;
    if (this.selectedRole !== 'apprenant') {
      this.inscriptionForm.get('poste')?.setValue('');
    }
    if (this.selectedRole !== 'apprenant') {
      this.inscriptionForm.get('departement')?.setValue('');
    }
    if (this.selectedRole !== 'partenaire') {
      this.inscriptionForm.get('organisation')?.setValue('');
    }
  }
  checkEmailUniqueness() {
    const email = this.inscriptionForm.get('email')?.value;
    if (!email) return;

    this.userService.checkEmailExists(email).subscribe(
      (exists: boolean) => {
        this.emailAlreadyExists = exists;
        if (exists) {
          this.inscriptionForm.get('email')?.setErrors({ emailTaken: true });
        }
      },
      (error) => {
        console.error("Erreur lors de la vérification de l'email :", error);
      }
    );
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.inscriptionForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      Object.keys(this.inscriptionForm.controls).forEach(key => {
        if (key !== 'photo') { // On n'ajoute pas la photo ici
          formData.append(key, this.inscriptionForm.get(key)?.value);
        }
      });

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile); // Ajout du fichier photo
      }

      this.userService.registerUser(formData).subscribe(
        (response) => {
          this.successMessage = 'Inscription réussie ! Redirection en cours...';
          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/user/auth']);
          }, 3000);
        },
        (error) => {
          this.errorMessage = error.error.message || "Une erreur s'est produite.";
          this.isLoading = false;
        }
      );
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
    }
  }
}
