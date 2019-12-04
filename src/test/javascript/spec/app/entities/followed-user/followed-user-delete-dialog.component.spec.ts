import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { SoundgramTestModule } from '../../../test.module';
import { FollowedUserDeleteDialogComponent } from 'app/entities/followed-user/followed-user-delete-dialog.component';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';

describe('Component Tests', () => {
  describe('FollowedUser Management Delete Component', () => {
    let comp: FollowedUserDeleteDialogComponent;
    let fixture: ComponentFixture<FollowedUserDeleteDialogComponent>;
    let service: FollowedUserService;
    let mockEventManager: any;
    let mockActiveModal: any;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [FollowedUserDeleteDialogComponent]
      })
        .overrideTemplate(FollowedUserDeleteDialogComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(FollowedUserDeleteDialogComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(FollowedUserService);
      mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
      mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
    });

    describe('confirmDelete', () => {
      it('Should call delete service on confirmDelete', inject(
        [],
        fakeAsync(() => {
          // GIVEN
          spyOn(service, 'delete').and.returnValue(of({}));

          // WHEN
          comp.confirmDelete(123);
          tick();

          // THEN
          expect(service.delete).toHaveBeenCalledWith(123);
          expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
          expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
        })
      ));
    });
  });
});
