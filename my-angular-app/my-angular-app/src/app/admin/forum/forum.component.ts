import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AvisService } from 'src/services/avis.service';
import { Avis, AvisStatus } from 'src/models/Avis.model';
import { ForumService } from 'src/services/forum.service';
import { AnalyseSentiementsService } from 'src/services/analyse-sentiements.service';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})


export class ForumComponent {
  avisList: any[] = [];
  ForumList: any[] = [];
  filteredAvis: any[] = [];

  paginatedAvis: any[] = [];
  searchTerm: string = '';
  selectedRole: string = 'all';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(
    private router: Router,
    private avisService: AvisService,
    private ForumService : ForumService,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private analyseService: AnalyseSentiementsService
  ) {}

  ngOnInit(): void {
    this.loadAvis();
    this. loadAvisForum();
  }

loadAvis(): void {
  this.avisService.getAvis().pipe(
    switchMap((res: any) => {
      this.avisList = res.data;

      // Créer un tableau d'observables pour chaque analyse
      const analyseObservables = this.avisList.map(avis => {
        return this.analyseService.analyserCommentaire(avis.commentaire).pipe(
          map(sentiment => {
            avis.sentiment = sentiment;
            return avis;
          }),
          catchError(() => {
            avis.sentiment = 'inconnu';
            return of(avis);
          })
        );
      });

      // Exécuter toutes les analyses en parallèle
      return forkJoin(analyseObservables);
    })
  ).subscribe({
    next: () => {
      this.applyFilters();
    },
    error: err => {
      console.error("Erreur lors du chargement des avis", err);
    }
  });
}



  loadAvisForum(): void {

    this.ForumService.getAllTopics().subscribe({
      next: (res: any) => {
        this.ForumList = res;
       console.log(this.ForumList)
      },
      error: err => {
        console.error("Erreur lors du chargement des avis", err);
      }
    });
  }



  updateStatus(avis: Avis): void {
   // Empêcher les clics multiples

    const originalStatus = avis.statut;
    const newStatus = this.getNextStatus(originalStatus);

    // Mise à jour optimiste immédiate
    avis.statut = newStatus;


    this.avisService.updateAvis(avis._id, { statut: newStatus }).subscribe({
      next: (updatedAvis) => {
        // Mise à jour complète de l'objet
        const index = this.avisList.findIndex(a => a._id === avis._id);
        this.avisList[index] = updatedAvis;

        // Forcer la détection des changements si nécessaire
        this.cd.detectChanges();
      },
      error: (err) => {
        // Revenir à l'ancien statut en cas d'erreur
        avis.statut = originalStatus;
        console.error('Erreur de mise à jour', err);

        // Optionnel: Afficher un message d'erreur
        // this.toastService.error('Échec de la mise à jour');
      },
      complete: () => {

      }
    });
  }

  private getNextStatus(currentStatus: AvisStatus): AvisStatus {
    const statusOrder: AvisStatus[] = ['approuve', 'en_attente', 'rejete'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return statusOrder[(currentIndex + 1) % statusOrder.length];
  }

  getStatusText(status: AvisStatus): string {
    const statusMap: Record<AvisStatus, string> = {
      'approuve': 'Approuvé',
      'en_attente': 'En attente',
      'rejete': 'Rejeté'
    };
    return statusMap[status];
  }

  getStatusClass(status: AvisStatus): string {
    switch (status) {
      case 'approuve': return 'bg-gradient-success';
      case 'en_attente': return 'bg-gradient-warning';
      case 'rejete': return 'bg-gradient-danger';
      default: return '';
    }
  }

  breakTextEveryNWords(text: string, wordsPerLine: number = 5): string {
    if (!text) return '';
    const words = text.split(' ');
    let result = '';

    for (let i = 0; i < words.length; i++) {
      result += words[i] + ' ';
      if ((i + 1) % wordsPerLine === 0) {
        result += '<br>';
      }
    }

    return result.trim();
  }



  onRoleFilter(event: any): void {
    this.selectedRole = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    if (!Array.isArray(this.avisList)) {
      this.filteredAvis = [];
      return;
    }

    this.filteredAvis = this.avisList.filter(avis => {
      const matchesSearch = this.searchTerm === '' ||
        avis.commentaire?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });

    this.totalItems = this.filteredAvis.length;
    this.updatePaginatedAvis();
  }

  updatePaginatedAvis(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAvis = this.filteredAvis.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedAvis();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = event.target.value;
    this.currentPage = 1;
    this.updatePaginatedAvis();
  }

  deleteAvis(avisId: string) {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      width: "300px",
      showCancelButton: true,
      confirmButtonColor: "#c76970",
      cancelButtonColor: "#89cbea",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        this.avisService.deleteAvis(avisId).subscribe(
          () => {
            this.loadAvis();
            Swal.fire("Supprimé !", "L'avis a été supprimé.", "success");
          },
          (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire("Erreur", "Une erreur est survenue lors de la suppression.", "error");
          }
        );
      }
    });
  }


  deleteForum(avisId: string) {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      width: "300px",
      showCancelButton: true,
      confirmButtonColor: "#c76970",
      cancelButtonColor: "#89cbea",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        this.ForumService.deleteForumTopic(avisId).subscribe(
          () => {
            this.loadAvis();
            Swal.fire("Supprimé !", "Poste a été supprimé.", "success");
          },
          (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire("Erreur", "Une erreur est survenue lors de la suppression.", "error");
          }
        );
      }
    });
  }

  getEvaluationStars(evaluation: number): string {
    return '★'.repeat(evaluation) + '☆'.repeat(5 - evaluation);
  }

  Math = Math;

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    const pagesToShow = 5;
    const pages: number[] = [];

    if (totalPages <= pagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

      if (endPage - startPage + 1 < pagesToShow) {
        startPage = endPage - pagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
