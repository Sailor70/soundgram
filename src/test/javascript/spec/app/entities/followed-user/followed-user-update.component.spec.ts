import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { SoundgramTestModule } from '../../../test.module';
import { FollowedUserUpdateComponent } from 'app/entities/followed-user/followed-user-update.component';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';
import { FollowedUser } from 'app/shared/model/followed-user.model';

describe('Component Tests', () => {
  describe('FollowedUser Management Update Component', () => {
    let comp: FollowedUserUpdateComponent;
    let fixture: ComponentFixture<FollowedUserUpdateComponent>;
    let service: FollowedUserService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [FollowedUserUpdateComponent],
        providers: [FormBuilder]
      })
        .overrideTemplate(FollowedUserUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(FollowedUserUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(FollowedUserService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new FollowedUser(123);
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
        const entity = new FollowedUser();
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
