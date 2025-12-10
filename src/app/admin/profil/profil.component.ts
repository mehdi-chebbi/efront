import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { EditProfileDialogComponent } from 'src/app/user/edit-profile-dialog/edit-profile-dialog.component';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  isSidebarCollapsed = false;
  user: any = {};
  userId!: string;
  editForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(
    private userService: UserServiceService,
    private router: Router,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const sidenav = document.getElementById('sidenav-main');
    if (sidenav) {
      sidenav.classList.toggle('d-none', this.isSidebarCollapsed);
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: any = jwt_decode(token);
      this.userId = decodedToken.userId;

      this.userService.getUserDetails(this.userId).subscribe((data) => {
        this.user = data;
        this.initForm();
      });
    } else {
      console.error('Token non trouvé');
    }
  }

  initForm(): void {
    this.editForm = this.fb.group({
      email: [this.user.email || ''],
      nom: [this.user.nom || ''],
      prenom: [this.user.prenom || ''],
      password: [''],
      adresse: [this.user.adresse || ''],
      phone: [this.user.phone || ''],
      poste: [this.user.poste || ''],
      organisation: [this.user.organisation || ''],
      departement: [this.user.departement || 'Choisir votre département'],
      langue: [this.user.langue || 'FR'] // Valeur par défaut FR
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken");
        this.router.navigate(["/user/auth"]);
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }

  updateProfile(): void {
    if (this.editForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      const formValues = this.editForm.value;

      // Ajouter tous les champs du formulaire
      Object.keys(formValues).forEach(key => {
        if (key !== 'password' || formValues[key] !== '') {
          formData.append(key, formValues[key]);
        }
      });

      // Ajouter le fichier s'il a été sélectionné
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name);
      }

      this.userService.updateUser(this.userId,formValues).subscribe(
        (response) => {
          this.isLoading = false;
          this.user = response.updatedUser || response;
          this.initForm();
          this.selectedFile = null;
          this.selectedFileName = '';
          alert('Profil mis à jour avec succès!');
          this.cdRef.detectChanges();
        },
        (error) => {
          this.isLoading = false;
          console.error('Erreur lors de la mise à jour du profil', error);
          alert('Une erreur est survenue lors de la mise à jour du profil');
        }
      );
    }
  }
}
