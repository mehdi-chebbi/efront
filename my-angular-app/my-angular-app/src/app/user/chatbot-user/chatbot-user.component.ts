import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ChatbotService } from 'src/services/chatbot.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chatbot-user',
  templateUrl: './chatbot-user.component.html',
  styleUrls: ['./chatbot-user.component.css']
})
export class ChatbotUserComponent implements AfterViewInit {

  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('userInput') userInput!: ElementRef;

  constructor(private chatbotService: ChatbotService) {}

  ngAfterViewInit(): void {
    this.addMessage('bot', `Bonjour ! Je suis un expert en environnement africain. Posez-moi vos questions sur : climat, eau, biodiversité ou les activités de l'Observatoire du Sahara et du Sahel (OSS) en Tunisie.`);
  }

  addMessage(sender: 'user' | 'bot', text: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement('div');
    div.className = `${sender}-message message`;
    div.innerHTML = `<div>${text}</div><div class="timestamp">${time}</div>`;

    this.chatMessages.nativeElement.appendChild(div);
    this.scrollToBottom();
  }

  async sendMessage(): Promise<void> {
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
    const el = this.chatMessages.nativeElement;
    el.scrollTop = el.scrollHeight;
  }
}
