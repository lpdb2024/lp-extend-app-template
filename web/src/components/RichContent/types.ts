/**
 * LivePerson Structured Content / JSON Pollock Types
 * Based on: https://developers.liveperson.com/getting-started-with-rich-messaging-introduction.html
 */

// ============================================================================
// Action Types
// ============================================================================

export interface PublishTextAction {
  type: 'publishText';
  text: string;
}

export interface LinkAction {
  type: 'link';
  uri: string;
  target?: 'self' | 'blank' | 'slideout';
  name?: string;
}

export interface NavigateAction {
  type: 'navigate';
  la: number; // latitude
  lo: number; // longitude
  name?: string;
}

export type RichContentAction = PublishTextAction | LinkAction | NavigateAction;

// ============================================================================
// Metadata Types
// ============================================================================

export interface ExternalIdMetadata {
  type: 'ExternalId';
  id: string;
}

export interface ActionMetadata {
  type: 'Action';
  id: string;
}

export type RichContentMetadata = ExternalIdMetadata | ActionMetadata | Record<string, unknown>;

// ============================================================================
// Click Handler
// ============================================================================

export interface ClickHandler {
  actions: RichContentAction[];
  metadata?: RichContentMetadata[];
}

// ============================================================================
// Style Types
// ============================================================================

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  'background-color'?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface ButtonStyle {
  'background-color'?: string;
  color?: string;
  'border-color'?: string;
  'border-radius'?: number;
  size?: 'small' | 'medium' | 'large';
}

// ============================================================================
// Accessibility
// ============================================================================

export interface WebAccessibility {
  tabindex?: string;
  role?: string;
  'aria-label'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export interface Accessibility {
  web?: WebAccessibility;
}

// ============================================================================
// Base Element
// ============================================================================

export interface BaseElement {
  type: string;
  tag?: string;
  tooltip?: string;
  accessibility?: Accessibility;
  alt?: string;
  rtl?: boolean;
}

// ============================================================================
// Element Types
// ============================================================================

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  style?: TextStyle;
}

export interface ButtonElement extends BaseElement {
  type: 'button';
  title: string;
  click?: ClickHandler;
  style?: ButtonStyle;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  caption?: string;
  click?: ClickHandler;
}

export interface MapElement extends BaseElement {
  type: 'map';
  la: number; // latitude
  lo: number; // longitude
  click?: ClickHandler;
}

export interface SubmitButtonElement extends BaseElement {
  type: 'submitButton';
  title: string;
  disabled?: boolean;
  click?: ClickHandler;
  style?: ButtonStyle;
}

export interface CheckboxElement extends BaseElement {
  type: 'checkbox';
  text: string;
  borderLine?: boolean;
  borderColor?: string;
  checked?: boolean;
  click?: ClickHandler;
}

export interface DatePickerElement extends BaseElement {
  type: 'datePicker';
  class?: string;
  style?: {
    size?: 'small' | 'medium' | 'large';
  };
}

// ============================================================================
// Container Types
// ============================================================================

export interface VerticalContainer extends BaseElement {
  type: 'vertical';
  elements: RichContentElement[];
  border?: 'border' | 'borderLess' | 'dropShadow';
  tag?: 'title' | 'subtitle' | 'generic';
}

export interface HorizontalContainer extends BaseElement {
  type: 'horizontal';
  elements: RichContentElement[];
  percentages?: number[];
}

export interface CarouselContainer extends BaseElement {
  type: 'carousel';
  elements: RichContentElement[];
  padding?: number;
}

export interface ListContainer extends BaseElement {
  type: 'list';
  elements: RichContentElement[];
}

export interface SectionListContainer extends BaseElement {
  type: 'sectionList';
  elements: RichContentElement[];
}

export interface SectionContainer extends BaseElement {
  type: 'section';
  sectionID?: string;
  elements: RichContentElement[];
}

export interface ChecklistContainer extends BaseElement {
  type: 'checklist';
  elements: RichContentElement[];
}

export interface ButtonListContainer extends BaseElement {
  type: 'buttonList';
  elements: RichContentElement[];
}

// ============================================================================
// Union Types
// ============================================================================

export type RichContentElement =
  | TextElement
  | ButtonElement
  | ImageElement
  | MapElement
  | SubmitButtonElement
  | CheckboxElement
  | DatePickerElement
  | VerticalContainer
  | HorizontalContainer
  | CarouselContainer
  | ListContainer
  | SectionListContainer
  | SectionContainer
  | ChecklistContainer
  | ButtonListContainer;

// ============================================================================
// Root Structure
// ============================================================================

export interface RichContentMessage {
  type: 'vertical' | 'horizontal' | 'carousel';
  elements: RichContentElement[];
  metadata?: RichContentMetadata[];
  quickReplies?: QuickReply[];
  tag?: string;
  border?: 'border' | 'borderLess' | 'dropShadow';
  padding?: number;
  percentages?: number[];
}

export interface QuickReply {
  type: 'button';
  title: string;
  tooltip?: string;
  click: ClickHandler;
}

// ============================================================================
// Event Types
// ============================================================================

export interface RichContentClickEvent {
  action: RichContentAction;
  metadata?: RichContentMetadata[];
  element: RichContentElement;
}
