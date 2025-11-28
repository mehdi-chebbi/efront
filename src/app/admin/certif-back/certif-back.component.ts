import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import { CertificatService } from 'src/services/certfication.service';

interface TextZone {
  id: number;
  content: string;
  fontSize: string;
  fontWeight: string;
  reference?: string; // ← Ajout de la référence ici
  fontStyle: string;
  color : string;
  url: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  name?: string;
}
interface Logo {
  url: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}
interface ImageZone {
  id: number;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CertificateModel {
  image: string;
  textZones: TextZone[];
  logos: Logo[];


}


@Component({
  selector: 'app-certif-back',
  templateUrl: './certif-back.component.html',
  styleUrls: ['./certif-back.component.css']
})
export class CertifBackComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  textSize: string = '16px';
  imageWidth: number = 200;
  referenceOptions: string[] = [
    'Description',
    'Personne Certifiée',
    'Nom de Formation',
    'Date d\'obtention',
    'Formateur',
    'Organisation',
    'Partenaire'
  ];

  newReference: string = ''; // Pour la nouvelle référence à ajouter
  certificat :any;
  errorMessage :any;
  imageHeight: number = 200;
  imageZone: any = null;
  ImageResultat: any| null = null;
  textStyle = 'normal';
  private readonly GENERATED_MODELS_KEY = 'generatedModels';
  textColor = '#000000';           // couleur courante
  imageZones: any[] = [];
  // Liste des tailles de 1px à 36px
  fontSizes = Array.from({ length: 36 }, (_, i) => `${i + 1}px`);

  // Palette de couleurs (exemples)
  colors = [
    { name: 'Noir', value: '#000000' },
    { name: 'Rouge', value: '#ff0000' },
    { name: 'Bleu', value: '#0000ff' },
    { name: 'Vert', value: '#008000' },
    // … ajoutez-en autant que vous voulez …
  ];


    logos?: string[];
  bgImage: string | ArrayBuffer | null = null;
  color : string = 'red'
  textZones: TextZone[] = [];
  nextId = 1;
  selectedZoneId: number | null = null;
  toggleTextStyle(style: string) {
    if (style === 'bold') {
      this.textStyle = this.textStyle === 'bold' ? 'normal' : 'bold';
    } else if (style === 'italic') {
      this.textStyle = this.textStyle === 'italic' ? 'normal' : 'italic';
    }
    this.updateStyle(); // Update the style after toggling
  }

  addImageZone(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageZone = {
          id: Date.now(),
          type: 'image',
          src: reader.result as string,
          x: 50,
          y: 50,
          width: 150,
          height: 150
        };
      };
      reader.readAsDataURL(file);
    }
  }

  dragOffset = { x: 0, y: 0 };
