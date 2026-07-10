import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { CandidatePanel } from './components/CandidatePanel';

const PLUGIN_NAME = 'AMNCandidatePlugin';

export default class AMNCandidatePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    // AMN Branding: inject CSS to override Flex header/sidebar colors
    const style = document.createElement('style');
    style.textContent = `
      /* AMN Healthcare — navy header */
      .Twilio-MainHeader { background: #003B5C !important; }
      /* Sidebar */
      .Twilio-SideNav-default, [class*="SideNav__Container"] { background: #003B5C !important; }
      /* Icon buttons in sidebar */
      [class*="SideNav__Button"] { color: #fff !important; }
    `;
    document.head.appendChild(style);

    // Hide Panel2 (the right-side CRM / "Try Flex Unified Profiles" panel)
    // This is the documented API: componentProps.AgentDesktopView.showPanel2
    manager.updateConfig({
      componentProps: {
        AgentDesktopView: {
          showPanel2: false,
        },
      },
    });

    // Remove Flex's built-in "Task context" / "Customer context" sections from TaskInfoPanel
    // Key confirmed from TaskInfoPanelChildrenKeys enum in flex-ui source
    flex.TaskInfoPanel.Content.remove('content');

    // Replace Flex logo with AMN logo
    flex.MainHeader.Content.remove('logo');
    flex.MainHeader.Content.add(
      <img
        key="amn-logo"
        src={`${process.env.FLEX_APP_PUBLIC_URL || ''}/amn-logo.png`}
        alt="AMN Healthcare"
        style={{ height: 30, marginLeft: 16 }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />,
      { sortOrder: -1 }
    );

    // Add candidate panel to the task info panel (right column during active call)
    flex.TaskInfoPanel.Content.add(
      <CandidatePanelWrapper key="amn-candidate-panel" />,
      { sortOrder: 1 }
    );
  }
}

// Wrap with task context so CandidatePanel receives the live task object
const CandidatePanelWrapper = Flex.withTaskContext(
  ({ task }: { task: any }) => <CandidatePanel task={task} />
);
