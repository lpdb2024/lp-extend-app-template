/**
 * Account Properties Interfaces
 * TypeScript interfaces for LivePerson Account Settings Properties API
 */

/**
 * Property value can be different types based on 'type' field
 * type 1: Boolean
 * type 2: String
 * type 3: Array
 * type 4: Object (complex JSON)
 */
export interface IPropertyValue {
  value: string | string[] | number | boolean | Record<string, unknown>;
}

/**
 * Account Property entity
 */
export interface IAccountProperty {
  id: string;
  createdDate?: string;
  modifiedDate?: string;
  type: number; // 1=Boolean, 2=String, 3=Array, 4=Object
  propertyValue: IPropertyValue;
  deleted: boolean;
}

/**
 * Request to create/update a property
 */
export interface ICreateAccountProperty {
  id: string;
  type: number;
  propertyValue: IPropertyValue;
}

/**
 * Request to update a property
 */
export interface IUpdateAccountProperty {
  id?: string;
  type?: number;
  propertyValue?: IPropertyValue;
}
