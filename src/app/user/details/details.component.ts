import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { Formation } from 'src/models/Formation.model';
import { FormationsService } from 'src/services/formations.service';
import { ParticipationService } from 'src/services/participation.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  formation!: Formation; // Stocke une seule formation
  formationId!: string;
  user: any = {};
  isInscrit: boolean = false;
  selectedModule: any = null;
  dropdownOpen = false;
  constructor(
    private formationService: FormationsService,
    private userService: UserServiceService,
    private router: Router,
    private particiationService : ParticipationService,
    private route: ActivatedRoute
  ) {}

  count() {
    return this.formation.modules.length;
  }


  ngOnInit(): void {

    this.formationId = this.route.snapshot.paramMap.get('id') || '';
    console.log("ID Formation récupéré depuis l'URL :", this.formationId);

    // 🔹 Récupérer une seule formation par ID
    this.formationService.getFormationById(this.formationId).subscribe({
      next: (data) => {
        console.log("Données reçues pour la formation :", data);
        this.formation = data;
      },
      error: (err) => console.error("Erreur lors du chargement de la formation", err),
    });

    // 🔹 Récupérer les infos de l'utilisateur connecté
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
  }
  toggleLecons(module: any): void {
    if (this.selectedModule === module) {
      this.selectedModule = null; // Si le module est déjà sélectionné, on le désélectionne
    } else {
      this.selectedModule = module; // Sélectionner ce module
    }
  }
  getLeconIcon(type: string): string {
    switch(type) {
      case 'video': return 'fa-play-circle text-success';
      case 'quiz': return 'fa-question-circle text-warning';
      case 'PDF':
      case 'PPT':
      case 'text':
      default: return 'fa-file-alt text-primary';
    }
  }
  getLessonIcon(type: string): string {
    switch(type.toLowerCase()) {
      case 'video': return 'fas fa-play';
      case 'quiz': return 'fas fa-question-circle';
      case 'pdf': return 'fas fa-file-pdf';
      case 'ppt': return 'fas fa-file-powerpoint';
      default: return 'fas fa-file-alt';
    }
  }

  getLessonColor(type: string): string {
    switch(type.toLowerCase()) {
      case 'video': return 'video';
      case 'quiz': return 'quiz';
      default: return 'document';
    }
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken"); // 🔹 Supprime le token après déconnexion
        this.router.navigate(["/user/auth"]); // 🔹 Redirection
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }


 // État de la participation



}
