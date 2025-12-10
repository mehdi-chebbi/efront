import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailQuizComponent } from './detail-quiz.component';

describe('DetailQuizComponent', () => {
  let component: DetailQuizComponent;
  let fixture: ComponentFixture<DetailQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailQuizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
