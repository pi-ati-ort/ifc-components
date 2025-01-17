import { FragmentsGroup } from "bim-fragment";
import { SimpleUIComponent } from "../../../ui/SimpleUIComponent";
import { Components } from "../../../core/Components";
import { UIManager } from "../../../ui/UIManager";
import { IfcPropertiesUtils } from "../../IfcPropertiesUtils";
import { IfcPropertiesProcessor } from "..";
import { IfcPropertiesManager } from "../../IfcPropertiesManager";

export class PropertyTag extends SimpleUIComponent<HTMLDivElement> {
  name = "PropertyTag";
  expressID = 0;
  model: FragmentsGroup;
  protected _propertiesProcessor: IfcPropertiesProcessor;

  get label() {
    return this.innerElements.label.textContent;
  }
  set label(value: string | null) {
    this.innerElements.label.textContent = value;
  }

  get value() {
    return this.innerElements.value.textContent;
  }
  set value(value: string | number | boolean | null) {
    this.innerElements.value.textContent = String(value);
  }

  innerElements: {
    label: HTMLParagraphElement;
    value: HTMLParagraphElement;
  };

  constructor(
    components: Components,
    propertiesProcessor: IfcPropertiesProcessor,
    model: FragmentsGroup,
    expressID: number
  ) {
    const template = `
    <div class="flex gap-x-2 hover:bg-ifcjs-120 py-1 px-3 rounded-md items-center min-h-[40px]">
      <div class="flex flex-col grow">
        <p id="label" class="${UIManager.Class.Label}"></p>
        <p id="value" class="text-base my-0"></p>
      </div> 
    </div> 
    `;

    super(components, template);

    this.innerElements = {
      label: this.getInnerElement("label") as HTMLParagraphElement,
      value: this.getInnerElement("value") as HTMLParagraphElement,
    };

    this.model = model;
    this.expressID = expressID;
    this._propertiesProcessor = propertiesProcessor;
    this.setInitialValues();
    this.setListeners();
  }

  async dispose(onlyChildren: boolean = false) {
    await super.dispose(onlyChildren);
    (this.model as any) = null;
    (this._propertiesProcessor as any) = null;
    if (Object.keys(this.innerElements).length) {
      this.innerElements.value.remove();
      this.innerElements.label.remove();
    }
  }

  protected setListeners() {
    const propertiesManager = this._propertiesProcessor.propertiesManager;
    if (!propertiesManager) return;

    const { properties } = IfcPropertiesManager.getIFCInfo(this.model);
    const { key: nameKey } = IfcPropertiesUtils.getEntityName(
      properties,
      this.expressID
    );
    const { key: valueKey } = IfcPropertiesUtils.getQuantityValue(
      properties,
      this.expressID
    );
    if (nameKey) {
      const event = propertiesManager.setAttributeListener(
        this.model,
        this.expressID,
        nameKey
      );
      event.add((v: String) => (this.label = v.toString()));
    }
    if (valueKey) {
      const event = propertiesManager.setAttributeListener(
        this.model,
        this.expressID,
        valueKey
      );
      event.add((v: any) => (this.value = v));
    }
  }

  protected setInitialValues() {
    const { properties } = IfcPropertiesManager.getIFCInfo(this.model);
    const entity = properties[this.expressID];
    if (!entity) {
      this.label = "NULL";
      this.value = `ExpressID ${this.expressID} not found`;
    } else {
      const { name } = IfcPropertiesUtils.getEntityName(
        properties,
        this.expressID
      );
      const { value } = IfcPropertiesUtils.getQuantityValue(
        properties,
        this.expressID
      );
      this.label = name;
      this.value = value;
    }
  }
}
