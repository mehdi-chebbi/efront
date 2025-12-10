import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import jwt_decode from 'jwt-decode';
import { UserServiceService } from 'src/services/user-service.service';


@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent {
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
      password: [''],
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
  const token = localStorage.getItem('authToken');
  if (token) {
          // Décoder le token pour extraire l'ID utilisateur
          const decodedToken: any = jwt_decode(token);  // Use the decoded token function
          const role = decodedToken.role;
           this.userId = decodedToken.userId;
  }
 }

 onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    console.log('Fichier sélectionné :', file.name);
    // Vous pouvez ensuite stocker le fichier dans un FormControl ou l'envoyer à un backend
  }
}



  update(): void {
    if (this.editForm.valid) {
      this.userService.updateUser(this.userId, this.editForm.value).subscribe();
      this.dialogRef.close(this.editForm.value);
      window.location.reload();
    }
  }
}
