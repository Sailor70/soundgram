import { browser, ExpectedConditions as ec, protractor, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { FollowedUserComponentsPage, FollowedUserDeleteDialog, FollowedUserUpdatePage } from './followed-user.page-object';

const expect = chai.expect;

describe('FollowedUser e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let followedUserComponentsPage: FollowedUserComponentsPage;
  let followedUserUpdatePage: FollowedUserUpdatePage;
  let followedUserDeleteDialog: FollowedUserDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing('admin', 'admin');
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load FollowedUsers', async () => {
    await navBarPage.goToEntity('followed-user');
    followedUserComponentsPage = new FollowedUserComponentsPage();
    await browser.wait(ec.visibilityOf(followedUserComponentsPage.title), 5000);
    expect(await followedUserComponentsPage.getTitle()).to.eq('soundgramApp.followedUser.home.title');
  });

  it('should load create FollowedUser page', async () => {
    await followedUserComponentsPage.clickOnCreateButton();
    followedUserUpdatePage = new FollowedUserUpdatePage();
    expect(await followedUserUpdatePage.getPageTitle()).to.eq('soundgramApp.followedUser.home.createOrEditLabel');
    await followedUserUpdatePage.cancel();
  });

  it('should create and save FollowedUsers', async () => {
    const nbButtonsBeforeCreate = await followedUserComponentsPage.countDeleteButtons();

    await followedUserComponentsPage.clickOnCreateButton();
    await promise.all([
      followedUserUpdatePage.setFollowedUserIdInput('5'),
      followedUserUpdatePage.setDateFollowedInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
      followedUserUpdatePage.userSelectLastOption()
    ]);
    expect(await followedUserUpdatePage.getFollowedUserIdInput()).to.eq('5', 'Expected followedUserId value to be equals to 5');
    expect(await followedUserUpdatePage.getDateFollowedInput()).to.contain(
      '2001-01-01T02:30',
      'Expected dateFollowed value to be equals to 2000-12-31'
    );
    await followedUserUpdatePage.save();
    expect(await followedUserUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await followedUserComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last FollowedUser', async () => {
    const nbButtonsBeforeDelete = await followedUserComponentsPage.countDeleteButtons();
    await followedUserComponentsPage.clickOnLastDeleteButton();

    followedUserDeleteDialog = new FollowedUserDeleteDialog();
    expect(await followedUserDeleteDialog.getDialogTitle()).to.eq('soundgramApp.followedUser.delete.question');
    await followedUserDeleteDialog.clickOnConfirmButton();

    expect(await followedUserComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
