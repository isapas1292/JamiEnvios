import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingSearch } from './tracking-search';

describe('TrackingSearch', () => {
  let component: TrackingSearch;
  let fixture: ComponentFixture<TrackingSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
