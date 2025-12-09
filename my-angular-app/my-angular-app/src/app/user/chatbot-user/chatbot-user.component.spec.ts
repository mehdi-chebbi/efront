import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotUserComponent } from './chatbot-user.component';

describe('ChatbotUserComponent', () => {
  let component: ChatbotUserComponent;
  let fixture: ComponentFixture<ChatbotUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
