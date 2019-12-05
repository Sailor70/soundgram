import { browser, ExpectedConditions as ec, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { AudioFileComponentsPage, AudioFileDeleteDialog, AudioFileUpdatePage } from './audio-file.page-object';

const expect = chai.expect;

describe('AudioFile e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let audioFileComponentsPage: AudioFileComponentsPage;
  let audioFileUpdatePage: AudioFileUpdatePage;
  let audioFileDeleteDialog: AudioFileDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing('admin', 'admin');
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load AudioFiles', async () => {
    await navBarPage.goToEntity('audio-file');
    audioFileComponentsPage = new AudioFileComponentsPage();
    await browser.wait(ec.visibilityOf(audioFileComponentsPage.title), 5000);
    expect(await audioFileComponentsPage.getTitle()).to.eq('soundgramApp.audioFile.home.title');
  });

  it('should load create AudioFile page', async () => {
    await audioFileComponentsPage.clickOnCreateButton();
    audioFileUpdatePage = new AudioFileUpdatePage();
    expect(await audioFileUpdatePage.getPageTitle()).to.eq('soundgramApp.audioFile.home.createOrEditLabel');
    await audioFileUpdatePage.cancel();
  });

  it('should create and save AudioFiles', async () => {
    const nbButtonsBeforeCreate = await audioFileComponentsPage.countDeleteButtons();

    await audioFileComponentsPage.clickOnCreateButton();
    await promise.all([
      audioFileUpdatePage.setAudioPathInput('audioPath'),
      audioFileUpdatePage.setTitleInput('title'),
      audioFileUpdatePage.setIconPathInput('iconPath'),
      audioFileUpdatePage.postSelectLastOption()
      // audioFileUpdatePage.userSelectLastOption(),
    ]);
    expect(await audioFileUpdatePage.getAudioPathInput()).to.eq('audioPath', 'Expected AudioPath value to be equals to audioPath');
    expect(await audioFileUpdatePage.getTitleInput()).to.eq('title', 'Expected Title value to be equals to title');
    expect(await audioFileUpdatePage.getIconPathInput()).to.eq('iconPath', 'Expected IconPath value to be equals to iconPath');
    await audioFileUpdatePage.save();
    expect(await audioFileUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await audioFileComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last AudioFile', async () => {
    const nbButtonsBeforeDelete = await audioFileComponentsPage.countDeleteButtons();
    await audioFileComponentsPage.clickOnLastDeleteButton();

    audioFileDeleteDialog = new AudioFileDeleteDialog();
    expect(await audioFileDeleteDialog.getDialogTitle()).to.eq('soundgramApp.audioFile.delete.question');
    await audioFileDeleteDialog.clickOnConfirmButton();

    expect(await audioFileComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
