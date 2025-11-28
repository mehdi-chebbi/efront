import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import jwt_decode from 'jwt-decode';
import { EditProfileDialogComponent } from 'src/app/user/edit-profile-dialog/edit-profile-dialog.component';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
   editForm: FormGroup;

   constructor(
     private fb: FormBuilder,
     private userService: UserServiceService,
     public dialogRef: MatDialogRef<EditProfileDialogComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any
   ) {
     this.editForm = this.fb.group({
       nom: [data.nom, Validators.required],
       prenom: [data.prenom, Validators.required],
       email: [data.email, [Validators.required, Validators.email]],
       
       role: [data.role, Validators.required],
       Langue: [data.Langue, Validators.required],
       phone: [data.phone],
       organisation: [data.organisation],
       poste: [data.poste],
       photo :[data.photo],
       adresse: [data.adresse],
       departement: [data.departement]
     });
   }

   userId :any
  ngOnInit():void {

  }

  onFileSelected(event: Event) {
   const file = (event.target as HTMLInputElement).files?.[0];
   if (file) {
     console.log('Fichier sélectionné :', file.name);
     // Vous pouvez ensuite stocker le fichier dans un FormControl ou l'envoyer à un backend
   }
 }


  onNoClick(): void {
    this.dialogRef.close();
  }

  updateUser() {
    if (this.editForm.valid) {
      const updatedUser = this.editForm.value; // Récupérer les nouvelles valeurs du formulaire
      this.userService.updateUser(this.data._id, updatedUser).subscribe({
        next: (response) => {
          console.log('Utilisateur mis à jour avec succès', response);
          window.location.reload();
          this.dialogRef.close(true); // Fermer la boîte de dialogue et renvoyer true pour rafraîchir
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
        }
      });
    } else {
      console.log('Le formulaire est invalide');
    }
  }
}
