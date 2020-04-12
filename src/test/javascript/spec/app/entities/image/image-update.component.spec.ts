import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { SoundgramTestModule } from '../../../test.module';
import { ImageUpdateComponent } from 'app/entities/image/image-update.component';
import { ImageService } from 'app/entities/image/image.service';

describe('Component Tests', () => {
  describe('Image Management Update Component', () => {
    let comp: ImageUpdateComponent;
    let fixture: ComponentFixture<ImageUpdateComponent>;
    let service: ImageService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [ImageUpdateComponent],
        providers: [FormBuilder]
      })
        .overrideTemplate(ImageUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(ImageUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(ImageService);
    });
    // this component is not in use
    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        /*        const entity = new Image(123);
        spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async*/
        // THEN
        // expect(service.update).toHaveBeenCalledWith(entity);
        // expect(comp.isSaving).toEqual(false);
      }));

      it('Should call create service on save for new entity', fakeAsync(() => {
        // GIVEN
        /*        const entity = new Image();
        spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async*/
        // THEN
        // expect(service.create).toHaveBeenCalledWith(entity);
        // expect(comp.isSaving).toEqual(false);
      }));
    });
  });
});
