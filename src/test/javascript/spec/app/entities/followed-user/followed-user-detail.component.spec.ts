import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SoundgramTestModule } from '../../../test.module';
import { FollowedUserDetailComponent } from 'app/entities/followed-user/followed-user-detail.component';
import { FollowedUser } from 'app/shared/model/followed-user.model';

describe('Component Tests', () => {
  describe('FollowedUser Management Detail Component', () => {
    let comp: FollowedUserDetailComponent;
    let fixture: ComponentFixture<FollowedUserDetailComponent>;
    const route = ({ data: of({ followedUser: new FollowedUser(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [SoundgramTestModule],
        declarations: [FollowedUserDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }]
      })
        .overrideTemplate(FollowedUserDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(FollowedUserDetailComponent);
      comp = fixture.componentInstance;
    });

    describe('OnInit', () => {
      it('Should call load all on init', () => {
        // GIVEN

        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.followedUser).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });
  });
});
