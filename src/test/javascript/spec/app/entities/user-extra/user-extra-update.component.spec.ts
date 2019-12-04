import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { SoundgramTestModule } from '../../../test.module';
import { UserExtraUpdateComponent } from 'app/entities/user-extra/user-extra-update.component';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { UserExtra } from 'app/shared/model/user-extra.model';

describe('Component Tests', () => {
  describe('UserExtra Management Update Component', () => {
    let comp: UserExtraUpdateComponent;
    let fixture: ComponentFixture<UserExtraUpdateComponent>;
    let service: UserExtraService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [UserExtraUpdateComponent],
        providers: [FormBuilder]
      })
        .overrideTemplate(UserExtraUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(UserExtraUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(UserExtraService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new UserExtra(123);
        spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.update).toHaveBeenCalledWith(entity);
        expect(comp.isSaving).toEqual(false);
      }));

      it('Should call create service on save for new entity', fakeAsync(() => {
        // GIVEN
        const entity = new UserExtra();
        spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.create).toHaveBeenCalledWith(entity);
        expect(comp.isSaving).toEqual(false);
      }));
    });
  });
});
