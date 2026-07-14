import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for /staff-fields-main.html */
export class StaffFieldsPage extends BasePage {
  readonly fieldsList: Locator;
  readonly staffList: Locator;
  readonly animalsList: Locator;
  readonly totalFields: Locator;
  readonly totalStaff: Locator;
  readonly totalAnimals: Locator;
  readonly totalArea: Locator;
  readonly addFieldButton: Locator;
  readonly addStaffButton: Locator;
  readonly addAnimalButton: Locator;
  readonly addFieldModal: Locator;
  readonly addStaffModal: Locator;
  readonly fieldNameInput: Locator;
  readonly fieldAreaInput: Locator;
  readonly staffNameInput: Locator;
  readonly staffSurnameInput: Locator;
  readonly staffAgeInput: Locator;

  constructor(page: Page) {
    super(page);
    this.fieldsList      = page.locator('#fieldsList');
    this.staffList       = page.locator('#staffList');
    this.animalsList     = page.locator('#animalsList');
    this.totalFields     = page.locator('#totalFields');
    this.totalStaff      = page.locator('#totalStaff');
    this.totalAnimals    = page.locator('#totalAnimals');
    this.totalArea       = page.locator('#totalArea');
    this.addFieldButton  = page.locator('#openAddFieldModal');
    this.addStaffButton  = page.locator('#openAddStaffModal');
    this.addAnimalButton = page.locator('#openAddAnimalModal');
    this.addFieldModal   = page.locator('#addFieldModal');
    this.addStaffModal   = page.locator('#addStaffModal');
    this.fieldNameInput  = page.locator('#fieldName');
    this.fieldAreaInput  = page.locator('#fieldArea');
    this.staffNameInput    = page.locator('#staffName');
    this.staffSurnameInput = page.locator('#staffSurname');
    this.staffAgeInput     = page.locator('#staffAge');
  }

  async goto(): Promise<void> {
    await this.navigate('/staff-fields-main.html');
    await this.page.waitForSelector('#fieldsList');
  }

  async waitForFieldsLoaded(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const list = document.getElementById('fieldsList');
        return list !== null && list.children.length > 0;
      },
      { timeout: 10_000 },
    );
  }
}
