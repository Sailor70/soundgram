import { element, by, ElementFinder } from 'protractor';

export class FollowedUserComponentsPage {
  createButton = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('jhi-followed-user div table .btn-danger'));
  title = element.all(by.css('jhi-followed-user div h2#page-heading span')).first();

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

export class FollowedUserUpdatePage {
  pageTitle = element(by.id('jhi-followed-user-heading'));
  saveButton = element(by.id('save-entity'));
  cancelButton = element(by.id('cancel-save'));
  followedUserIdInput = element(by.id('field_followedUserId'));
  dateFollowedInput = element(by.id('field_dateFollowed'));
  userSelect = element(by.id('field_user'));

  async getPageTitle() {
    return this.pageTitle.getAttribute('jhiTranslate');
  }

  async setFollowedUserIdInput(followedUserId) {
    await this.followedUserIdInput.sendKeys(followedUserId);
  }

  async getFollowedUserIdInput() {
    return await this.followedUserIdInput.getAttribute('value');
  }

  async setDateFollowedInput(dateFollowed) {
    await this.dateFollowedInput.sendKeys(dateFollowed);
  }

  async getDateFollowedInput() {
    return await this.dateFollowedInput.getAttribute('value');
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

export class FollowedUserDeleteDialog {
  private dialogTitle = element(by.id('jhi-delete-followedUser-heading'));
  private confirmButton = element(by.id('jhi-confirm-delete-followedUser'));

  async getDialogTitle() {
    return this.dialogTitle.getAttribute('jhiTranslate');
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}
