import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { SoundgramTestModule } from '../../../test.module';
import { UserExtraComponent } from 'app/entities/user-extra/user-extra.component';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { UserExtra } from 'app/shared/model/user-extra.model';

describe('Component Tests', () => {
  describe('UserExtra Management Component', () => {
    let comp: UserExtraComponent;
    let fixture: ComponentFixture<UserExtraComponent>;
    let service: UserExtraService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [UserExtraComponent],
        providers: []
      })
        .overrideTemplate(UserExtraComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(UserExtraComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(UserExtraService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new UserExtra(123)],
            headers
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.userExtras[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