draggedItem: any = null;
constructor(
  private certificatService : CertificatService,
  private activedRouter : ActivatedRoute,
  private cetifservice : CertificatService

){}


  // Lorsqu’on choisit un fichier DANS une imageZone
  onImageZoneSelected(event: Event, img: ImageZone) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      img.url = reader.result as string;
      // facultatif : masquer l’input ou rafraîchir la sélection
    };
    reader.readAsDataURL(file);
  }

   idFormation : any
   ngOnInit(): void {
    this.idFormation = this.activedRouter.snapshot.params['id'];
      // Charger les modèles générés depuis localStorage
      const saved = localStorage.getItem(this.GENERATED_MODELS_KEY);
      if (saved) {
        try {
          this.generatedModels = JSON.parse(saved);
        } catch (e) {
          console.error('Erreur de parsing des modèles sauvegardés', e);
          localStorage.removeItem(this.GENERATED_MODELS_KEY);
        }
      }
      this.CertifGet()
  }
  predefinedModels: CertificateModel[] = []

  CertifGet(): void {
    this.cetifservice.getCertifByIdFormation( this.idFormation).subscribe({
      next: (data) => {
        console.log("Certificat reçu :", data);
        this.certificat = data;
        this.predefinedModels= [
          {
            image: '../../../assets/background2.png', // Assure-toi que cette image existe dans ce chemin
            textZones: [
              // Les trois logos en parallèle
              {
                id: 1,
                content: '--ATTESTATION--',
                fontSize: '38px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                url:'',
                x: 50,
                y: 150
              },


              {
                id: 4,
                content: '« Coopération régionale pour de nouveaux indicateurs de comptabilité écosystémique du capital naturel en Afrique »',
                fontSize: '14px',
                url:'',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                x: 50,
                y: 310
              },
              {
                id: 5,
                content: 'Directrice du Département Terre et Biodiversité, atteste que',
                fontSize: '18px',
                url:'',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                x: 50,
                y: 350
              },
              {
                id: 6,
                content: this.certificat.NameUser,
                fontSize: '26px',
                fontWeight: 'bold',
                fontStyle: 'normal',
                url:'',
                color: '#d68910',
                x: 50,
                y: 380
              },
              {
                id: 6,
                content: 'a participé avec succès au 2ème atelier national',
                fontSize: '18px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                x: 50,
                y: 420,
                url:'',
              },
              {
                id: 6,
                content: 'DE FORMATION ET D’INFORMATION SUR LA COMPTABILITÉ ÉCOSYSTÉMIQUE DU CAPITAL NATUREL',
                fontSize: '17px',
                url:'',
                fontWeight: 'bold',
                fontStyle: 'normal',
                color: '#3498db',
                x: 50,
                y: 460
              },
              {
                id: 7,
                content: '12, 13, 14 ET 15 MARS 2024, TUNIS, TUNISIE',
                fontSize: '17px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                url:'',
                x: 50,
                y: 500
              },
              // Signature et titre
              {
                id: 8,
                content: 'Mme Ndèye Fatou MAR NDIAYE',
                fontSize: '14px',
                url:'',
                fontWeight: 'normal',
                fontStyle: 'italic',
                color: '#d68910',
                x: 10,
                y: 660
              },
              //logo

              {
                id: 9,
                content: 'Directrice du Département Terre et Biodiversité',
                fontSize: '14px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                url:'',
                x: 1,
                y: 590
              },
              {
                id: 9,
                content: '',
                fontSize: '14px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                url:'',
                x: 150,
                y: 590
              },
              {
                id: 10,
                content: 'M. Jean Louis Weber',
                fontSize: '14px',
                fontWeight: 'normal',
                url:'',
                fontStyle: 'italic',
                color: '#d68910',
                x: 400,
                y: 660
              },
              {
                id: 11,
                content: 'Formateur',
                fontSize: '14px',
                url:'',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#d68910',
                x: 400,
                  y: 590
              },
            ],
            logos: [
              {

                url: '../../../assets/mk1.png',
                x: 400,
                y: 200,
                width: 200,
                height: 100,


              },
  {

                url: '../../../assets/mkt2.png',
                x: 1,
                y: 550,
                width: 200,
                height: 150,


              },

              {

                url: '../../../assets/loggo2.png',
                x: 250,
                y: 40,
                width: 500,
                height: 100,


              },
            ]
          }
        ];
        console.log("hello",this.certificat.NameUser)
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

  addLogo(): void {
    const newLogo: Logo = {
      url: '',       // pas encore de source
      x: 100,        // position par défaut
      y: 100,
      width: 150,    // dimensions par défaut
      height: 150
    };
    this.currentLogos.push(newLogo);
  }

  triggerLogoInput(): void {
    this.logoInput.nativeElement.click();
  }

  /**
   * Ajoute un nouveau logo avec le fichier sélectionné
   */
  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const newLogo: Logo = {
        url: reader.result as string,
        x: 100,
        y: 100,
        width: 150,
        height: 150
      };
      this.currentLogos.push(newLogo);
      this.saveGeneratedModels();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }
  private saveGeneratedModels(): void {
    try {
      localStorage.setItem(
        this.GENERATED_MODELS_KEY,
        JSON.stringify(this.generatedModels)
      );
    } catch (e) {
      console.error('Erreur sauvegarde modèles', e);
    }
  }

  /**
   * Quand on sélectionne un fichier pour un logo, on met à jour sa propriété `url`
   */
  onLogoSelected(event: Event, logo: Logo): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      logo.url = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  addTextZone() {
    const newZone: TextZone = {
      id: this.nextId++,
      content: 'Votre texte ici',
      url: '',
      fontSize: this.textSize,
      fontWeight: this.textStyle === 'bold' ? 'bold' : 'normal',
      fontStyle: this.textStyle === 'italic' ? 'italic' : 'normal',
      color: this.textColor,
      x: 100,
      y: 100
    };
    this.textZones.push(newZone);
    this.selectedZoneId = newZone.id;
  }



  updateStyle() {
    const zone = this.textZones.find(z => z.id === this.selectedZoneId);
    if (zone) {
      zone.fontSize  = this.textSize;
      zone.fontWeight= this.textStyle === 'bold' ? 'bold' : 'normal';
      zone.fontStyle = this.textStyle === 'italic' ? 'italic' : 'normal';
      zone.color     = this.textColor;
    }
  }



    // (optionnel) un tableau pour ne pas mélanger avec tes modèles « pré-définis »
    generatedModels: CertificateModel[] = [];

    /**
     * Retourne un nouveau CertificateModel basé sur l'état actuel du composant
     */
    private generateCurrentModel(): CertificateModel {
      return {
        image: this.bgImage as string,
        textZones: this.textZones.map(zone => ({ ...zone })),
        logos: this.currentLogos.map(logo => ({ ...logo })),

      };
    }

  imagePreview: string | null = null;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Réinitialise la preview à chaque fois
      this.imagePreview = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Réinitialiser l'input pour éviter de déclencher plusieurs fois
      input.value = '';
    }
  }
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.imageZones.length) {
      const reader = new FileReader();
      reader.onload = () => {
        // on affecte l'image chargée à la dernière zone image
        this.imageZones[this.imageZones.length - 1].url = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else if (file) {
      // si pas de zone image, on l'utilise comme fond
      const reader = new FileReader();
      reader.onload = () => { this.bgImage = reader.result; };
      reader.readAsDataURL(file);
    }
  }



  removeBackground() {
    this.bgImage = null;
  }
  selectZone(zone: TextZone | ImageZone) {
    this.selectedZoneId = zone.id;
  }
  updateImagePosition(x: number, y: number) {
    this.imageZone.x = x;
    this.imageZone.y = y;
  }

  onDrag(event: MouseEvent, zone: TextZone | ImageZone) {
    event.stopPropagation();
    this.selectZone(zone);

    // Enregistrer la position initiale de l'événement et de la zone
    const startX = event.clientX, startY = event.clientY;
    const origX = zone.x, origY = zone.y;

    const move = (e: MouseEvent) => {
      // Calculer le déplacement de la zone
      zone.x = origX + (e.clientX - startX);
      zone.y = origY + (e.clientY - startY);
    };

    const stop = () => {
      // Supprimer les écouteurs de l'événement une fois le drag terminé
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };

    // Ajouter les écouteurs pour les événements de mouvement et de fin de drag
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
  }

  currentLogos: Logo[] = [];

  loadModel(model: CertificateModel) {
    this.bgImage = model.image;
    this.textZones = model.textZones.map(zone => ({ ...zone }));

    this.currentLogos = model.logos.map(logo => ({ ...logo }));
    this.nextId = Math.max(...this.textZones.map(z => z.id)) + 1;
    this.selectedZoneId = null;
  }
startResize(event: MouseEvent, logo: Logo) {
  event.preventDefault();
  event.stopPropagation(); // Empêche le déclenchement du drag

  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = logo.width;
  const startHeight = logo.height;

  const move = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Calcul de la nouvelle taille (avec taille minimale de 20px)
    logo.width = Math.max(20, startWidth! + deltaX);
    logo.height = Math.max(20, startHeight! + deltaY);
  };

  const stop = () => {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stop);
  };

  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
}

