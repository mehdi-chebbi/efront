import { Component, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import jwt_decode from 'jwt-decode';
import { ForumService } from 'src/services/forum.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-formatrices',
  templateUrl: './formatrices.component.html',
  styleUrls: ['./formatrices.component.css']
})

export class FormatricesComponent {
  @ViewChild('editModal') editModalRef!: ElementRef;

  @ViewChildren('topicCard') topicCards!: QueryList<ElementRef>;

  topics: any[] = [];
  AlltopicsPost: { [key: string]: any[] } = {};

  user : any ={} ;
  activeTab = 'all';
  newTopicForm: FormGroup;
  isModalOpen = false;

  currentPage: number = 1;
  itemsPerPage: number = 2; // Nombre d'éléments par page
  paginatedTopics: any[] = [];
  totalPages: number = 1;
  constructor(
    private forumService: ForumService,
    private fb: FormBuilder,
    private userService : UserServiceService
  ) {
    this.newTopicForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      tags: ['']
    });
  }
  showAllPosts: boolean = false;




  ngOnInit(): void {
      const token = localStorage.getItem('authToken');  // Exemple avec localStorage

          if (token) {
            // Décoder le token pour extraire l'ID utilisateur
            const decodedToken: any = jwt_decode(token);  // Use the decoded token function
            const userId = decodedToken.userId;  // Assurez-vous que 'userId' est la clé dans votre token

            // Utiliser le service pour récupérer les détails de l'utilisateur
            this.userService.getUserDetails(userId).subscribe((data: any) => {
              this.user = data;
            });
          } else {
            console.error('Token non trouvé');
          }

         this.loadTopics()


  }

  ngAfterViewInit(): void {
    this.paginatedTopics.forEach(topic => {
      setTimeout(() => {
        this.incrementViews(topic._id);
      }, 1000);
    });

    this.setupIntersectionObserver();
  }
  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const topicId = entry.target.getAttribute('data-topic-id');
          this.incrementViews(topicId);
          observer.unobserve(entry.target); // Ne plus observer après la première vue
        }
      });
    }, {
      threshold: 0.5 // 50% de l'élément visible
    });

    this.topicCards.forEach(card => {
      observer.observe(card.nativeElement);
    });
  }

  private incrementViews(topicId: any): void {
    this.forumService.incrementTopicViews(topicId,this.user._id).subscribe({
      next: (updatedTopic) => {
        const topicIndex = this.paginatedTopics.findIndex(t => t._id === topicId);
        if (topicIndex !== -1) {
          this.paginatedTopics[topicIndex].views = updatedTopic.views;
        }
      },
      error: (err) => console.error('Failed to increment views', err)
    });
  }

  trackById(index: number, topic: any): string {
    return topic._id;
  }


  searchQuery: string = '';
  originalTopics: any[] = [];

  sortOption: string = 'newest';
  isSearching: boolean = false;

  // Méthode de recherche
  searchTopics(): void {
    if (this.searchQuery.trim() === '') {
      // Si la recherche est vide, on restaure les topics originaux
      this.topics = [...this.originalTopics];
      this.isSearching = false;
    } else {
      // Filtrage des topics
      const query = this.searchQuery.toLowerCase();
      this.topics = this.originalTopics.filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        topic.content.toLowerCase().includes(query) ||
        (topic.tags && topic.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
      this.isSearching = true;
    }

    // Réinitialiser la pagination
    this.currentPage = 1;
    this.updatePaginatedTopics();
  }

  // Méthode de tri
  sortTopics(): void {
    switch (this.sortOption) {
      case 'newest':
        this.topics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        this.topics.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case 'unanswered':
        this.topics.sort((a, b) => {
          const aPosts = this.AlltopicsPost[a._id]?.length || 0;
          const bPosts = this.AlltopicsPost[b._id]?.length || 0;
          return aPosts - bPosts;
        });
        break;
    }

    this.updatePaginatedTopics();
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.searchTopics();
  }

  getUnansweredCount(): number {
    return this.originalTopics.filter(t => !this.AlltopicsPost[t._id]?.length).length;
  }

  getSolvedCount(): number {
    return this.originalTopics.filter(t => t.isSolved).length;
  }
  markassolution(post:any):void {
     this.forumService.markAsSolution(post._id).subscribe()
  }

  // Modifiez loadTopics pour inclure le tri initial
  loadTopics(): void {
    this.forumService.getAllTopics().subscribe(
      (topics) => {
        this.topics = topics;
        this.originalTopics = [...topics];
        this.sortTopics(); // Applique le tri initial
        this.totalPages = Math.ceil(this.topics.length / this.itemsPerPage);
        this.updatePaginatedTopics();

        // Chargement des posts
        this.topics.forEach((topic) => {
          this.forumService.getAllPostsByTopicId(topic._id).subscribe(
            (posts) => {
              this.AlltopicsPost[topic._id] = posts;
               // Si on est sur l'onglet "Sans réponse", mettons à jour le filtre
            if (this.activeTab === 'unanswered') {
              this.changeTab('unanswered');
            }
            },
            (error) => {
              console.error(`Error loading posts for topic ${topic._id}:`, error);
            }
          );
        });
      },
      (error) => {
        console.error('Error loading topics:', error);
      }
    );
  }

  updatePaginatedTopics(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTopics = this.topics.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTopics();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

// Dans votre classe component

// Dans votre fichier component.ts


  createTopic(): void {
    if (this.newTopicForm.valid) {
      const topicData = {
        title: this.newTopicForm.value.title,
        content: this.newTopicForm.value.content,

        author : this.user._id ,
        tags: this.newTopicForm.value.tags
      };

      this.forumService.createTopic(topicData).subscribe({
        next: (newTopic) => {
          this.topics.unshift(newTopic); // Ajoute le nouveau sujet au début
          this.closeModal();
          this.newTopicForm.reset();
          window.location.reload()
        },
        error: (err) => {
          console.error('Error creating topic:', err);
        }
      });
    }
  }

  addPostToTopic(topicId: string, content: string): void {
    this.forumService.addPostToTopic(topicId, { content }).subscribe({
      next: (updatedTopic) => {
        // Mettre à jour le sujet dans la liste
        const index = this.topics.findIndex(t => t._id === topicId);
        if (index !== -1) {
          this.topics[index] = updatedTopic;
        }
      window.location.reload();
      },
      error: (err) => {
        console.error('Error adding post:', err);
      }
    });
  }

  markAsSolution(topicId: string, postId: string): void {
    this.forumService.markAsSolution(postId).subscribe({
      next: (updatedTopic) => {
        // Mettre à jour le sujet dans la liste
        const index = this.topics.findIndex(t => t._id === topicId);
        if (index !== -1) {
          this.topics[index] = updatedTopic;
        }
      },
      error: (err) => {
        console.error('Error marking as solution:', err);
      }
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }



  // Modifiez la méthode changeTab
  changeTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1; // Réinitialiser la pagination

    switch (tab) {
      case 'all':
        this.topics = [...this.originalTopics];
        break;
      case 'popular':
        this.topics = [...this.originalTopics].sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case 'unanswered':
        this.topics = this.originalTopics.filter(topic =>
          !this.AlltopicsPost[topic._id] || this.AlltopicsPost[topic._id].length === 0
        );
        break;
      case 'solved':
        this.topics = this.originalTopics.filter(topic => topic.isSolved);
        break;
    }

    // Appliquer la recherche si elle est active
    if (this.searchQuery.trim() !== '') {
      this.searchTopics();
    } else {
      this.updatePaginatedTopics();
    }
  }

  newPostContent: string = '';

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Fichier sélectionné:', file.name);
      // Traitez le fichier ici (upload, prévisualisation, etc.)
    }
  }
  addPost(idTopic: any) {
    if (!this.newPostContent.trim()) return;

    const postData = {
      content: this.newPostContent,
      id: this.user._id
    };

    // Créez un objet post temporaire pour l'affichage immédiat
    const tempPost = {
      _id: 'temp-' + Date.now(), // ID temporaire
      content: this.newPostContent,
      author: {
        nom: this.user.nom, // ou les données de l'utilisateur connecté
        prenom: this.user.prenom,
        photo: this.user.photo
      },
      createdAt: new Date(),
      isTemp: true // Marqueur pour les posts temporaires
    };
    console.log("helle ",tempPost)

    // Ajoutez le post temporaire à la liste
    if (!this.AlltopicsPost[idTopic]) {
      this.AlltopicsPost[idTopic] = [];
    }
    this.AlltopicsPost[idTopic].unshift(tempPost); // Ajoute au début
    this.newPostContent = ''; // Réinitialise le champ
window.location.reload();
    this.forumService.addPostToTopic(idTopic, postData).subscribe({
      next: (response) => {
        console.log('Post ajouté avec succès', response);

        // Remplace le post temporaire par la vraie réponse du serveur
        const index = this.AlltopicsPost[idTopic].findIndex((p: { _id: string; }) => p._id === tempPost._id);
        if (index !== -1) {
          this.AlltopicsPost[idTopic][index] = {
            ...response.post, // La réponse du serveur
            author: tempPost.author // Garde les infos d'auteur
          };
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du post', err);
        // Supprime le post temporaire en cas d'erreur
        this.AlltopicsPost[idTopic] = this.AlltopicsPost[idTopic].filter((p: { _id: string; }) => p._id !== tempPost._id);
      }
    });
  }


// Ajoutez cette propriété à votre classe
private viewedTopics = new Set<string>(); // Pour garder trace des topics déjà vus

navigateToTopic(topicId: string): void {
  // Vérifier si l'utilisateur a déjà vu ce topic
  if (this.viewedTopics.has(topicId)) {
    return; // Ne rien faire si déjà vu
  }

  // Marquer le topic comme vu
  this.viewedTopics.add(topicId);

  // Appel au service pour incrémenter les vues
  this.forumService.incrementTopicViews(topicId,this.user._id).subscribe({
    next: (updatedTopic) => {
      // Mettre à jour localement le nombre de vues
      const topicIndex = this.paginatedTopics.findIndex(t => t._id === topicId);
      if (topicIndex !== -1) {
        this.paginatedTopics[topicIndex].views = updatedTopic.views;
      }
    },
    error: (err) => {
      console.error('Failed to increment views', err);
      // Si erreur, retirer le topic du Set pour permettre une nouvelle tentative
      this.viewedTopics.delete(topicId);
    }
  });
}


onDelete(topic: any): void {
   this.forumService.deleteForumTopic(topic._id).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie', response);
        window.location.reload();
      }
    })
}
onDeletePost(topic: any,post:any): void {
   this.forumService. deletePost(topic._id,post._id).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie', response);
        window.location.reload();
      }
    })
}

selectedTopic: any = {};

openEditModal(topic: any): void {
  this.selectedTopic = { ...topic }; // Cloner pour éviter la modif directe
  const modalElement = document.getElementById('editTopicModal');
  if (modalElement) {
 const modal = new Modal(this.editModalRef.nativeElement);
    modal.show();
  }
}

updateTopic(): void {
    const updatedData = {
      title: this.selectedTopic.title,
      content: this.selectedTopic.content
    };

    this.forumService.updateTopic(this.selectedTopic._id, updatedData).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie', response);

        // Fermer le modal
        const modal = Modal.getInstance(this.editModalRef.nativeElement);
        modal?.hide();
        window.location.reload();

        // Optionnel : afficher une alerte ou recharger les données
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
      }
    });
  }



}
