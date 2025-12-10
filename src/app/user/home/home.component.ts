import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { firstValueFrom } from 'rxjs';
import { AnalyseSentiementsService } from 'src/services/analyse-sentiements.service';
import { AvisService } from 'src/services/avis.service';
import { ChatbotService } from 'src/services/chatbot.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
@ViewChild('chatMessages') chatMessages!: ElementRef;
@ViewChild('userInput') userInput!: ElementRef;

  user: any = {};
  avisList: any[]=[];

  constructor(private userService: UserServiceService,private analyseService: AnalyseSentiementsService,private avisService : AvisService, private router: Router,private chatbotService: ChatbotService) {}


ngAfterViewChecked() {
  this.scrollToBottom();
}
ngAfterViewInit(): void {
    this.addMessage('bot', `Bonjour ! Je suis un expert en environnement africain. Posez-moi vos questions sur : climat, eau, biodiversité ou les activités de l'Observatoire du Sahara et du Sahel (OSS) en Tunisie.`);
  }


toggleChatbot(): void {
    this.isOpen = !this.isOpen;

    // Optionnel : focus automatique dans l'input à l'ouverture
    if (this.isOpen) {
      setTimeout(() => this.userInput.nativeElement.focus(), 0);
    }
  }

addMessage(sender: 'user' | 'bot', text: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement('div');
    div.className = `message ${sender}-message`;

    // Aligner le bloc selon l'expéditeur
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = sender === 'user' ? 'flex-end' : 'flex-start';
    div.style.margin = '5px 0';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.backgroundColor = sender === 'user' ? '#DCF8C6' : '#E6E6E6';
    messageContent.style.padding = '8px 12px';
    messageContent.style.borderRadius = '10px';
    messageContent.style.maxWidth = '70%';
    messageContent.style.display = 'inline-block';
    messageContent.innerText = text;

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.style.fontSize = '0.75rem';
    timestamp.style.color = '#888';
    timestamp.innerText = time;

    div.appendChild(messageContent);
    div.appendChild(timestamp);

    this.chatMessages.nativeElement.appendChild(div);
    this.scrollToBottom();
}


  async sendMessage(event?: Event): Promise<void> {
    if (event) event.preventDefault();

    const input = this.userInput.nativeElement;
    const message = input.value.trim();

    if (!message) return;

    this.addMessage('user', message);
    input.value = '';

    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.textContent = 'Expert rédige une réponse...';
    this.chatMessages.nativeElement.appendChild(typing);
    this.scrollToBottom();

    try {
      const data = await firstValueFrom(this.chatbotService.sendMessage(message));
      this.chatMessages.nativeElement.removeChild(typing);
      this.addMessage('bot', data.response || "Désolé, je n'ai pas compris la réponse.");
    } catch (error) {
      this.chatMessages.nativeElement.removeChild(typing);
      this.addMessage('bot', '❌ Erreur de connexion. Vérifie que le serveur Flask fonctionne et qu’il n’y a pas de blocage CORS.');
      console.error('Chatbot error:', error);
    }
  }

  sendSuggestion(text: string): void {
    this.userInput.nativeElement.value = text;
    this.sendMessage();
  }

  private scrollToBottom(): void {
     try {
    this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
  } catch(err) { }
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken"); // Suppression du token stocké
        this.router.navigate(["/user/auth"]); // Redirection après déconnexion
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }
    isOpen = false;



   ngOnInit(): void {
      // Récupérer le token depuis localStorage (ou sessionStorage, selon votre choix)
      const token = localStorage.getItem('authToken');  // Exemple avec localStorage

      if (token) {
        // Décoder le token pour extraire l'ID utilisateur
        const decodedToken: any = jwt_decode(token);  // Use the decoded token function
        const userId = decodedToken.userId;  // Assurez-vous que 'userId' est la clé dans votre token

        // Utiliser le service pour récupérer les détails de l'utilisateur
        this.userService.getUserDetails(userId).subscribe((data) => {
          this.user = data;
        });
      } else {
        console.error('Token non trouvé');
      }

      this.loadAvis()
      this.avisService.getManyFormations(100);
    }

    loadAvis(): void {

      this.avisService.getAvis().subscribe({
        next: (res: any) => {
          this.avisList = res.data;
          console.log(this.avisList)
        },
        error: err => {
          console.error("Erreur lors du chargement des avis", err);
        }
      });
    }




}
