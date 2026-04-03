import pages from '@/Routes/pages';
import { lazy } from 'react';

const WorkflowEditorPage = lazy(() => import('@/pages/editor/WorkflowEditor/WorkflowEditor.page'));
const StoryBuilderPage = lazy(() => import('@/pages/editor/StoryBuilder/StoryBuilder.page'));

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
