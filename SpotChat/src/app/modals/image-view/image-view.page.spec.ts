import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImageViewPage } from './image-view.page';

describe('ImageViewPage', () => {
  let component: ImageViewPage;
  let fixture: ComponentFixture<ImageViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
