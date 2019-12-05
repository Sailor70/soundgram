import { element, by, ElementFinder } from 'protractor';

export class AudioFileComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-audio-file div table .btn-danger'));
  title = element.all(by.css('jhi-audio-file div h2#page-heading span')).first();

  async clickOnCreateButton() {
    await this.createButton.click();
  }

  async clickOnLastDeleteButton() {
    await this.deleteButtons.last().click();
  }

  async countDeleteButtons() {
    return this.deleteButtons.count();
  }

  async getTitle() {
    return this.title.getAttribute('jhiTranslate');
  }
}

export class AudioFileUpdatePage {
  pageTitle = element(by.id('jhi-audio-file-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));
  audioPathInput = element(by.id('field_audioPath'));
  titleInput = element(by.id('field_title'));
  iconPathInput = element(by.id('field_iconPath'));
  postSelect = element(by.id('field_post'));
  userSelect = element(by.id('field_user'));

  async getPageTitle() {
    return this.pageTitle.getAttribute('jhiTranslate');
  }

  async setAudioPathInput(audioPath) {
    await this.audioPathInput.sendKeys(audioPath);
  }

  async getAudioPathInput() {
    return await this.audioPathInput.getAttribute('value');
  }

  async setTitleInput(title) {
    await this.titleInput.sendKeys(title);
  }

  async getTitleInput() {
    return await this.titleInput.getAttribute('value');
  }

  async setIconPathInput(iconPath) {
    await this.iconPathInput.sendKeys(iconPath);
  }

  async getIconPathInput() {
    return await this.iconPathInput.getAttribute('value');
  }

  async postSelectLastOption() {
    await this.postSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async postSelectOption(option) {
    await this.postSelect.sendKeys(option);
  }

  getPostSelect(): ElementFinder {
    return this.postSelect;
  }

  async getPostSelectedOption() {
    return await this.postSelect.element(by.css('option:checked')).getText();
  }

  async userSelectLastOption() {
    await this.userSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async userSelectOption(option) {
    await this.userSelect.sendKeys(option);
  }

  getUserSelect(): ElementFinder {
    return this.userSelect;
  }

  async getUserSelectedOption() {
    return await this.userSelect.element(by.css('option:checked')).getText();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  getSaveButton(): ElementFinder {
    return this.saveButton;
  }
}

export class AudioFileDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-audioFile-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-audioFile'));

  async getDialogTitle() {
    return this.dialogTitle.getAttribute('jhiTranslate');
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}
