/**
 * Account Config Module
 * Aggregates all AccountConfig domain API modules
 * Domain: accountConfigReadOnly / accountConfigReadWrite
 */

import { Module } from '@nestjs/common';
import { AgentGroupsModule } from './agent-groups/agent-groups.module';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { LobsModule } from './lobs/lobs.module';
import { PredefinedContentModule } from './predefined-content/predefined-content.module';
import { AutomaticMessagesModule } from './automatic-messages/automatic-messages.module';
import { WorkingHoursModule } from './working-hours/working-hours.module';
import { SpecialOccasionsModule } from './special-occasions/special-occasions.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { EngagementsModule } from './engagements/engagements.module';
import { GoalsModule } from './goals/goals.module';
import { VisitorBehaviorsModule } from './visitor-behaviors/visitor-behaviors.module';
import { VisitorProfilesModule } from './visitor-profiles/visitor-profiles.module';
import { OnsiteLocationsModule } from './onsite-locations/onsite-locations.module';
import { WindowConfigurationsModule } from './window-configurations/window-configurations.module';
import { AppInstallationsModule } from './app-installations/app-installations.module';
import { WidgetsModule } from './widgets/widgets.module';
import { AccountPropertiesModule } from './account-properties/account-properties.module';
import { AccountFeaturesModule } from './account-features/account-features.module';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [
    LPSharedModule,
    // Contact Center Management
    AgentGroupsModule,
    SkillsModule,
    UsersModule,
    ProfilesModule,
    LobsModule,
    PredefinedContentModule,
    AutomaticMessagesModule,
    WorkingHoursModule,
    SpecialOccasionsModule,
    // Campaign Management
    CampaignsModule,
    EngagementsModule,
    GoalsModule,
    VisitorBehaviorsModule,
    VisitorProfilesModule,
    OnsiteLocationsModule,
    WindowConfigurationsModule,
    // App Management
    AppInstallationsModule,
    // UI Personalization
    WidgetsModule,
    // Account Settings
    AccountPropertiesModule,
    AccountFeaturesModule,
  ],
  exports: [
    // Contact Center Management
    AgentGroupsModule,
    SkillsModule,
    UsersModule,
    ProfilesModule,
    LobsModule,
    PredefinedContentModule,
    AutomaticMessagesModule,
    WorkingHoursModule,
    SpecialOccasionsModule,
    // Campaign Management
    CampaignsModule,
    EngagementsModule,
    GoalsModule,
    VisitorBehaviorsModule,
    VisitorProfilesModule,
    OnsiteLocationsModule,
    WindowConfigurationsModule,
    // App Management
    AppInstallationsModule,
    // UI Personalization
    WidgetsModule,
    // Account Settings
    AccountPropertiesModule,
    AccountFeaturesModule,
  ],
})
export class AccountConfigModule {}