// Gardez votre méthode existante pour le drag
startLogoDrag(event: MouseEvent, logo: Logo) {
  event.preventDefault();

  const startX = event.clientX;
  const startY = event.clientY;
  const origX = logo.x;
  const origY = logo.y;
  let isDragging = false;

  const move = (e: MouseEvent) => {
    if (!isDragging && (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5)) {
      isDragging = true;
    }

    if (isDragging) {
      logo.x = origX + (e.clientX - startX);
      logo.y = origY + (e.clientY - startY);
    }
  };

  const stop = (e: MouseEvent) => {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stop);

    if (!isDragging) {
      this.removeLogo(logo);
    }
  };

  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
}
  removeLogo(logo: Logo) {
  this.currentLogos = this.currentLogos.filter(l => l !== logo);
}
  updateContent(event: Event, zone: TextZone) {
    const target = event.target as HTMLElement | null;
    if (target) {
      zone.content = target.innerText;
    }
  }


    // Define properties for color picker
    currentColor: string = '#000000';  // Default color
    isColorPickerOpen: boolean = false;  // To track if the color picker is open
      // Update the current color when a color is selected
  setColor(newColor: string) {
    this.currentColor = newColor;
    this.updateStyle(); // Apply the selected color to the selected text zone
  }
    // Open and close the color picker
    openColorPicker() {
      this.isColorPickerOpen = !this.isColorPickerOpen;
    }

    exportToutEnImagePNG(): void {
      // 1️⃣ Générer et stocker le modèle AVANT la capture
      const newModel = this.generateCurrentModel();
      this.generatedModels.push(newModel);

      try {
        localStorage.setItem(
          this.GENERATED_MODELS_KEY,
          JSON.stringify(this.generatedModels)
        );
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des modèles générés', e);
      }

      // 2️⃣ Capture
      const element = document.getElementById('element-a-capturer');
      if (!element) {
        console.warn("Élément à capturer non trouvé !");
        return;
      }

      this.selectedZoneId = null;

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      })
        .then((canvas: HTMLCanvasElement) => {
          this.ImageResultat = canvas.toDataURL('image/png');

          const idUser = '67e5eb3de5e094b57a0a3fce';
          const blob = this.dataURLtoBlob(this.ImageResultat);
          const formData = new FormData();
          formData.append('image', blob, 'certificat.png');

          // Ajout des champs complémentaires requis
          formData.append('titre', 'Certificat OSS');
          formData.append('directeur', 'M. Mourad Briki');
           // à remplacer dynamiquement

          // Préparer les références (zones de texte)
          const references: any = {};
          this.textZones.forEach(zone => {
            if (zone.content) {
              const referenceKey = zone.reference || `zone${zone.id}`;
              let adjustedX = zone.x;

              if (zone.content.length < 30) {
                adjustedX += 400;
              } else if (zone.content.length < 50) {
                adjustedX += 280;
              }else if (zone.content.length < 70) {
                adjustedX += 200;
              } else  {
                adjustedX += 80;
              }

              references[referenceKey] = {
                valeur: zone.content,
                x: adjustedX,
                y: zone.y
              };
            }
          });



          formData.append('references', JSON.stringify(references));

          // Préparer les logos
          const logos: any = {};
          this.currentLogos.forEach((logo, index) => {
            logos[`logo${index + 1}`] = {
              url:logo.url,
              x: logo.x,
              y: logo.y
            };
          });
          formData.append('logos', JSON.stringify(logos));
         // Ajout du background si défini et de type string
if (this.bgImage && typeof this.bgImage === 'string') {
  try {
    const blobBg = this.dataURLtoBlob(this.bgImage); // réutilise ta méthode
    formData.append('BackgroundImage', blobBg, 'background.png');
  } catch (err) {
    console.error('Erreur lors de la conversion du background en Blob :', err);
  }
}


          // Appel du service
          this.certificatService.createCertificat(formData, idUser, this.idFormation)
            .subscribe({
              next: res => console.log('Certificat créé :', res),
              error: err => console.error('Erreur création :', err)
            });

          // 🖼️ Affichage dans une nouvelle fenêtre
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write('<html><head><title>Image Capturée</title></head><body style="margin:0;">');
            newWindow.document.write(`<img src="${this.ImageResultat}" style="max-width:100%; display:block; " alt="Image Capturée"/>`);
            newWindow.document.write('</body></html>');
            newWindow.document.close();
          }
        })
        .catch(error => console.error('Erreur lors de la capture :', error));
    }


    // Méthode pour convertir un DataURL en Blob
