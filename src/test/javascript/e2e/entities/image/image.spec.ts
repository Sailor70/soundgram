import { browser, ExpectedConditions as ec, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { ImageComponentsPage, ImageDeleteDialog, ImageUpdatePage } from './image.page-object';

const expect = chai.expect;

describe('Image e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let imageComponentsPage: ImageComponentsPage;
  let imageUpdatePage: ImageUpdatePage;
  let imageDeleteDialog: ImageDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing('admin', 'admin');
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load Images', async () => {
    await navBarPage.goToEntity('image');
    imageComponentsPage = new ImageComponentsPage();
    await browser.wait(ec.visibilityOf(imageComponentsPage.title), 5000);
    expect(await imageComponentsPage.getTitle()).to.eq('soundgramApp.image.home.title');
  });

  it('should load create Image page', async () => {
    await imageComponentsPage.clickOnCreateButton();
    imageUpdatePage = new ImageUpdatePage();
    expect(await imageUpdatePage.getPageTitle()).to.eq('soundgramApp.image.home.createOrEditLabel');
    await imageUpdatePage.cancel();
  });

  it('should create and save Images', async () => {
    const nbButtonsBeforeCreate = await imageComponentsPage.countDeleteButtons();

    await imageComponentsPage.clickOnCreateButton();
    await promise.all([imageUpdatePage.setPathInput('path'), imageUpdatePage.setNameInput('name'), imageUpdatePage.postSelectLastOption()]);
    expect(await imageUpdatePage.getPathInput()).to.eq('path', 'Expected Path value to be equals to path');
    expect(await imageUpdatePage.getNameInput()).to.eq('name', 'Expected Name value to be equals to name');
    await imageUpdatePage.save();
    expect(await imageUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await imageComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last Image', async () => {
    const nbButtonsBeforeDelete = await imageComponentsPage.countDeleteButtons();
    await imageComponentsPage.clickOnLastDeleteButton();

    imageDeleteDialog = new ImageDeleteDialog();
    expect(await imageDeleteDialog.getDialogTitle()).to.eq('soundgramApp.image.delete.question');
    await imageDeleteDialog.clickOnConfirmButton();

    expect(await imageComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
