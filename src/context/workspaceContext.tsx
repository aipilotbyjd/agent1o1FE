import {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
	useCallback,
	ReactNode,
} from 'react';
import type { TWorkspace } from '@/types/workspace.type';
import { useFetchWorkspaces } from '@/api/hooks/useWorkspaces';

const WORKSPACE_STORAGE_KEY = 'a1o1_current_workspace';

export interface IWorkspaceContextProps {
	currentWorkspace: TWorkspace | null;
	workspaces: TWorkspace[];
	isLoading: boolean;
	isError: boolean;
	setCurrentWorkspace: (workspace: TWorkspace | null) => void;
	switchWorkspace: (workspaceId: string) => void;
	refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<IWorkspaceContextProps>({} as IWorkspaceContextProps);

interface WorkspaceProviderProps {
	children: ReactNode;
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
	const [currentWorkspace, setCurrentWorkspaceState] = useState<TWorkspace | null>(null);

	const {
		data: workspaces = [],
		isLoading,
		isError,
		refetch,
	} = useFetchWorkspaces();

	// Load stored workspace ID on mount
	useEffect(() => {
		const storedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
		if (storedWorkspaceId && workspaces.length > 0) {
			const found = workspaces.find((ws) => ws.id === storedWorkspaceId);
			if (found) {
				setCurrentWorkspaceState(found);
			} else {
				setCurrentWorkspaceState(workspaces[0]);
				localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaces[0].id);
			}
		} else if (workspaces.length > 0 && !currentWorkspace) {
			setCurrentWorkspaceState(workspaces[0]);
			localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaces[0].id);
		}
	}, [workspaces, currentWorkspace]);

	const setCurrentWorkspace = (workspace: TWorkspace | null) => {
		setCurrentWorkspaceState(workspace);
		if (workspace) {
			localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace.id);
		} else {
			localStorage.removeItem(WORKSPACE_STORAGE_KEY);
		}
	};

	const switchWorkspace = useCallback(
		(workspaceId: string) => {
			const workspace = workspaces.find((ws) => ws.id === workspaceId);
			if (workspace) {
				setCurrentWorkspace(workspace);
			}
		},
		[workspaces],
	);

	const value = useMemo(
		() => ({
			currentWorkspace,
			workspaces,
			isLoading,
			isError,
			setCurrentWorkspace,
			switchWorkspace,
			refetchWorkspaces: refetch,
		}),
		[currentWorkspace, workspaces, isLoading, isError, refetch, switchWorkspace],
	);

	return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => {
	const context = useContext(WorkspaceContext);
	if (!context) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider');
	}
	return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrentWorkspaceId = (): string | null => {
	const { currentWorkspace } = useWorkspace();
	return currentWorkspace?.id ?? null;
};
