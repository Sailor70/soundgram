import { element, by, ElementFinder } from 'protractor';

export class UserExtraComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-user-extra div table .btn-danger'));
  title = element.all(by.css('jhi-user-extra div h2#page-heading span')).first();

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

export class UserExtraUpdatePage {
  pageTitle = element(by.id('jhi-user-extra-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));
  userLocationInput = element(by.id('field_userLocation'));
  bioInput = element(by.id('field_bio'));
  userSelect = element(by.id('field_user'));

  async getPageTitle() {
    return this.pageTitle.getAttribute('jhiTranslate');
  }

  async setUserLocationInput(userLocation) {
    await this.userLocationInput.sendKeys(userLocation);
  }

  async getUserLocationInput() {
    return await this.userLocationInput.getAttribute('value');
  }

  async setBioInput(bio) {
    await this.bioInput.sendKeys(bio);
  }

  async getBioInput() {
    return await this.bioInput.getAttribute('value');
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

export class UserExtraDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-userExtra-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-userExtra'));

  async getDialogTitle() {
    return this.dialogTitle.getAttribute('jhiTranslate');
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}
