import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jwt_decode from 'jwt-decode';
import { Avis, NewAvis } from 'src/models/Avis.model';
import { AvisService } from 'src/services/avis.service';
import { UserServiceService } from 'src/services/user-service.service';


@Component({
  selector: 'app-avis',
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.css']
})
export class AvisComponent implements OnInit {
  avisForm: FormGroup;
  avisList: Avis[] = [];
  isLoading = false;
  submitted = false;
  currentRating = 0;
  hoverRating = 0;
  user: any;

  constructor(
    private fb: FormBuilder,
    private avisService: AvisService,
    private userService : UserServiceService
  ) {
    this.avisForm = this.fb.group({
      commentaire: ['', [Validators.required, Validators.minLength(10)]],
      rating: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
     const token = localStorage.getItem('authToken');
        if (token) {
          const decodedToken: any = jwt_decode(token);
          const userId = decodedToken.userId; // Vérifie que 'userId' est bien la clé correcte

          this.userService.getUserDetails(userId).subscribe({
            next: (data) => this.user = data,
            error: (err) => console.error("Erreur lors de la récupération des infos utilisateur", err)
          });
        } else {
          console.error('Token non trouvé');
        }
    this.loadAvis();
    this.initStarRating();
  }

  loadAvis(): void {
    this.isLoading = true;
    this.avisService.getAvis().subscribe({
      
      next: (res: any) => {
        this.avisList = res.data;
      },
      error: err => {
        console.error("Erreur lors du chargement des avis", err);
      }
    });
  }



  initStarRating(): void {
    this.avisForm.get('rating')?.valueChanges.subscribe(value => {
      this.currentRating = value;
    });
  }

  setRating(rating: number): void {
    this.avisForm.get('rating')?.setValue(rating);
    this.hoverRating = 0; // Réinitialise le survol après sélection
  }

  setHoverRating(rating: number): void {
    if (this.currentRating === 0) {
      this.hoverRating = rating;
    }
  }

  resetHoverRating(): void {
    this.hoverRating = 0;
  }

  getStarClass(starIndex: number): string {
    if (this.hoverRating >= starIndex) {
      return 'hover';
    } else if (this.currentRating >= starIndex) {
      return 'active';
    }
    return '';
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.avisForm.invalid) {
      return;
    }

    const newAvis: NewAvis = {
      utilisateur: this.user._id, // ID réel de l'utilisateur
      evaluation: this.avisForm.value.rating,
      commentaire: this.avisForm.value.commentaire
    };

    this.avisService.createAvis(newAvis).subscribe({
      next: (avis) => {
        window.location.reload();
        this.avisList.unshift(avis); // Ajouter au début de la liste
        this.avisForm.reset();        // Réinitialise tous les champs
        this.submitted = false;
        this.currentRating = 0;       // Réinitialise la note si utilisée dans une étoile personnalisée


      },
      error: (err) => {
        console.error("Erreur lors de la création de l'avis", err);
      }
    });
  }


  get f() {
    return this.avisForm.controls;
  }
}
