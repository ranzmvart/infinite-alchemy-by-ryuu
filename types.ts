
export interface AlchemyElement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color?: string; // Hex color code
  isNew?: boolean; // For highlighting newly discovered items
}

export interface WorkspaceElement extends AlchemyElement {
  instanceId: string; // Unique ID for this specific instance on the board
  x: number;
  y: number;
  isLoading?: boolean; // If it's currently being combined
}

export interface CombinationResult {
  success: boolean;
  element?: AlchemyElement;
}

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  timestamp: number;
  elements: WorkspaceElement[];
}
