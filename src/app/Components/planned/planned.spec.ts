import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planned } from './planned';

describe('Planned', () => {
  let component: Planned;
  let fixture: ComponentFixture<Planned>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planned]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planned);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
