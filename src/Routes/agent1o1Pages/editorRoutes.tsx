import pages from '@/Routes/pages';
import { lazy } from 'react';

const WorkflowEditorPage = lazy(() => import('@/pages/UnderConstruction.page'));
const StoryBuilderPage = lazy(() => import('@/pages/UnderConstruction.page'));

const EditorRoutes = [
	{
		path: pages.app.appMain.subPages.editor.subPages.flowEditor.to,
		element: <WorkflowEditorPage />,
	},
	{
		path: pages.app.appMain.subPages.editor.subPages.storyBuilder.to,
		element: <StoryBuilderPage />,
	},
];

export default EditorRoutes;