// Méthode pour convertir un DataURL en Blob
private dataURLtoBlob(dataURL: string): Blob {
  // Vérifier si le DataURL est bien formé
  if (!dataURL.startsWith('data:image/png;base64,')) {
    console.error('DataURL mal formaté :', dataURL);
    throw new Error('DataURL incorrect pour l\'image');
  }

  // Extraire la partie base64 et la séparer du type MIME
  const [contentType, base64] = dataURL.split(';base64,');

  // Décoder la chaîne base64
  const byteString = atob(base64);

  // Convertir la chaîne base64 en tableau d'octets
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  // Remplir le tableau d'octets
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  // Créer le Blob avec le type MIME approprié
  return new Blob([uint8Array], { type: 'image/png' });
}





    startImageDrag(event: MouseEvent, image: any) {
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const origX = image.x;
      const origY = image.y;

      const move = (e: MouseEvent) => {
        image.x = origX + (e.clientX - startX);
        image.y = origY + (e.clientY - startY);
      };

      const stop = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', stop);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', stop);
    }

    get selectedZone(): TextZone | undefined {
      return this.textZones.find(z => z.id === this.selectedZoneId || 0);
    }

    showAddReference: boolean = false;

addReference() {
  const trimmed = this.newReference.trim();
  if (trimmed && !this.referenceOptions.includes(trimmed)) {
    this.referenceOptions.push(trimmed);
    this.selectedZone!.reference = trimmed;
  }
  this.newReference = '';
  this.showAddReference = false;
}

cancelAddReference() {
  this.newReference = '';
  this.showAddReference = false;
}


}

