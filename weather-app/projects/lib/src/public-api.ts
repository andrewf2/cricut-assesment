/*
 * Public API Surface of lib
 */

// Store framework
export type { Action, ActionCreator } from './lib/store';
export { createAction } from './lib/store';
export { Store } from './lib/store';
export type { Reducer } from './lib/store';
export { createReducer, on } from './lib/store';
export { createSelector } from './lib/store';
export { Effects, ofType } from './lib/store';
export { withLoadingState } from './lib/store';
export type { LoadingResult } from './lib/store';
export { withRetryBackoff } from './lib/store';
export type { RetryBackoffConfig } from './lib/store';
export { DEFAULT_ERROR_MESSAGE } from './lib/store';

// Types
export type { LoadingState } from './lib/types/loading-state';
export { LOADING_STATE } from './lib/types/loading-state.const';

// Constants
export { TEMPERATURE_UNIT, DEFAULT_TEMPERATURE_UNIT } from './lib/pipes/temperature.const';
export { AGENT_ROLE } from './lib/ui/agent-chat/agent-chat.const';

// UI components
export { ErrorBannerComponent } from './lib/ui/error-banner/error-banner.component';
export { LoadingSkeletonComponent } from './lib/ui/loading-skeleton/loading-skeleton.component';
export { SearchInputComponent } from './lib/ui/search-input/search-input.component';
export { AgentChatComponent } from './lib/ui/agent-chat/agent-chat.component';
export type { AgentMessage } from './lib/ui/agent-chat/agent-chat.component';
export { ButtonComponent } from './lib/ui/button/button.component';
export { SpinnerComponent } from './lib/ui/spinner/spinner.component';

// Pipes
export { TemperaturePipe } from './lib/pipes/temperature.pipe';
