import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserServiceService } from 'src/services/user-service.service';
import Swal from 'sweetalert2';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];
  searchTerm: string = '';
  selectedRole: string = 'all';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  constructor(
    private router: Router,
    private userService: UserServiceService,
    public dialog: MatDialog,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUser().subscribe(
      (data) => {
        this.users = data;
        this.applyFilters();
      },
      (error) => {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      }
    );
  }

  onRoleFilter(event: any): void {
    this.selectedRole = event.target.value;
    this.currentPage = 1; // Reset to first page when filter changes
    this.applyFilters();
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when search changes
    this.applyFilters();
  }

  applyFilters(): void {
    // Apply role and search filters
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      const matchesSearch = this.searchTerm === '' ||
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });

    this.totalItems = this.filteredUsers.length;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = event.target.value;
    this.currentPage = 1; // Reset to first page when page size changes
    this.updatePaginatedUsers();
  }

  openEditDialog(user: any): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '600px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(userId: string) {
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
        this.userService.deleteUser(userId).subscribe(
          () => {
            this.loadUsers();
            Swal.fire("Supprimé !", "L'utilisateur a été supprimé.", "success");
          },
          (error) => {
            console.error("Erreur lors de la suppression :", error);
            Swal.fire("Erreur", "Une erreur est survenue lors de la suppression.", "error");
          }
        );
      }
    });
  }

  viewUser(id: any): void {
    this.router.navigate(['/admin/DetailsUser', id]);
  }

  toggleStatus(userId: string) {
    this.userService.toggleUserStatus(userId).subscribe(
      (response) => {
        console.log(response.message);
        this.loadUsers();
      },
      (error) => {
        console.error("Erreur lors de la mise à jour du statut :", error);
      }
    );
  }

  Math = Math;

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    const pagesToShow = 5; // Number of pages to show in pagination
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
