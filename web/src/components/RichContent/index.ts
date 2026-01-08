/**
 * RichContent Component Library
 * Renders LivePerson JSON Pollock structured content
 *
 * Usage:
 *   import { RichContent } from '@/components/RichContent';
 *   <RichContent :content="jsonPollockData" @action="handleAction" />
 */

export { default as RichContent } from './RichContent.vue';
export { default as RichContentElementComponent } from './RichContentElement.vue';

// Export all types
export type {
  // Actions
  PublishTextAction,
  LinkAction,
  NavigateAction,
  RichContentAction,
  // Metadata
  ExternalIdMetadata,
  ActionMetadata,
  RichContentMetadata,
  // Click Handler
  ClickHandler,
  // Styles
  TextStyle,
  ButtonStyle,
  // Accessibility
  WebAccessibility,
  Accessibility,
  // Base
  BaseElement,
  // Elements
  TextElement,
  ButtonElement,
  ImageElement,
  MapElement,
  SubmitButtonElement,
  CheckboxElement,
  DatePickerElement,
  // Containers
  VerticalContainer,
  HorizontalContainer,
  CarouselContainer,
  ListContainer,
  SectionListContainer,
  SectionContainer,
  ChecklistContainer,
  ButtonListContainer,
  // Union type for any element
  RichContentElement,
  // Root
  RichContentMessage,
  QuickReply,
  // Events
  RichContentClickEvent,
} from './types';
