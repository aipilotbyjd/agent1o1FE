import { createContext, useContext } from 'react';

interface IHighlightContext {
	highlightedNodeIds: string[];
	highlightedEdgeIds: string[];
}

export const HighlightContext = createContext<IHighlightContext>({
	highlightedNodeIds: [],
	highlightedEdgeIds: [],
});

export const useHighlight = () => useContext(HighlightContext);
