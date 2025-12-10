import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import jwt_decode from 'jwt-decode';
import * as QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FormationsService } from 'src/services/formations.service';
import { UserServiceService } from 'src/services/user-service.service';
import { CertificatService } from 'src/services/certfication.service';

@Component({
  selector: 'app-certification',
  templateUrl: './certification.component.html',
  styleUrls: ['./certification.component.css']
})
export class CertificationComponent  {
  updatedImageUrl: string | null = null;
  idFormation: any;
  certificat :any;
  errorMessage: any;
  user: any;

  constructor(private certifService:CertificatService,private userService : UserServiceService,private ativedRouter : ActivatedRoute) {}

 ngOnInit(): void {
  this.idFormation = this.ativedRouter.snapshot.params['id'];

  // 1. Récupération du token et des infos utilisateur
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('Token non trouvé');
    return;
  }

  try {
    const decodedToken: any = jwt_decode(token);
    const userId = decodedToken.userId;

    // 2. Récupération des infos utilisateur
    this.userService.getUserDetails(userId).subscribe({
      next: (userData) => {
        this.user = userData;
        console.log('Utilisateur récupéré:', this.user);

        // 3. Mise à jour du certificat après avoir obtenu les infos utilisateur
       const fullName = `${(this.user.nom + ' ' + this.user.prenom).toUpperCase().trim()}`;
        this.updateCertificat(fullName);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des infos utilisateur", err);
        this.CertifGet(); // Chargement quand même les certificats
      }
    });
  } catch (error) {
    console.error('Erreur de décodage du token', error);
    this.CertifGet();
  }
}

private updateCertificat(fullName: string): void {
  this.certifService.updateCertifiedPersonValueByIdFormation(this.idFormation, fullName)
    .subscribe({
      next: (response) => {
        console.log('Mise à jour réussie', response);
        this.CertifGet(); // Charger les certificats après la mise à jour
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
        this.CertifGet(); // Charger les certificats même en cas d'erreur
      }
    });
}
  imageLoaded = false;
  decalageX =0;
  objectKeys = Object.keys;
  CertifGet(): void {
    this. certifService.getCertifByIdFormation(this.idFormation).subscribe({
      next: (data) => {
        console.log("Certificat reçu :", data);
        this.certificat = data;
        console.log('dataimage', data[0]?.titre);
        if (Array.isArray(data) && data.length > 0) {
          this.certificat = data[0];
          console.log('Titre :', this.certificat.titre);
          console.log(this.certificat.references);
console.log(this.objectKeys(this.certificat.references));  // Vérifie ce que retourne objectKeys



        } else {
          console.log('Aucun certificat trouvé.');
        }


      },
      error: (err) => {
        console.error("Erreur :", err);
        this.errorMessage = 'Erreur lors du chargement du certificat.';
      },
      complete: () => {
        console.log("Chargement du certificat terminé.");
      }
    });
  }
  getReferenceKeys(): string[] {
    return this.certificat && this.certificat.references
      ? Object.keys(this.certificat.references)
      : [];
  }

}
