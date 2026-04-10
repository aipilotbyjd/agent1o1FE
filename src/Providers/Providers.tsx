import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeContextProvider } from '@/context/themeContext';
import { AuthProvider } from '@/context/authContext';
import { WorkspaceProvider } from '@/context/workspaceContext';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

const Providers = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeContextProvider>
				<WorkspaceProvider>
					{/* <Outlet /> must be used in the innermost provider. */}
					<AuthProvider />
				</WorkspaceProvider>
			</ThemeContextProvider>
		</QueryClientProvider>
	);
};

export default Providers;
