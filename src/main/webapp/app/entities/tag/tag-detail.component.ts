import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITag } from 'app/shared/model/tag.model';
import { PostService } from 'app/entities/post/post.service';
import { IPost } from 'app/shared/model/post.model';
import { TagService } from 'app/entities/tag/tag.service';
import { JhiParseLinks } from 'ng-jhipster';
import { ITEMS_PER_PAGE_POST_OBJ } from 'app/shared/constants/pagination.constants';

@Component({
  selector: 'jhi-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['tag.scss']
})
export class TagDetailComponent implements OnInit {
  tag: ITag;
  allTagPosts: IPost[] = [];
  paginatedPosts: IPost[] = [];

  itemsPerPage: number;
  links: any;
  page: any;
  totalItems: number;

  constructor(
    protected activatedRoute: ActivatedRoute,
    private postService: PostService,
    private tagService: TagService,
    protected parseLinks: JhiParseLinks
  ) {
    this.allTagPosts = [];
    this.paginatedPosts = [];
    this.itemsPerPage = ITEMS_PER_PAGE_POST_OBJ;
    this.page = 0;
    this.links = {
      last: 0
    };
  }

  ngOnInit() {
    this.allTagPosts = [];
    this.paginatedPosts = [];
    this.activatedRoute.data.subscribe(({ tag }) => {
      this.tag = tag;
      this.loadTagPosts();
    });
  }

  loadTagPosts() {
    this.postService.query().subscribe(res => {
      this.allTagPosts = [];
      const allPosts = res.body;
      for (const post of allPosts) {
        if (post.tags) {
          for (const postTag of post.tags) {
            if (this.tag.name === postTag.name) {
              this.allTagPosts.push(post);
              break;
            }
          }
        }
      }
      this.links = { last: this.allTagPosts.length / this.itemsPerPage };
      this.sortPostsByDate();
    });
  }

  pushPostsToPaginatedPosts(page: number) {
    // paginates previously sorted posts
    for (let i = 0; i < this.itemsPerPage; i++) {
      if (this.allTagPosts[page * this.itemsPerPage + i]) {
        this.paginatedPosts.push(this.allTagPosts[page * this.itemsPerPage + i]);
      }
    }
  }

  sortPostsByDate() {
    // sorts all tag posts
    this.allTagPosts.sort((a: IPost, b: IPost) => {
      return b.date.toDate().getTime() - a.date.toDate().getTime(); // sorts them descending (latest dates first)
    });
    this.pushPostsToPaginatedPosts(this.page);
  }

  loadPage(page) {
    this.page = page;
    this.pushPostsToPaginatedPosts(page);
  }

  followThisTag() {
    this.tagService.addUserToTag(this.tag).subscribe(res => {
      this.tag = res.body;
    });
  }

  previousState() {
    window.history.back();
  }
}
