import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { SoundgramTestModule } from '../../../test.module';
import { FollowedUserComponent } from 'app/entities/followed-user/followed-user.component';
import { FollowedUserService } from 'app/entities/followed-user/followed-user.service';
import { FollowedUser } from 'app/shared/model/followed-user.model';

describe('Component Tests', () => {
  describe('FollowedUser Management Component', () => {
    let comp: FollowedUserComponent;
    let fixture: ComponentFixture<FollowedUserComponent>;
    let service: FollowedUserService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [FollowedUserComponent],
        providers: []
      })
        .overrideTemplate(FollowedUserComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(FollowedUserComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(FollowedUserService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new FollowedUser(123)],
            headers
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.followedUsers[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
